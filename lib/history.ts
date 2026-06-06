// Storico disiscrizioni — ora persistito su Supabase (cross-device), legato
// all'email dell'utente NextAuth. Questo modulo è il client lato browser che
// parla con le API route /api/history.

export type HistoryEntry = {
  id: string;             // base64 dell'email mittente (stesso id della Subscription)
  email: string;
  name: string;
  count: number;
  method: string;
  lastReceived: string;   // ISO date ultima email ricevuta
  unsubscribedAt: string; // ISO date in cui si è cliccato unsubscribe
  unsubscribeUrl?: string; // pagina di disiscrizione del mittente (per "Verifica")
};

export type History = Record<string, HistoryEntry>;

/** Carica lo storico dell'utente dal DB. */
export async function fetchHistory(): Promise<History> {
  try {
    const res = await fetch("/api/history", { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    return data.history ?? {};
  } catch {
    return {};
  }
}

/** Upsert di una o più voci sul DB. */
export async function pushHistory(entries: HistoryEntry[]): Promise<boolean> {
  if (!entries.length) return true;
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Rimuove una voce (es. "Ri-iscriviti"). */
export async function deleteHistory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Svuota tutto lo storico dell'utente. */
export async function clearAllHistory(): Promise<boolean> {
  try {
    const res = await fetch("/api/history?all=1", { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
