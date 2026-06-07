import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase, KEPT_TABLE } from "@/lib/supabase";
import type { KeptEntry } from "@/lib/kept";

type Row = {
  user_email: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  kept_at: string;
};

function rowToEntry(r: Row): KeptEntry {
  return { id: r.sender_id, email: r.sender_email, name: r.sender_name, keptAt: r.kept_at };
}

async function userEmail() {
  const creds = await getSession();
  return creds?.email ?? null;
}

export async function GET() {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from(KEPT_TABLE)
    .select("*")
    .eq("user_email", email)
    .order("kept_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const kept: Record<string, KeptEntry> = {};
  for (const r of (data ?? []) as Row[]) kept[r.sender_id] = rowToEntry(r);
  return NextResponse.json({ kept });
}

export async function POST(req: NextRequest) {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entry }: { entry: KeptEntry } = await req.json();
  if (!entry) return NextResponse.json({ ok: true });

  const row: Row = {
    user_email: email,
    sender_id: entry.id,
    sender_email: entry.email,
    sender_name: entry.name,
    kept_at: entry.keptAt,
  };

  const { error } = await getSupabase()
    .from(KEPT_TABLE)
    .upsert(row, { onConflict: "user_email,sender_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const email = await userEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  const { error } = await getSupabase()
    .from(KEPT_TABLE)
    .delete()
    .eq("user_email", email)
    .eq("sender_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
