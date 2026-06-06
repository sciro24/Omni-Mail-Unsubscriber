const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

/**
 * Recupera tutti i message ID che contengono header List-Unsubscribe.
 * Usa paginazione automatica fino a maxMessages.
 */
export async function fetchUnsubscribeMessages(
  accessToken: string,
  maxMessages = 1500
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      // L'header List-Unsubscribe NON è indicizzato dalla ricerca full-text di Gmail,
      // quindi usarlo come query perde la maggior parte delle newsletter.
      // "unsubscribe" compare nel footer di quasi ogni mailing list → rete molto più ampia.
      // Il filtro reale sull'header avviene poi lato parsing (scarta i msg senza header).
      q: "unsubscribe OR list-unsubscribe",
      maxResults: "100",
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${GMAIL_API}/users/me/messages?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (data.messages) ids.push(...data.messages.map((m: { id: string }) => m.id));
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < maxMessages);

  return ids.slice(0, maxMessages);
}

/**
 * Recupera solo gli header di un singolo messaggio (niente body → economico in quota).
 */
export async function fetchMessageMetadata(
  accessToken: string,
  messageId: string
): Promise<{ payload?: { headers?: { name: string; value: string }[] } }> {
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=List-Unsubscribe&metadataHeaders=List-Unsubscribe-Post`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.json();
}

/**
 * Invia una email vuota all'indirizzo mailto di unsubscribe.
 */
export async function sendUnsubscribeEmail(
  accessToken: string,
  to: string
): Promise<boolean> {
  const raw = Buffer.from(`To: ${to}\r\nSubject: Unsubscribe\r\n\r\n`)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(`${GMAIL_API}/users/me/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  return res.ok;
}
