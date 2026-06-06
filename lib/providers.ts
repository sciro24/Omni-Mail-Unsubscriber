// Preset IMAP/SMTP per i provider più comuni, ricavati dal dominio dell'email.
// Per i domini non noti l'utente inserisce gli host a mano.

export type HostPreset = {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
};

// chiave = dominio (o famiglia di domini) → host
const PRESETS: Record<string, HostPreset> = {
  "gmail.com":      { imapHost: "imap.gmail.com",         imapPort: 993, smtpHost: "smtp.gmail.com",         smtpPort: 465 },
  "googlemail.com": { imapHost: "imap.gmail.com",         imapPort: 993, smtpHost: "smtp.gmail.com",         smtpPort: 465 },
  "outlook.com":    { imapHost: "outlook.office365.com",  imapPort: 993, smtpHost: "smtp-mail.outlook.com",  smtpPort: 587 },
  "hotmail.com":    { imapHost: "outlook.office365.com",  imapPort: 993, smtpHost: "smtp-mail.outlook.com",  smtpPort: 587 },
  "live.com":       { imapHost: "outlook.office365.com",  imapPort: 993, smtpHost: "smtp-mail.outlook.com",  smtpPort: 587 },
  "msn.com":        { imapHost: "outlook.office365.com",  imapPort: 993, smtpHost: "smtp-mail.outlook.com",  smtpPort: 587 },
  "yahoo.com":      { imapHost: "imap.mail.yahoo.com",    imapPort: 993, smtpHost: "smtp.mail.yahoo.com",    smtpPort: 465 },
  "yahoo.it":       { imapHost: "imap.mail.yahoo.com",    imapPort: 993, smtpHost: "smtp.mail.yahoo.com",    smtpPort: 465 },
  "icloud.com":     { imapHost: "imap.mail.me.com",       imapPort: 993, smtpHost: "smtp.mail.me.com",       smtpPort: 587 },
  "me.com":         { imapHost: "imap.mail.me.com",       imapPort: 993, smtpHost: "smtp.mail.me.com",       smtpPort: 587 },
  "aol.com":        { imapHost: "imap.aol.com",           imapPort: 993, smtpHost: "smtp.aol.com",           smtpPort: 465 },
};

/** Ricava il preset host dal dominio dell'email, o null se sconosciuto. */
export function presetFor(email: string): HostPreset | null {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;
  return PRESETS[domain] ?? null;
}

/** true se il dominio è noto (la UI può nascondere i campi host avanzati). */
export function isKnownProvider(email: string): boolean {
  return presetFor(email) !== null;
}
