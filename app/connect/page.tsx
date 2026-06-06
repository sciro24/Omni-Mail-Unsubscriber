"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/session-client";
import { providerKeyFor } from "@/lib/providers";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import ProviderGuides from "@/components/ProviderGuides";

const SAVED_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export default function ConnectPage() {
  return (
    <Suspense fallback={<CenterSpinner />}>
      <ConnectInner />
    </Suspense>
  );
}

function ConnectInner() {
  const { t } = useI18n();
  const { status, login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const email = (params.get("email") ?? "").trim().toLowerCase();

  const providerKey = useMemo(() => providerKeyFor(email), [email]);
  const isOther = providerKey === "other";

  const [password, setPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [showHosts, setShowHosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showHostFields = isOther || showHosts;

  useEffect(() => {
    if (!email) router.replace("/");
  }, [email, router]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // Auto-login da localStorage (TTL 30 giorni, persiste dopo logout)
  useEffect(() => {
    if (status !== "unauthenticated" || !email) return;
    try {
      const raw = localStorage.getItem("omu_saved");
      if (!raw) return;
      const saved = JSON.parse(raw);
      const age = Date.now() - (saved.savedAt ?? 0);
      if (saved?.email !== email || age > SAVED_TTL_MS) return;
      setAutoLoading(true);
      const { savedAt: _ts, ...creds } = saved;
      login(creds).then((res) => {
        if (res.ok) {
          router.replace("/dashboard");
        } else {
          localStorage.removeItem("omu_saved");
          setAutoLoading(false);
        }
      });
    } catch {
      localStorage.removeItem("omu_saved");
    }
  }, [status, email, login, router]);

  const errMsg = (code: string) =>
    ({
      "auth-failed": t("login.err.auth"),
      "need-hosts": t("login.err.hosts"),
      "missing-credentials": t("login.err.missing"),
      network: t("login.err.network"),
    }[code] ?? t("login.err.auth"));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError(t("login.err.missing")); return; }
    setLoading(true);
    setError(null);
    const res = await login({
      email,
      password,
      ...(imapHost ? { imapHost } : {}),
      ...(smtpHost ? { smtpHost } : {}),
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/dashboard");
    } else {
      if (res.error === "need-hosts") setShowHosts(true);
      setError(errMsg(res.error));
    }
  };

  if (!email || status === "loading" || status === "authenticated" || autoLoading) {
    return <CenterSpinner />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#F5F3EE]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F5F3EE]/80 backdrop-blur-sm border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
            <Logo className="w-6 h-6" />
            <span className="font-semibold text-[#1A1917] text-sm tracking-tight group-hover:text-slate-700 transition-colors">
              {t("brand")}
            </span>
          </button>
          <LanguageSelector compact />
        </div>
      </header>

      {/* Two-column layout: form left, guides right */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 pt-10 sm:pt-12 pb-12">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 lg:gap-12 items-start">

          {/* ── Left: form card ──────────────────────────── */}
          <div>
            <div className="bg-white rounded-3xl border border-stone-200 shadow-lg shadow-stone-200/40 p-7 sm:p-8">
              <h1 className="text-xl font-bold text-[#1A1917] tracking-tight mb-5">
                {t("connect.title")}
              </h1>

              {/* Account pill */}
              <div className="flex items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 mb-5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-[#1A1917] text-white flex items-center justify-center text-xs font-bold">
                    {email[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 leading-none mb-0.5 uppercase tracking-wide">
                      {t("connect.for")}
                    </p>
                    <p className="text-sm font-medium text-[#1A1917] truncate">{email}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0 transition-colors"
                >
                  {t("connect.changeEmail")}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    {t("login.password")}
                  </label>
                  <input
                    type="password"
                    autoComplete="off"
                    autoFocus
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder={t("login.passwordPh")}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#1A1917] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-amber-700 mt-1.5 leading-snug flex items-start gap-1">
                    <span>⚠</span> {t("connect.notNormal")}
                  </p>
                </div>

                {/* Host fields — auto-visibili per provider sconosciuti */}
                {showHostFields && (
                  <div className="space-y-3 rounded-xl bg-stone-50 border border-stone-200 p-3.5">
                    <p className="text-[11px] text-slate-500 font-medium">
                      {t("login.err.hosts")}
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("login.imapHost")}
                      </label>
                      <input
                        value={imapHost}
                        onChange={(e) => setImapHost(e.target.value)}
                        placeholder="imap.example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A1917] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("login.smtpHost")}
                      </label>
                      <input
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A1917] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-400 transition"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 leading-snug">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1917] hover:bg-[#2d2b28] active:scale-[.99] disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm shadow-sm"
                >
                  {loading && <Spinner />}
                  {loading ? t("login.connecting") : t("connect.submit")}
                </button>
              </form>

              {/* Why app-password */}
              <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100/80 p-4">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">{t("connect.banner.title")}</p>
                    <p className="text-xs text-blue-700/90 leading-relaxed">{t("connect.banner.body")}</p>
                  </div>
                </div>
              </div>

              <p className="mt-3.5 text-[11px] text-slate-400 leading-snug flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0 mt-px text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t("login.secure")}
              </p>
            </div>
          </div>

          {/* ── Right: provider guides ─────────────────── */}
          <div className="lg:sticky lg:top-[4.5rem]">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-[#1A1917]">{t("connect.tutorialTitle")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("prov.sub")}</p>
            </div>
            <ProviderGuides highlight={providerKey} />
          </div>

        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  );
}

function CenterSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
      <svg className="w-7 h-7 animate-spin text-stone-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
      </svg>
    </div>
  );
}
