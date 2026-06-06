// Backend IMAP/SMTP: sostituisce le API Gmail/Graph (OAuth) con accesso diretto
// via app-password. Legge SOLO gli header (mai il corpo) e invia la mail di
// disiscrizione mailto via SMTP. Tutto server-side.
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import type { Subscription, UnsubscribeMethod } from "./types";
import type { MailCreds } from "./session";

const MAX_MESSAGES = 1500;
const SCAN_SINCE_DAYS = 365;

function makeClient(c: MailCreds): ImapFlow {
  return new ImapFlow({
    host: c.imapHost,
    port: c.imapPort,
    secure: c.imapPort === 993,
    auth: { user: c.email, pass: c.password },
    logger: false,
    emitLogs: false,
  });
}

/** Verifica le credenziali: prova a connettersi e fa logout. Per il login. */
export async function verifyCreds(c: MailCreds): Promise<boolean> {
  const client = makeClient(c);
  try {
    await client.connect();
    await client.logout();
    return true;
  } catch {
    try { await client.close(); } catch {}
    return false;
  }
}

/** Estrae il valore di un header dal blob raw (gestisce il folding multi-riga). */
function extractHeader(raw: string, name: string): string {
  const unfolded = raw.replace(/\r?\n[ \t]+/g, " ");
  const re = new RegExp(`^${name}:\\s*(.*)$`, "im");
  return unfolded.match(re)?.[1]?.trim() ?? "";
}

/** Scansiona la INBOX e costruisce le Subscription raggruppate per mittente. */
export async function scanSubscriptions(c: MailCreds): Promise<Subscription[]> {
  const client = makeClient(c);
  await client.connect();
  const senderMap = new Map<string, Subscription>();

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const since = new Date(Date.now() - SCAN_SINCE_DAYS * 86400000);
      // Solo i messaggi che HANNO l'header List-Unsubscribe (newsletter/mailing list)
      const uids = (await client.search(
        { header: { "list-unsubscribe": "" }, since },
        { uid: true }
      )) || [];
      if (!uids.length) return [];

      // i più recenti = UID più alti → prendi la coda
      const limited = uids.slice(-MAX_MESSAGES);

      for await (const msg of client.fetch(
        limited,
        { uid: true, envelope: true, internalDate: true, headers: ["list-unsubscribe", "list-unsubscribe-post"] },
        { uid: true }
      )) {
        const raw = msg.headers?.toString("utf8") ?? "";
        const unsubHeader = extractHeader(raw, "list-unsubscribe");
        if (!unsubHeader) continue;
        const unsubPost = extractHeader(raw, "list-unsubscribe-post");

        const from = msg.envelope?.from?.[0];
        const senderEmail = (from?.address ?? "").toLowerCase();
        if (!senderEmail) continue;
        const senderName = from?.name?.trim() || senderEmail;
        const rawDate = msg.internalDate ?? msg.envelope?.date ?? new Date();
        const dateIso = new Date(rawDate).toISOString();

        const urlMatch = unsubHeader.match(/<(https?:\/\/[^>]+)>/);
        const mailtoMatch = unsubHeader.match(/<mailto:([^>]+)>/);

        let method: UnsubscribeMethod = "unknown";
        if (urlMatch && unsubPost.includes("List-Unsubscribe=One-Click")) method = "one-click";
        else if (urlMatch) method = "link";
        else if (mailtoMatch) method = "mailto";

        const existing = senderMap.get(senderEmail);
        if (existing) {
          existing.count += 1;
          if (new Date(dateIso) > new Date(existing.lastReceived)) existing.lastReceived = dateIso;
        } else {
          senderMap.set(senderEmail, {
            id: Buffer.from(senderEmail).toString("base64"),
            senderName,
            senderEmail,
            count: 1,
            lastReceived: dateIso,
            method,
            unsubscribeUrl: urlMatch?.[1],
            unsubscribeMailto: mailtoMatch?.[1],
          });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }

  return Array.from(senderMap.values()).sort((a, b) => b.count - a.count);
}

/** Invia la mail di disiscrizione (mailto) via SMTP con le credenziali utente. */
export async function sendUnsubscribeEmail(c: MailCreds, to: string): Promise<boolean> {
  try {
    const transport = nodemailer.createTransport({
      host: c.smtpHost,
      port: c.smtpPort,
      secure: c.smtpPort === 465,
      auth: { user: c.email, pass: c.password },
    });
    await transport.sendMail({
      from: c.email,
      to,
      subject: "Unsubscribe",
      text: "Unsubscribe",
    });
    return true;
  } catch {
    return false;
  }
}
