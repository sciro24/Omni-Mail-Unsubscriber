"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/session-client";
import { providerKeyFor } from "@/lib/providers";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import ProviderGuides from "@/components/ProviderGuides";

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

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) router.replace("/");
  }, [email, router]);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  // Auto-login: se le credenziali sono salvate in localStorage per questa email,
  // tenta il login silenzioso senza mostrare il form.
  useEffect(() => {
    if (status !== "unauthenticated" || !email) return;
    try {
      const raw = localStorage.getItem("omu_saved");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.email !== email) return;
      setAutoLoading(true);
      login(saved).then((res) => {
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
    if (!password) {
      setError(t("login.err.missing"));
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login({ email, password });
    setLoading(false);
    if (res.ok) {
      router.replace("/dashboard");
    } else {
      setError(errMsg(res.error));
    }
  };

  if (!email || status === "loading" || status === "authenticated" || autoLoading) {
    return <CenterSpinner />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-sm bg-white/60 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-semibold text-slate-900 text-sm">{t("brand")}</span>
          </button>
          <LanguageSelector compact />
        </div>
      </header>

      <div className="flex-1 w-full">
        {/* Form centrato */}
        <section className="max-w-xl mx-auto px-5 sm:px-6 pt-8 sm:pt-12 pb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t("connect.title")}</h1>

          {/* Account selezionato */}
          <div className="mt-3 flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                {email[0]?.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 leading-none mb-0.5">{t("connect.for")}</p>
                <p className="text-sm font-medium text-slate-800 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
            >
              {t("connect.changeEmail")}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("login.password")}</label>
              <input
                type="password"
                autoComplete="off"
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder={t("login.passwordPh")}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
              />
              <p className="text-[11px] text-amber-600 mt-1.5 leading-snug flex items-start gap-1">
                <span>⚠️</span> {t("connect.notNormal")}
              </p>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 leading-snug">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm shadow-sm active:scale-[.99]"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
              )}
              {loading ? t("login.connecting") : t("connect.submit")}
            </button>
          </form>

          {/* Banner: perché app-password */}
          <div className="mt-6 rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-sm font-semibold text-indigo-900">{t("connect.banner.title")}</h3>
            </div>
            <p className="text-xs text-indigo-700/90 leading-relaxed">{t("connect.banner.body")}</p>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 leading-snug flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0 mt-px text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t("login.secure")}
          </p>
        </section>

        {/* Guide provider — full width, tutti aperti */}
        <section className="border-t border-slate-100 bg-white/60 px-5 sm:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">{t("connect.tutorialTitle")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("prov.sub")}</p>
            </div>
            <ProviderGuides allOpen highlight={providerKey} />
          </div>
        </section>
      </div>
    </main>
  );
}

function CenterSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <svg className="w-7 h-7 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
      </svg>
    </div>
  );
}
