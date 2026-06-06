# Omni-Mail Unsubscriber

Find and unsubscribe from every newsletter in your inbox, one click at a time — for **any** mailbox, free and self-hostable.

It scans your inbox for messages with a `List-Unsubscribe` header, groups them by sender, and unsubscribes for you (RFC 8058 one-click POST, or a `mailto` sent via SMTP). It reads **email headers only**, never the body.

- 🔍 Automatic inbox scan, grouped by sender
- ⚡ One-click unsubscribe (or bulk)
- 🗂️ Cross-device history (Supabase)
- 🌍 4 languages: Italian · English · Spanish · French
- 📱 Responsive, works on mobile
- 🔒 Headers only — your email content is never read or stored

## How it works (auth model)

There is **no OAuth**. You log in with your email + an **app-password**, and the app connects directly to your mailbox over the standard **IMAP** (read) and **SMTP** (send) protocols. This keeps the app provider-agnostic and free to run for anyone.

Your credentials live **only** in an AES-256-GCM encrypted, httpOnly cookie in your browser — never in a database, never exposed to client-side JavaScript.

### Supported providers

Anything with IMAP. Host presets are auto-detected for Gmail, Outlook/Hotmail, Yahoo, iCloud and AOL; other providers can enter their IMAP/SMTP hosts manually. Each provider needs an **app-password** (generated after enabling 2-step verification), not your normal password.

| Provider | App-password page |
|----------|-------------------|
| Gmail | https://myaccount.google.com/apppasswords |
| Outlook / Hotmail | https://account.microsoft.com/security |
| Yahoo | https://login.yahoo.com/account/security |
| iCloud | https://appleid.apple.com |

> Note: some Microsoft personal accounts have deprecated IMAP basic-auth; Gmail, Yahoo and iCloud work reliably with app-passwords.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **Tailwind CSS v4**
- **imapflow** (IMAP) + **nodemailer** (SMTP)
- **Supabase** (`service_role`, server-only) for unsubscribe history
- Custom encrypted-cookie session (`lib/session.ts`) — no NextAuth

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + TypeScript type-check
npm run start    # serve production build
```

### Environment (`.env.local`)

```bash
AUTH_SECRET=                 # openssl rand -base64 32  (encrypts the session cookie)
SUPABASE_URL=               # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=  # Supabase secret key — server only
```

### Supabase table

```sql
create table public.unsubscribes (
  user_email      text not null,
  sender_id       text not null,  -- base64 of senderEmail
  sender_email    text not null,
  sender_name     text not null,
  count           int  not null default 1,
  method          text not null,
  unsubscribe_url text,
  last_received   timestamptz,
  unsubscribed_at timestamptz not null default now(),
  primary key (user_email, sender_id)
);
```

## Deploy

Deploy to **Vercel** (free Hobby tier) + **Supabase** (free tier). Set the three env vars in the Vercel dashboard. Serve over HTTPS — the app handles user mail credentials, so TLS is mandatory (Vercel provides it by default). API routes that touch IMAP/SMTP set `maxDuration = 60`.

## License

[MIT](LICENSE)
