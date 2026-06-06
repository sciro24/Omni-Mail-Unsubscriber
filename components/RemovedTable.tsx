"use client";
import type { HistoryEntry } from "@/lib/history";
import { Initials } from "./SubscriptionTable";
import { useI18n, formatDate, relativeDate } from "@/lib/i18n";

type Props = {
  entries: HistoryEntry[];
  stillInInbox: Set<string>; // id ancora presenti nella casella (email passate non cancellate)
  onResubscribe: (entry: HistoryEntry) => void;
};

const METHOD_LABEL: Record<string, string> = {
  "one-click": "1-click",
  mailto: "email",
  link: "link",
  unknown: "?",
};

export default function RemovedTable({ entries, stillInInbox, onResubscribe }: Props) {
  const { t, lang } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t("tbl.sender")}</th>
            <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{t("tbl.email")}</th>
            <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{t("tbl.method")}</th>
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{t("tbl.unsubbed")}</th>
            <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide pr-5">{t("tbl.action")}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr
              key={e.id}
              className={[
                "border-b border-slate-50 hover:bg-slate-50/70 transition-colors",
                i === entries.length - 1 ? "border-b-0" : "",
              ].join(" ")}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Initials name={e.name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-slate-900 truncate max-w-[220px]">{e.name}</p>
                      {stillInInbox.has(e.id) && (
                        <span
                          title={t("tbl.oldMail.title")}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium shrink-0"
                        >
                          {t("tbl.oldMail")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[220px]">{e.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {e.count}
                </span>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                  {METHOD_LABEL[e.method] ?? e.method}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {relativeDate(e.unsubscribedAt, t)}
                </div>
                <div className="text-xs text-slate-400">{formatDate(e.unsubscribedAt, lang)}</div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  {e.unsubscribeUrl && (
                    <a
                      href={e.unsubscribeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t("tbl.verify.title")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("tbl.verify")}
                    </a>
                  )}
                  <button
                    onClick={() => onResubscribe(e)}
                    title={t("tbl.resub.title")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v1M3 10l5-5M3 10l5 5" />
                    </svg>
                    {t("tbl.resub")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
