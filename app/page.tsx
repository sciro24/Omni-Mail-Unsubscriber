"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/session-client";
import { REPO_URL } from "@/lib/config";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError(t("home.emailErr"));
      return;
    }
    router.push(`/connect?email=${encodeURIComponent(value)}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-sm bg-white/60 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-semibold text-slate-900 text-sm">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-2">
            {REPO_URL && (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={t("landing.github")}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <GitHubIcon className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            )}
            <LanguageSelector compact />
          </div>
        </div>
      </header>

      {/* Hero centrato + form email */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo className="w-16 h-16" />
          </div>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold ring-1 ring-indigo-100 mb-5">
            ✉️ {t("landing.free")}
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Omni Mail Unsubscriber
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
            {t("home.problem")}
          </p>
          <p className="mt-1 text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            {t("home.solution")}
          </p>

          {/* Form email-only */}
          <form onSubmit={onSubmit} className="mt-8 w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder={t("login.emailPh")}
                aria-label={t("home.emailLabel")}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition shadow-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm active:scale-[.99] whitespace-nowrap"
              >
                {t("home.emailCta")}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </form>

          {/* Feature pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[t("landing.feat1"), t("landing.feat2"), t("landing.feat3")].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600"
              >
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="max-w-6xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12">
        <h2 className="text-center text-xl sm:text-2xl font-bold text-slate-900 mb-8">{t("landing.how")}</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: 1, icon: "🔗", t: t("landing.step1.t"), d: t("landing.step1.d") },
            { n: 2, icon: "🔍", t: t("landing.step2.t"), d: t("landing.step2.d") },
            { n: 3, icon: "🚫", t: t("landing.step3.t"), d: t("landing.step3.d") },
          ].map((s) => (
            <div key={s.n} className="relative bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {s.n}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{s.t}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto py-6 text-center text-xs text-slate-400">
        {t("brand")}
        {REPO_URL && (
          <>
            {" · "}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline decoration-dotted">
              GitHub
            </a>
          </>
        )}
      </footer>
    </main>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
