import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchUnsubscribeMessages, fetchMessageMetadata } from "@/lib/mail";
import type { Subscription, UnsubscribeMethod } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = session.provider;

  // 1. Recupera tutti i message ID con List-Unsubscribe
  const messageIds = await fetchUnsubscribeMessages(provider, session.accessToken);

  // 2. Fetch metadata in parallelo (batch di 20 alla volta per non stressare l'API)
  const BATCH_SIZE = 20;
  const allMetadata = [];
  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batch = messageIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((id) => fetchMessageMetadata(provider, session.accessToken!, id))
    );
    allMetadata.push(...results);
  }

  // 3. Raggruppa per sender e parsea header
  const senderMap = new Map<string, Subscription>();

  for (const msg of allMetadata) {
    const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
    const get = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

    const fromRaw = get("From");
    const dateRaw = get("Date");
    const unsubHeader = get("List-Unsubscribe");
    const unsubPost = get("List-Unsubscribe-Post");

    if (!unsubHeader) continue;

    // Parse "Nome Cognome <email@domain.com>" oppure "email@domain.com"
    const emailMatch = fromRaw.match(/<(.+?)>/) || fromRaw.match(/(\S+@\S+)/);
    const senderEmail = emailMatch?.[1]?.toLowerCase() ?? fromRaw.toLowerCase();
    const senderName =
      fromRaw.replace(/<.+?>/, "").trim().replace(/^"|"$/g, "") || senderEmail;

    // Parse List-Unsubscribe: può contenere <https://...> e/o <mailto:...>
    const urlMatch = unsubHeader.match(/<(https?:\/\/[^>]+)>/);
    const mailtoMatch = unsubHeader.match(/<mailto:([^>]+)>/);

    // Determina metodo ottimale
    let method: UnsubscribeMethod = "unknown";
    if (urlMatch && unsubPost?.includes("List-Unsubscribe=One-Click")) {
      method = "one-click";
    } else if (urlMatch) {
      method = "link";
    } else if (mailtoMatch) {
      method = "mailto";
    }

    const existing = senderMap.get(senderEmail);
    if (existing) {
      existing.count += 1;
      // Mantieni la data più recente
      if (new Date(dateRaw) > new Date(existing.lastReceived)) {
        existing.lastReceived = dateRaw;
      }
    } else {
      senderMap.set(senderEmail, {
        id: Buffer.from(senderEmail).toString("base64"),
        senderName,
        senderEmail,
        count: 1,
        lastReceived: dateRaw,
        method,
        unsubscribeUrl: urlMatch?.[1],
        unsubscribeMailto: mailtoMatch?.[1],
      });
    }
  }

  // 4. Ordina per count discendente
  const subscriptions = Array.from(senderMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return NextResponse.json({ subscriptions });
}
