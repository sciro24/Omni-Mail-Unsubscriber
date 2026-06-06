"use client";
import { CATEGORIES, CATEGORY_ORDER, type CategoryKey } from "@/lib/classify";
import { useI18n } from "@/lib/i18n";

export type FilterKey = "all" | CategoryKey;

const LABEL_KEY: Record<FilterKey, string> = {
  all: "cat.all",
  promo: "cat.promo",
  useful: "cat.useful",
  other: "cat.other",
};

type Props = {
  counts: Record<CategoryKey, number>;
  total: number;
  active: FilterKey;
  onSelect: (k: FilterKey) => void;
};

// stili per ogni card (selezionata vs no)
const CARD: Record<FilterKey, { emoji: string; label: string; ring: string; activeBg: string; iconBg: string }> = {
  all: {
    emoji: "📬", label: "Tutte",
    ring: "ring-indigo-300", activeBg: "bg-indigo-600 text-white border-indigo-600", iconBg: "bg-indigo-100",
  },
  promo: {
    emoji: CATEGORIES.promo.emoji, label: "Promozionali",
    ring: "ring-orange-300", activeBg: "bg-orange-500 text-white border-orange-500", iconBg: "bg-orange-100",
  },
  useful: {
    emoji: CATEGORIES.useful.emoji, label: "Notifiche & utili",
    ring: "ring-sky-300", activeBg: "bg-sky-500 text-white border-sky-500", iconBg: "bg-sky-100",
  },
  other: {
    emoji: CATEGORIES.other.emoji, label: "Altre",
    ring: "ring-slate-300", activeBg: "bg-slate-700 text-white border-slate-700", iconBg: "bg-slate-100",
  },
};

export default function CategoryCards({ counts, total, active, onSelect }: Props) {
  const { t } = useI18n();
  const keys: FilterKey[] = ["all", ...CATEGORY_ORDER];
  const valueOf = (k: FilterKey) => (k === "all" ? total : counts[k]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {keys.map((k) => {
        const c = CARD[k];
        const isActive = active === k;
        const count = valueOf(k);
        return (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className={[
              "group relative text-left rounded-2xl border p-4 transition-all duration-150",
              isActive
                ? `${c.activeBg} shadow-lg scale-[1.02]`
                : `bg-white border-slate-200 hover:${c.ring} hover:ring-2 hover:-translate-y-0.5 shadow-sm`,
            ].join(" ")}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                  isActive ? "bg-white/20" : c.iconBg
                }`}
              >
                {c.emoji}
              </span>
              <span className={`text-2xl font-bold tabular-nums ${isActive ? "text-white" : "text-slate-900"}`}>
                {count}
              </span>
            </div>
            <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>{t(LABEL_KEY[k])}</p>
            <p className={`text-xs mt-0.5 ${isActive ? "text-white/70" : "text-slate-400"}`}>
              {count === 1 ? t("cat.sender") : t("cat.senders")}
            </p>
          </button>
        );
      })}
    </div>
  );
}
