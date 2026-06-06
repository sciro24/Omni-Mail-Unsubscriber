export type UnsubscribeMethod = "one-click" | "mailto" | "link" | "unknown";

export type UnsubscribeStatus = "idle" | "loading" | "success" | "failed";

export type Subscription = {
  id: string;                    // base64 dell'email mittente (usato come key React)
  senderName: string;            // Nome display del mittente
  senderEmail: string;           // Indirizzo email mittente
  count: number;                 // Numero di email ricevute da questo sender
  lastReceived: string;          // ISO date ultima email ricevuta
  method: UnsubscribeMethod;
  unsubscribeUrl?: string;       // URL per one-click o link
  unsubscribeMailto?: string;    // Indirizzo per fallback mailto
};

export type UnsubscribeResult = {
  id: string;
  status: "success" | "failed";
  error?: string;
};
