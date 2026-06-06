import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabase, UNSUB_TABLE } from "@/lib/supabase";
import type { HistoryEntry } from "@/lib/history";

// Riga DB <-> HistoryEntry
type Row = {
  user_email: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  count: number;
  method: string;
  unsubscribe_url: string | null;
  last_received: string | null;
  unsubscribed_at: string;
};

function rowToEntry(r: Row): HistoryEntry {
  return {
    id: r.sender_id,
    email: r.sender_email,
    name: r.sender_name,
    count: r.count,
    method: r.method,
    lastReceived: r.last_received ?? "",
    unsubscribedAt: r.unsubscribed_at,
    unsubscribeUrl: r.unsubscribe_url ?? undefined,
  };
}

function entryToRow(userEmail: string, e: HistoryEntry): Row {
  return {
    user_email: userEmail,
    sender_id: e.id,
    sender_email: e.email,
    sender_name: e.name,
    count: e.count,
    method: e.method,
    unsubscribe_url: e.unsubscribeUrl ?? null,
    last_received: e.lastReceived || null,
    unsubscribed_at: e.unsubscribedAt,
  };
}

async function userEmail() {
  const session = await auth();
  return session?.user?.email ?? null;
}

// GET → tutte le disiscrizioni dell'utente
export async function GET() {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from(UNSUB_TABLE)
    .select("*")
    .eq("user_email", email)
    .order("unsubscribed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const history: Record<string, HistoryEntry> = {};
  for (const r of (data ?? []) as Row[]) history[r.sender_id] = rowToEntry(r);
  return NextResponse.json({ history });
}

// POST { entries: HistoryEntry[] } → upsert
export async function POST(req: NextRequest) {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entries }: { entries: HistoryEntry[] } = await req.json();
  if (!entries?.length) return NextResponse.json({ ok: true });

  const rows = entries.map((e) => entryToRow(email, e));
  const { error } = await getSupabase()
    .from(UNSUB_TABLE)
    .upsert(rows, { onConflict: "user_email,sender_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE ?id=<senderId>  oppure  ?all=1
export async function DELETE(req: NextRequest) {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");
  const id = searchParams.get("id");

  let q = getSupabase().from(UNSUB_TABLE).delete().eq("user_email", email);
  if (!all) {
    if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });
    q = q.eq("sender_id", id);
  }
  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
