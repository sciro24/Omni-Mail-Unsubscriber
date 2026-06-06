"use client";
import { useI18n } from "@/lib/i18n";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  total: number;
  shown: number;
};

export default function Toolbar({ query, onQuery, total, shown }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("toolbar.search")}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
        />
        {query && (
          <button
            onClick={() => onQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={t("toolbar.clearSearch")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <span className="text-xs text-slate-400 ml-auto">
        {shown === total ? t("toolbar.total", { n: total }) : t("toolbar.shown", { shown, total })}
      </span>
    </div>
  );
}
