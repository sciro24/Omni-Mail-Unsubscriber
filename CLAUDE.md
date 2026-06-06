# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build (also runs TS type-check)
npm run start    # serve production build
```

No test runner is configured. Validate changes with `npm run build` — TypeScript errors fail the build.

## Stack

- **Next.js 16.2.7** App Router (Turbopack). Read `node_modules/next/dist/docs/` before using any Next.js API — this version has breaking changes vs training data.
- **NextAuth v5 beta.31** — `auth()` is a server function, not a hook. Session exposed via `session.accessToken` and `session.provider`.
- **Tailwind CSS v4** — `@import "tailwindcss"` + `@theme inline` in `globals.css`. No `tailwind.config.js`. Dark mode is forcibly disabled: `color-scheme: light` on `:root` and html element.
- **Supabase** with `service_role` key (server-only). Client is lazy-initialized in `lib/supabase.ts` to avoid build-time crash when env vars are absent.
- **React 19** with `"use client"` directives required on all interactive components.

## Architecture

### Auth providers
Two OAuth providers in `lib/auth.ts`: Google (Gmail scopes) and Microsoft Entra ID (Graph Mail scopes). The JWT callback stores `token.provider` ("google" | "microsoft-entra-id") alongside `accessToken`. Both are exposed on `session`.

### Mail abstraction
`lib/mail.ts` is the provider dispatcher — it routes calls to `lib/gmail.ts` (Gmail REST API) or `lib/graph.ts` (Microsoft Graph) based on `session.provider`. All API routes import from `lib/mail.ts`, never directly from `lib/gmail.ts` or `lib/graph.ts`. Both backends normalize to the same header shape: `{ payload: { headers: [{name, value}] } }`.

### Data flow
1. `GET /api/subscriptions` — fetches up to 1500 message IDs with query `"unsubscribe OR list-unsubscribe"`, batches metadata fetches (20 at a time), groups by `senderEmail`, parses `List-Unsubscribe` / `List-Unsubscribe-Post` headers, returns sorted `Subscription[]`.
2. `POST /api/unsubscribe` — handles one-click POST (RFC 8058), mailto send, or `needs-manual` fallback (opens link in browser). Never returns hard failure for link-type — always falls back to `needs-manual`.
3. `GET|POST|DELETE /api/history` — CRUD against Supabase `unsubscribes` table, filtered by `session.user.email`. Upsert key: `(user_email, sender_id)`.

### History / persistence
`lib/history.ts` is a thin client that hits `/api/history`. No localStorage. `HistoryEntry` maps to DB rows via `rowToEntry`/`entryToRow` in the route handler. Dashboard writes optimistically (local state first, then fire-and-forget `pushHistory()`).

### i18n
`lib/i18n.tsx` exports `I18nProvider`, `useI18n()`, `t(key, vars?)`, `formatDate(iso, lang)`, `relativeDate(iso, t)`. Four languages: `it`/`en`/`es`/`fr`. Language persisted in `localStorage` key `um_lang`. Provider wraps the entire app via `app/providers.tsx`. All user-visible strings go through `t()` — hardcoded Italian strings are a bug.

### StrictMode side-effect rule
All side effects (window.open, pushHistory, deleteHistory) must run **outside** `setState` updaters in `handleUnsubscribe` — React 19 StrictMode double-fires updaters in dev, causing duplicate tabs/writes.

### Active filter
Subscriptions are filtered to the last 90 days (`ACTIVE_WINDOW_DAYS = 90`) on the client in `activeAll` — this hides senders where the user already manually unsubscribed in the past (only old emails remain). This filter is always on; there is no toggle.

## Key env vars

| Var | Where |
|-----|-------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Azure Portal → App registrations |
| `MICROSOFT_TENANT_ID` | `common` for personal + org accounts |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Same value, both required |
| `SUPABASE_URL` | Project URL (no trailing path) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key — server only, never expose to browser |

## Supabase table schema

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

## GitHub repo link

Set `REPO_URL` in `lib/config.ts`. Empty string = GitHub button hidden everywhere.
