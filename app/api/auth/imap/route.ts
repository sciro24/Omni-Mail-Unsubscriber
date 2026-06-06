import { NextRequest, NextResponse } from "next/server";
import { setSession, getSession, clearSession, type MailCreds } from "@/lib/session";
import { verifyCreds } from "@/lib/imap";
import { presetFor } from "@/lib/providers";

// Scansione IMAP può richiedere qualche secondo: alza il limite serverless.
export const maxDuration = 60;

// GET → stato sessione corrente (solo email, mai la password)
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { email: s.email } });
}

// POST → login. Body: { email, password, imapHost?, imapPort?, smtpHost?, smtpPort? }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email: string = (body?.email ?? "").trim().toLowerCase();
  const password: string = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "missing-credentials" }, { status: 400 });
  }

  // host: preset dal dominio, o presi dal body per provider sconosciuti
  const preset = presetFor(email);
  const imapHost: string = (body?.imapHost ?? preset?.imapHost ?? "").trim();
  const smtpHost: string = (body?.smtpHost ?? preset?.smtpHost ?? "").trim();
  const imapPort = Number(body?.imapPort ?? preset?.imapPort ?? 993);
  const smtpPort = Number(body?.smtpPort ?? preset?.smtpPort ?? 465);

  if (!imapHost || !smtpHost) {
    // dominio sconosciuto e host non forniti → la UI deve chiedere gli host
    return NextResponse.json({ error: "need-hosts" }, { status: 422 });
  }

  const creds: MailCreds = { email, password, imapHost, imapPort, smtpHost, smtpPort };

  // Verifica reale: prova a connettersi all'IMAP
  const ok = await verifyCreds(creds);
  if (!ok) {
    return NextResponse.json({ error: "auth-failed" }, { status: 401 });
  }

  await setSession(creds);
  return NextResponse.json({ user: { email } });
}

// DELETE → logout
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
