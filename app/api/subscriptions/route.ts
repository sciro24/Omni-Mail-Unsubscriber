import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { scanSubscriptions } from "@/lib/imap";

// La scansione IMAP può richiedere qualche secondo su caselle grandi.
export const maxDuration = 60;

export async function GET() {
  const creds = await getSession();
  if (!creds) {
    return NextResponse.json({ error: "reauth" }, { status: 401 });
  }

  try {
    const subscriptions = await scanSubscriptions(creds);
    return NextResponse.json({ subscriptions });
  } catch {
    // Connessione IMAP fallita (credenziali non più valide / server down)
    return NextResponse.json({ error: "scan-failed" }, { status: 502 });
  }
}
