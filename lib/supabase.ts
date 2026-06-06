import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client SOLO lato server: usa la service_role key, mai esporla al browser.
// L'autorizzazione avviene tramite la sessione NextAuth nelle API routes,
// non tramite RLS, quindi va usato esclusivamente in route handler server-side.
// Creazione LAZY: evita di lanciare al import-time durante il build se le env
// non sono ancora impostate.

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local");
  }
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const UNSUB_TABLE = "unsubscribes";
