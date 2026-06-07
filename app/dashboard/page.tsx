"use client";
import { useAuth } from "@/lib/session-client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Subscription, UnsubscribeStatus } from "@/lib/types";
import {
  fetchHistory,
  pushHistory,
  deleteHistory,
  clearAllHistory,
  type History,
  type HistoryEntry,
} from "@/lib/history";
import {
  fetchKept,
  pushKept,
  deleteKept,
  type Kept,
  type KeptEntry,
} from "@/lib/kept";
import { classify, type CategoryKey } from "@/lib/classify";
import { useI18n, LOCALE } from "@/lib/i18n";
import { REPO_URL } from "@/lib/config";
import SubscriptionTable, { type SortField, type SortDir } from "@/components/SubscriptionTable";
import RemovedTable from "@/components/RemovedTable";
import KeptTable from "@/components/KeptTable";
import BulkActionBar from "@/components/BulkActionBar";
import Toolbar from "@/components/Toolbar";
import CategoryCards, { type FilterKey } from "@/components/CategoryCards";
import LoadingScreen from "@/components/LoadingScreen";
import SuccessModal from "@/components/SuccessModal";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";

type ModalState = { open: boolean; count: number; names: string[]; manual: number };
type FailItem = { id: string; name: string; email: string; url?: string };
type FailModalState = { open: boolean; items: FailItem[] };

type Tab = "active" | "removed" | "kept";

const ACTIVE_WINDOW_DAYS = 90;

const TWO_LEVEL_SLD = new Set(["co", "com", "org", "net", "gov", "edu", "ac", "go", "gob"]);

function rootDomain(host: string): string {
  const parts = host.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return parts.join(".");
  const sld = parts[parts.length - 2];
  const tld = parts[parts.length - 1];
  if (TWO_LEVEL_SLD.has(sld) && tld.length === 2) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

function isRecent(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t <= days * 86400000;
}

export default function Dashboard() {
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const { t, lang } = useI18n();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Map<string, UnsubscribeStatus>>(new Map());
  const [history, setHistory] = useState<History>({});
  const [kept, setKept] = useState<Kept>({});
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, count: 0, names: [], manual: 0 });
  const [failModal, setFailModal] = useState<FailModalState>({ open: false, items: [] });

  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortField, setSortField] = useState<SortField>("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchHistory().then(setHistory);
    fetchKept().then(setKept);
  }, [status]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", { cache: "no-store" });
      if (res.status === 401) {
        await logout();
        router.push("/");
        return;
      }
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
      setLastScan(new Date());
      setStatuses(new Map());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
  }, [status, load]);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir(field === "name" || field === "method" ? "asc" : "desc");
    }
  };

  const handleUnsubscribe = async (ids: string[]) => {
    const items = subscriptions.filter((s) => ids.includes(s.id));

    setStatuses((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => next.set(id, "loading"));
      return next;
    });

    let results: { id: string; status: string; url?: string }[] = [];
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      results = (await res.json()).results ?? [];
    } catch {
      results = items.map((it) => ({ id: it.id, status: "failed" }));
    }

    const okIds: string[] = [];
    const failItems: FailItem[] = [];
    const newEntries: Subscription[] = [];
    let manual = 0;

    for (const r of results) {
      const isOk = r.status === "success" || r.status === "needs-manual";
      if (r.status === "needs-manual") {
        manual++;
        if (r.url) window.open(r.url, "_blank");
      }
      const sub = subscriptions.find((s) => s.id === r.id);
      if (isOk) {
        okIds.push(r.id);
        if (sub) newEntries.push(sub);
      } else {
        if (sub) {
          const domain = sub.senderEmail.split("@")[1];
          const fallbackUrl = domain ? `https://${rootDomain(domain)}` : undefined;
          failItems.push({ id: sub.id, name: sub.senderName, email: sub.senderEmail, url: r.url ?? fallbackUrl });
        }
      }
    }

    const newHistEntries: HistoryEntry[] = newEntries.map((sub) => ({
      id: sub.id,
      email: sub.senderEmail,
      name: sub.senderName,
      count: sub.count,
      method: sub.method,
      lastReceived: sub.lastReceived,
      unsubscribeUrl: sub.unsubscribeUrl,
      unsubscribedAt: new Date().toISOString(),
    }));

    if (newHistEntries.length) {
      setHistory((prev) => {
        const next = { ...prev };
        for (const e of newHistEntries) next[e.id] = e;
        return next;
      });
      pushHistory(newHistEntries).then((ok) => {
        if (!ok) showToast(t("toast.cloudFail"));
      });
    }

    setStatuses((prev) => {
      const next = new Map(prev);
      okIds.forEach((id) => next.delete(id));
      failItems.forEach((fi) => next.set(fi.id, "failed"));
      return next;
    });
    setSelected(new Set());

    const ok = okIds.length;

    if (ok > 0) {
      setModal({ open: true, count: ok, names: newEntries.map((s) => s.senderName), manual });
    }
    if (failItems.length > 0) {
      setFailModal({ open: true, items: failItems });
    }
  };

  const handleMoveFailedToRemoved = (items: FailItem[]) => {
    const subs = items.map((fi) => subscriptions.find((s) => s.id === fi.id)).filter(Boolean) as Subscription[];
    const entries: HistoryEntry[] = subs.map((sub) => ({
      id: sub.id,
      email: sub.senderEmail,
      name: sub.senderName,
      count: sub.count,
      method: sub.method,
      lastReceived: sub.lastReceived,
      unsubscribeUrl: sub.unsubscribeUrl,
      unsubscribedAt: new Date().toISOString(),
    }));
    if (entries.length) {
      setHistory((prev) => {
        const next = { ...prev };
        for (const e of entries) next[e.id] = e;
        return next;
      });
      pushHistory(entries);
    }
    setStatuses((prev) => {
      const next = new Map(prev);
      items.forEach((fi) => next.delete(fi.id));
      return next;
    });
    setFailModal({ open: false, items: [] });
  };

  const handleKeep = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    const entry: KeptEntry = {
      id: sub.id,
      email: sub.senderEmail,
      name: sub.senderName,
      keptAt: new Date().toISOString(),
    };
    setKept((prev) => ({ ...prev, [id]: entry }));
    pushKept(entry);
  };

  const handleUnkeep = (entry: KeptEntry) => {
    setKept((prev) => {
      const next = { ...prev };
      delete next[entry.id];
      return next;
    });
    deleteKept(entry.id);
  };

  const handleResubscribe = (entry: HistoryEntry) => {
    const domain = entry.email.split("@")[1];
    const url = domain ? `https://${rootDomain(domain)}` : null;
    if (url) window.open(url, "_blank");

    setHistory((h) => {
      const next = { ...h };
      delete next[entry.id];
      return next;
    });
    deleteHistory(entry.id);
    setStatuses((prev) => {
      const next = new Map(prev);
      next.delete(entry.id);
      return next;
    });
    showToast(t("toast.resubscribe", { name: entry.name }));
  };

  const handleClearHistory = () => {
    setHistory({});
    clearAllHistory();
  };

  // ---- Derived lists ----
  const activeBase = useMemo(
    () => subscriptions.filter((s) => !history[s.id] && !kept[s.id]),
    [subscriptions, history, kept]
  );
  const activeAll = useMemo(
    () => activeBase.filter((s) => isRecent(s.lastReceived, ACTIVE_WINDOW_DAYS)),
    [activeBase]
  );

  const counts = useMemo(() => {
    const c: Record<CategoryKey, number> = { promo: 0, useful: 0, other: 0 };
    for (const s of activeAll) c[classify(s)]++;
    return c;
  }, [activeAll]);

  const removedEntries = useMemo(
    () =>
      Object.values(history).sort(
        (a, b) => new Date(b.unsubscribedAt).getTime() - new Date(a.unsubscribedAt).getTime()
      ),
    [history]
  );

  const keptEntries = useMemo(
    () =>
      Object.values(kept).sort(
        (a, b) => new Date(b.keptAt).getTime() - new Date(a.keptAt).getTime()
      ),
    [kept]
  );

  const currentIds = useMemo(() => new Set(subscriptions.map((s) => s.id)), [subscriptions]);
  const stillInInbox = useMemo(
    () => new Set(removedEntries.filter((e) => currentIds.has(e.id)).map((e) => e.id)),
    [removedEntries, currentIds]
  );
  // Mittenti con email ricevute DOPO la disiscrizione → disiscrizione probabilmente fallita
  const newAfterUnsub = useMemo(
    () =>
      new Set(
        removedEntries
          .filter((e) => {
            const sub = subscriptions.find((s) => s.id === e.id);
            return sub && new Date(sub.lastReceived) > new Date(e.unsubscribedAt);
          })
          .map((e) => e.id)
      ),
    [removedEntries, subscriptions]
  );

  const visibleActive = useMemo(() => {
    let list = activeAll;
    if (filter !== "all") list = list.filter((s) => classify(s) === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) => s.senderName.toLowerCase().includes(q) || s.senderEmail.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeAll, filter, query]);

  if (loading) return <LoadingScreen />;

  const scanLabel = lastScan
    ? t("dash.lastScan", {
        time: lastScan.toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" }),
        n: subscriptions.length,
      })
    : "—";

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl animate-[fadeIn_.15s_ease-out]">
          {toast}
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-semibold text-slate-900 text-sm">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-500 hidden md:block">{user?.email}</span>
            {REPO_URL && (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={t("landing.github")}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
            )}
            <LanguageSelector compact />
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t("dash.signout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t("dash.title")}</h1>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-60"
          >
            <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? t("dash.reloading") : t("dash.reload")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
          <TabButton active={tab === "active"} onClick={() => setTab("active")} label={t("dash.tab.active")} count={activeAll.length} />
          <TabButton active={tab === "removed"} onClick={() => setTab("removed")} label={t("dash.tab.removed")} count={removedEntries.length} />
          <TabButton active={tab === "kept"} onClick={() => setTab("kept")} label={t("dash.tab.kept")} count={keptEntries.length} />
        </div>

        {tab === "active" ? (
          <>
            <CategoryCards counts={counts} total={activeAll.length} active={filter} onSelect={setFilter} />
            <Toolbar query={query} onQuery={setQuery} total={activeAll.length} shown={visibleActive.length} />
            {activeAll.length === 0 ? (
              <EmptyState emoji="🎉" title={t("dash.empty.active.title")} subtitle={t("dash.empty.active.sub")} />
            ) : visibleActive.length === 0 ? (
              <EmptyState emoji="🔍" title={t("dash.empty.filter.title")} subtitle={t("dash.empty.filter.sub")} />
            ) : (
              <SubscriptionTable
                subscriptions={visibleActive}
                selected={selected}
                statuses={statuses}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onSelect={setSelected}
                onUnsubscribe={(id) => handleUnsubscribe([id])}
                onKeep={handleKeep}
              />
            )}
          </>
        ) : tab === "removed" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{t("dash.removed.count", { n: removedEntries.length })}</p>
              {removedEntries.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-slate-400 hover:text-red-500 underline decoration-dotted transition-colors"
                >
                  {t("dash.removed.clear")}
                </button>
              )}
            </div>
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4">
              <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">{t("dash.removed.disclaimer")}</p>
            </div>
            {removedEntries.length === 0 ? (
              <EmptyState emoji="📭" title={t("dash.empty.removed.title")} subtitle={t("dash.empty.removed.sub")} />
            ) : (
              <RemovedTable entries={removedEntries} stillInInbox={stillInInbox} newAfterUnsub={newAfterUnsub} onResubscribe={handleResubscribe} />
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{t("dash.kept.count", { n: keptEntries.length })}</p>
              {keptEntries.length > 0 && (
                <button
                  onClick={() => { setKept({}); keptEntries.forEach((e) => deleteKept(e.id)); }}
                  className="text-xs text-slate-400 hover:text-red-500 underline decoration-dotted transition-colors"
                >
                  {t("dash.kept.clear")}
                </button>
              )}
            </div>
            {keptEntries.length === 0 ? (
              <EmptyState emoji="🔖" title={t("dash.empty.kept.title")} subtitle={t("dash.empty.kept.sub")} />
            ) : (
              <KeptTable entries={keptEntries} onUnkeep={handleUnkeep} />
            )}
          </>
        )}
      </main>

      {tab === "active" && selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onUnsubscribeAll={() => handleUnsubscribe(Array.from(selected))}
          onClear={() => setSelected(new Set())}
        />
      )}

      <SuccessModal
        open={modal.open}
        count={modal.count}
        names={modal.names}
        manual={modal.manual}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onGoRemoved={() => {
          setModal((m) => ({ ...m, open: false }));
          setTab("removed");
        }}
      />

      <FailModal
        open={failModal.open}
        items={failModal.items}
        onClose={() => setFailModal({ open: false, items: [] })}
        onMoveToRemoved={() => handleMoveFailedToRemoved(failModal.items)}
        t={t}
      />
    </div>
  );
}

// ---- Sub-components ----

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
      <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold ${
        active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
      }`}>
        {count}
      </span>
    </button>
  );
}

function EmptyState({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-slate-900 font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{subtitle}</p>
    </div>
  );
}

import type { TFunc } from "@/lib/i18n";

function FailModal({
  open,
  items,
  onClose,
  onMoveToRemoved,
  t,
}: {
  open: boolean;
  items: FailItem[];
  onClose: () => void;
  onMoveToRemoved: () => void;
  t: TFunc;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: "fadeBackdrop .2s ease-out both" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-7"
        style={{ animation: "popIn .2s ease-out both" }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-1">{t("fail.title")}</h2>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">{t("fail.body")}</p>

        {/* Failed senders list */}
        <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
          {items.map((fi) => (
            <div key={fi.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{fi.name}</p>
                <p className="text-xs text-slate-400 truncate">{fi.email}</p>
              </div>
              {fi.url && (
                <a
                  href={fi.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  {t("fail.manual")}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onMoveToRemoved}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {t("fail.moveRemoved")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
          >
            {t("fail.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
