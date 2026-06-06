const GRAPH_API = "https://graph.microsoft.com/v1.0";

type Header = { name: string; value: string };

/**
 * Cerca i messaggi che parlano di "unsubscribe" nella casella Outlook/Microsoft 365.
 * Restituisce gli ID, con paginazione via @odata.nextLink fino a maxMessages.
 */
export async function fetchUnsubscribeMessages(
  accessToken: string,
  maxMessages = 1500
): Promise<string[]> {
  const ids: string[] = [];
  // $search non ammette $orderby/$skip → si pagina con nextLink.
  let url: string | undefined =
    `${GRAPH_API}/me/messages?$search=%22unsubscribe%22&$select=id&$top=100`;

  while (url && ids.length < maxMessages) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ConsistencyLevel: "eventual",
      },
    });
    if (!res.ok) break;
    const data: { value?: { id: string }[]; "@odata.nextLink"?: string } = await res.json();
    if (Array.isArray(data.value)) ids.push(...data.value.map((m) => m.id));
    url = data["@odata.nextLink"];
  }

  return ids.slice(0, maxMessages);
}

/**
 * Recupera gli header internet di un messaggio + mittente/data, normalizzati nello
 * stesso formato di Gmail ({ payload: { headers: [{name,value}] } }) così il parsing
 * a valle è identico per i due provider.
 */
export async function fetchMessageMetadata(
  accessToken: string,
  messageId: string
): Promise<{ payload?: { headers?: Header[] } }> {
  const res = await fetch(
    `${GRAPH_API}/me/messages/${messageId}?$select=internetMessageHeaders,from,receivedDateTime`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) return { payload: { headers: [] } };
  const data = await res.json();

  const headers: Header[] = Array.isArray(data.internetMessageHeaders)
    ? data.internetMessageHeaders.map((h: { name: string; value: string }) => ({
        name: h.name,
        value: h.value,
      }))
    : [];

  // Garantisci From e Date anche se non presenti tra gli internetMessageHeaders.
  const hasFrom = headers.some((h) => h.name.toLowerCase() === "from");
  if (!hasFrom && data.from?.emailAddress) {
    const { name, address } = data.from.emailAddress;
    headers.push({ name: "From", value: name ? `${name} <${address}>` : address });
  }
  const hasDate = headers.some((h) => h.name.toLowerCase() === "date");
  if (!hasDate && data.receivedDateTime) {
    headers.push({ name: "Date", value: data.receivedDateTime });
  }

  return { payload: { headers } };
}

/**
 * Invia una email vuota all'indirizzo mailto di unsubscribe tramite Graph /sendMail.
 */
export async function sendUnsubscribeEmail(
  accessToken: string,
  to: string
): Promise<boolean> {
  const res = await fetch(`${GRAPH_API}/me/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: "Unsubscribe",
        body: { contentType: "Text", content: "" },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: false,
    }),
  });
  return res.ok;
}
