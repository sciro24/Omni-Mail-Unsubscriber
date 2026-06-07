"use client";
import type { Subscription, UnsubscribeStatus } from "@/lib/types";
import { useI18n, formatDate, relativeDate, type TFunc } from "@/lib/i18n";

export type SortField = "name" | "count" | "method" | "lastReceived";
export type SortDir = "asc" | "desc";

type Props = {
  subscriptions: Subscription[];
  selected: Set<string>;
  statuses: Map<string, UnsubscribeStatus>;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onSelect: (s: Set<string>) => void;
  onUnsubscribe: (id: string) => void;
  onKeep?: (id: string) => void;
};

const METHOD_STYLE: Record<string, string> = {
  "one-click": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  mailto:      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  link:        "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  unknown:     "bg-slate-100 text-slate-500",
};

const METHOD_LABEL: Record<string, string> = {
  "one-click": "1-click",
  mailto:      "email",
  link:        "link",
  unknown:     "?",
};

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export function Initials({ name }: { name: string }) {
  const letters = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${AVATAR_COLORS[idx]}`}>
      {letters || "?"}
    </div>
  );
}

function sortList(list: Subscription[], field: SortField, dir: SortDir): Subscription[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    let cmp = 0;
    if (field === "name") cmp = a.senderName.localeCompare(b.senderName);
    else if (field === "count") cmp = a.count - b.count;
    else if (field === "method") cmp = (METHOD_LABEL[a.method] ?? a.method).localeCompare(METHOD_LABEL[b.method] ?? b.method);
    else if (field === "lastReceived") cmp = new Date(a.lastReceived).getTime() - new Date(b.lastReceived).getTime();
    return cmp * mul;
  });
}

export default function SubscriptionTable({
  subscriptions, selected, statuses, sortField, sortDir, onSort, onSelect, onUnsubscribe, onKeep,
}: Props) {
  const { t, lang } = useI18n();
  const rows = sortList(subscriptions, sortField, sortDir);
  const selectableIds = rows
    .filter((s) => (statuses.get(s.id) ?? "idle") === "idle")
    .map((s) => s.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleAll = (checked: boolean) => onSelect(checked ? new Set(selectableIds) : new Set());
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-3 sm:px-5 py-3 w-10">
              <input
                type="checkbox"
                className="rounded border-slate-300 accent-indigo-600"
                onChange={(e) => toggleAll(e.target.checked)}
                checked={allSelected}
                disabled={selectableIds.length === 0}
              />
            </th>
            <SortHeader label={t("tbl.sender")} field="name" active={sortField} dir={sortDir} onSort={onSort} align="left" />
            <SortHeader label={t("tbl.email")} field="count" active={sortField} dir={sortDir} onSort={onSort} align="center" hideOnMobile />
            <SortHeader label={t("tbl.method")} field="method" active={sortField} dir={sortDir} onSort={onSort} align="center" hideOnMobile />
            <SortHeader label={t("tbl.lastEmail")} field="lastReceived" active={sortField} dir={sortDir} onSort={onSort} align="left" hideOnMobile />
            <th className="px-3 sm:px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">{t("tbl.action")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sub) => {
            const st = statuses.get(sub.id) ?? "idle";
            const acted = st === "success" || st === "failed";
            const isLoading = st === "loading";
            return (
              <tr
                key={sub.id}
                className={[
                  "border-b border-slate-50 transition-colors last:border-b-0",
                  st === "success" ? "bg-emerald-50/40" : isLoading ? "bg-slate-50/60" : "hover:bg-slate-50/70",
                ].join(" ")}
              >
                <td className="px-3 sm:px-5 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 accent-indigo-600"
                    checked={selected.has(sub.id)}
                    onChange={() => toggle(sub.id)}
                    disabled={acted || isLoading}
                  />
                </td>
                <td className="px-3 sm:px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Initials name={sub.senderName} />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate max-w-[140px] sm:max-w-[240px]">{sub.senderName}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[140px] sm:max-w-[240px]">{sub.senderEmail}</p>
                      {/* su mobile mostra count + data inline (colonne nascoste) */}
                      <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">
                        {sub.count}× · {relativeDate(sub.lastReceived, t)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-center hidden md:table-cell">
                  <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    {sub.count}
                  </span>
                </td>
                <td className="px-5 py-4 text-center hidden md:table-cell">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${METHOD_STYLE[sub.method] ?? METHOD_STYLE.unknown}`}>
                    {METHOD_LABEL[sub.method] ?? sub.method}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <div className="text-slate-600">{relativeDate(sub.lastReceived, t)}</div>
                  <div className="text-xs text-slate-400">{formatDate(sub.lastReceived, lang)}</div>
                </td>
                <td className="px-3 sm:px-5 py-4 text-right">
                  <ActionCell status={st} onClick={() => onUnsubscribe(sub.id)} onKeep={onKeep ? () => onKeep(sub.id) : undefined} t={t} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label, field, active, dir, onSort, align, hideOnMobile,
}: {
  label: string; field: SortField; active: SortField; dir: SortDir;
  onSort: (f: SortField) => void; align: "left" | "center"; hideOnMobile?: boolean;
}) {
  const isActive = active === field;
  return (
    <th className={`px-3 sm:px-5 py-3 ${align === "left" ? "text-left" : "text-center"} ${hideOnMobile ? "hidden md:table-cell" : ""}`}>
      <button
        onClick={() => onSort(field)}
        className={`group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
          isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {label}
        {isActive ? (
          <svg
            className={`w-3.5 h-3.5 text-indigo-600 transition-transform ${dir === "asc" ? "" : "rotate-180"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        )}
      </button>
    </th>
  );
}

function ActionCell({ status, onClick, onKeep, t }: { status: UnsubscribeStatus; onClick: () => void; onKeep?: () => void; t: TFunc }) {
  if (status === "success")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {t("act.done")}
      </span>
    );

  if (status === "failed")
    return (
      <button
        onClick={onClick}
        title={t("act.retry.title")}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {t("act.retry")}
      </button>
    );

  if (status === "loading")
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-400 font-medium">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
        </svg>
        {t("act.loading")}
      </span>
    );

  return (
    <div className="inline-flex items-center gap-1.5">
      {onKeep && (
        <button
          onClick={onKeep}
          title={t("act.keep")}
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:text-slate-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}
      <button
        onClick={onClick}
        className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-sm shadow-red-200 transition-all"
      >
        {t("act.unsub")}
      </button>
    </div>
  );
}
