import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendUnsubscribeEmail } from "@/lib/imap";

export const maxDuration = 60;

type UnsubscribePayload = {
  items: {
    id: string;
    method: string;
    unsubscribeUrl?: string;
    unsubscribeMailto?: string;
  }[];
};

// status: "success" = fatto lato server | "needs-manual" = apri il link nel browser
//         "failed" = nessun modo automatico riuscito
type Result = {
  id: string;
  status: "success" | "needs-manual" | "failed";
  url?: string;       // pagina da aprire (manuale o verifica)
  verifyUrl?: string; // link che l'utente può aprire per CONFERMARE la disiscrizione
  error?: string;
};

async function oneClickPost(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Alcuni endpoint rifiutano richieste senza UA "da browser".
        "User-Agent": "Mozilla/5.0 (compatible; UnsubscribeManager/1.0)",
      },
      body: "List-Unsubscribe=One-Click",
      redirect: "follow",
      signal: controller.signal,
    });
    // Molti server rispondono 200/202/204 o redirigono. Consideriamo ok < 400.
    return res.ok || res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  const creds = await getSession();
  if (!creds) {
    return NextResponse.json({ error: "reauth" }, { status: 401 });
  }

  const { items }: UnsubscribePayload = await req.json();

  const results: Result[] = await Promise.all(
    items.map(async (item): Promise<Result> => {
      try {
        switch (item.method) {
          case "one-click": {
            const ok = await oneClickPost(item.unsubscribeUrl!);
            if (ok) return { id: item.id, status: "success", verifyUrl: item.unsubscribeUrl };
            // Fallback: invece di un errore secco, chiediamo apertura manuale del link.
            return { id: item.id, status: "needs-manual", url: item.unsubscribeUrl, verifyUrl: item.unsubscribeUrl };
          }

          case "mailto": {
            const sent = await sendUnsubscribeEmail(creds, item.unsubscribeMailto!);
            if (sent) return { id: item.id, status: "success" };
            return { id: item.id, status: "failed", error: "Invio email non riuscito" };
          }

          case "link":
            return { id: item.id, status: "needs-manual", url: item.unsubscribeUrl, verifyUrl: item.unsubscribeUrl };

          default:
            // Ultimo tentativo: se c'è un URL, apertura manuale.
            if (item.unsubscribeUrl)
              return { id: item.id, status: "needs-manual", url: item.unsubscribeUrl, verifyUrl: item.unsubscribeUrl };
            return { id: item.id, status: "failed", error: "Nessun metodo di disiscrizione disponibile" };
        }
      } catch (e) {
        return { id: item.id, status: "failed", error: e instanceof Error ? e.message : "Errore sconosciuto" };
      }
    })
  );

  return NextResponse.json({ results });
}
