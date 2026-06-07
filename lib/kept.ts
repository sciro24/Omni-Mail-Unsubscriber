export type KeptEntry = {
  id: string;
  email: string;
  name: string;
  keptAt: string;
};

export type Kept = Record<string, KeptEntry>;

export async function fetchKept(): Promise<Kept> {
  try {
    const res = await fetch("/api/kept", { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    return data.kept ?? {};
  } catch {
    return {};
  }
}

export async function pushKept(entry: KeptEntry): Promise<boolean> {
  try {
    const res = await fetch("/api/kept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteKept(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/kept?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}
