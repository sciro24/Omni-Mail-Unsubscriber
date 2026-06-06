// Astrazione provider: instrada le chiamate verso Gmail o Microsoft Graph
// in base al provider con cui l'utente ha effettuato il login.
import * as gmail from "./gmail";
import * as graph from "./graph";

export type Provider = "google" | "microsoft-entra-id";

function api(provider?: string) {
  return provider === "microsoft-entra-id" ? graph : gmail;
}

export function fetchUnsubscribeMessages(provider: string | undefined, accessToken: string, max?: number) {
  return api(provider).fetchUnsubscribeMessages(accessToken, max);
}

export function fetchMessageMetadata(provider: string | undefined, accessToken: string, messageId: string) {
  return api(provider).fetchMessageMetadata(accessToken, messageId);
}

export function sendUnsubscribeEmail(provider: string | undefined, accessToken: string, to: string) {
  return api(provider).sendUnsubscribeEmail(accessToken, to);
}
