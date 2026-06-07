"use client";
import type { KeptEntry } from "@/lib/kept";
import { useI18n, relativeDate } from "@/lib/i18n";
import { Initials } from "@/components/SubscriptionTable";

type Props = {
  entries: KeptEntry[];
  onUnkeep: (entry: KeptEntry) => void;
};

export default function KeptTable({ entries, onUnkeep }: Props) {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t("tbl.sender")}
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
              {t("tbl.keptOn")}
            </th>
            <th className="px-3 sm:px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t("tbl.action")}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors">
              <td className="px-3 sm:px-5 py-4">
                <div className="flex items-center gap-3">
                  <Initials name={entry.name} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate max-w-[160px] sm:max-w-[260px]">{entry.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[160px] sm:max-w-[260px]">{entry.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">{relativeDate(entry.keptAt, t)}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <span className="text-slate-500 text-sm">{relativeDate(entry.keptAt, t)}</span>
              </td>
              <td className="px-3 sm:px-5 py-4 text-right">
                <button
                  onClick={() => onUnkeep(entry)}
                  title={t("act.unkeep")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="hidden sm:inline">{t("act.unkeep")}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
