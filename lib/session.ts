// Sessione SOLO server: le credenziali IMAP/SMTP dell'utente (inclusa l'app-password)
// vivono esclusivamente in un cookie httpOnly CIFRATO (AES-256-GCM). Mai nel DB,
// mai esposte al client JS. La chiave deriva da AUTH_SECRET.
import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

export type MailCreds = {
  email: string;
  password: string; // app-password (non la password normale dell'account)
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
};

const COOKIE = "omu_session";
const ALG = "aes-256-gcm";

function key(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET mancante");
  // 32 byte derivati dal secret
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(data: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key(), iv);
  const plaintext = Buffer.from(JSON.stringify(data), "utf8");
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // formato: iv.tag.ciphertext (base64url)
  return [iv, tag, enc].map((b) => b.toString("base64url")).join(".");
}

function decrypt(token: string): MailCreds | null {
  try {
    const [ivB, tagB, encB] = token.split(".");
    if (!ivB || !tagB || !encB) return null;
    const decipher = crypto.createDecipheriv(ALG, key(), Buffer.from(ivB, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB, "base64url"));
    const dec = Buffer.concat([decipher.update(Buffer.from(encB, "base64url")), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as MailCreds;
  } catch {
    return null;
  }
}

/** Salva le credenziali nel cookie cifrato (chiamare da una route handler / server action). */
export async function setSession(creds: MailCreds): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encrypt(creds), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
  });
}

/** Legge e decifra le credenziali dal cookie. null se assente/non valido. */
export async function getSession(): Promise<MailCreds | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  return decrypt(raw);
}

/** Cancella la sessione (logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
