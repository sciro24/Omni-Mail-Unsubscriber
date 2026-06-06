import type { Subscription } from "@/lib/types";

export type CategoryKey = "promo" | "useful" | "other";

export type Category = {
  key: CategoryKey;
  label: string;
  emoji: string;
  hint: string;
  // classi Tailwind per l'header di sezione
  accent: string;
  dot: string;
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  promo: {
    key: "promo",
    label: "Promozionali & marketing",
    emoji: "🔥",
    hint: "Newsletter, offerte, sconti. Disiscriversi è quasi sempre sicuro.",
    accent: "text-orange-700",
    dot: "bg-orange-400",
  },
  useful: {
    key: "useful",
    label: "Notifiche & potenzialmente utili",
    emoji: "🔔",
    hint: "noreply, account, sicurezza, ricevute, ordini. Valuta prima di disiscriverti.",
    accent: "text-sky-700",
    dot: "bg-sky-400",
  },
  other: {
    key: "other",
    label: "Altre",
    emoji: "📨",
    hint: "Mittenti non classificati automaticamente.",
    accent: "text-slate-600",
    dot: "bg-slate-300",
  },
};

// Ordine di visualizzazione delle sezioni
export const CATEGORY_ORDER: CategoryKey[] = ["promo", "useful", "other"];

const STRONG_USEFUL =
  /(security|sicurezza|account|access|login|billing|invoice|fattur|receipt|ricevut|order|ordin|payment|pagament|verify|verifica|confirm|conferma|password|notif|alert|support|assist|help|spedizione|shipping|tracking)/;

const NOREPLY = /(no-?reply|do-?not-?reply|donotreply|noreply)/;

const PROMO =
  /(promo|market|newsletter|news|offer|deal|sale|sconti|saldi|store|shop|negozio|hello|hi|info|contact|community|team|digest|weekly|daily|update|insider|club|vip|membership)/;

/** Classifica un mittente in una categoria con una euristica su local-part e nome. */
export function classify(sub: Subscription): CategoryKey {
  const local = (sub.senderEmail.split("@")[0] || "").toLowerCase();
  const name = sub.senderName.toLowerCase();

  if (STRONG_USEFUL.test(local) || STRONG_USEFUL.test(name)) return "useful";
  if (PROMO.test(local) || PROMO.test(name)) return "promo";
  // one-click ⇒ invio massivo conforme RFC 8058 ⇒ tipicamente marketing
  if (sub.method === "one-click") return "promo";
  if (NOREPLY.test(local)) return "other";
  return "other";
}
