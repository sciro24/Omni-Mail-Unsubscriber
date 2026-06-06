"use client";
import { useI18n } from "@/lib/i18n";

type Props = {
  count: number;
  onUnsubscribeAll: () => void;
  onClear?: () => void;
};

export default function BulkActionBar({ count, onUnsubscribeAll, onClear }: Props) {
  const { t } = useI18n();
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto max-w-md">
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 text-white pl-4 sm:pl-5 pr-2 py-2 rounded-2xl shadow-2xl shadow-slate-900/30 border border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-indigo-500 text-white text-xs font-bold">
            {count}
          </span>
          <span className="text-sm font-medium text-slate-300 truncate">
            {count === 1 ? t("bulk.selectedOne") : t("bulk.selectedMany")}
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white transition-colors px-1 shrink-0"
          >
            {t("bulk.deselect")}
          </button>
        )}
        <button
          onClick={onUnsubscribeAll}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-400 active:scale-95 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all ml-auto shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t("bulk.unsubAll")}
        </button>
      </div>
    </div>
  );
}
