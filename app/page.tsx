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
    <main className="min-h-screen flex flex-col bg-[#F5F3EE]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F5F3EE]/80 backdrop-blur-sm border-b border-stone-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="font-semibold text-[#1A1917] text-sm tracking-tight">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-2">
            {REPO_URL && (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={t("landing.github")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-stone-200 hover:border-stone-300 transition-colors shadow-sm"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            )}
            <LanguageSelector compact />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-16 sm:py-24 relative overflow-hidden">
        {/* Dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.065) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 90%)",
          }}
        />
        {/* Colour wash */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 25% 45%, rgba(96,165,250,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 75% 55%, rgba(52,211,153,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="w-full max-w-xl mx-auto text-center relative z-10">
          {/* Pill badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-slate-600 mb-7 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("landing.free")}
          </span>

          {/* Heading */}
          <h1 className="text-[2.6rem] sm:text-[3.5rem] font-bold text-[#1A1917] tracking-tight leading-[1.06] mb-5">
            Omni Mail<br />
            <span className="relative inline-block">
              Unsubscriber
              {/* Wavy underline accent */}
              <svg
                aria-hidden
                className="absolute left-0 -bottom-1.5 w-full"
                height="5"
                viewBox="0 0 300 5"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 3.5 Q37.5 0.5 75 3 Q112.5 5.5 150 3 Q187.5 0.5 225 3 Q262.5 5.5 300 2.5"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md mx-auto">
            {t("home.problem")}
          </p>
          <p className="mt-1 text-base sm:text-lg font-semibold text-[#1A1917] leading-relaxed max-w-md mx-auto mb-9">
            {t("home.solution")}
          </p>

          {/* Email form */}
          <form onSubmit={onSubmit} className="w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-white rounded-2xl border border-stone-200 shadow-md shadow-stone-200/50">
              <input
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder={t("login.emailPh")}
                aria-label={t("home.emailLabel")}
                className="flex-1 px-3.5 py-2.5 bg-transparent text-sm text-[#1A1917] placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1A1917] hover:bg-[#2d2b28] active:scale-[.98] text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
              >
                {t("home.emailCta")}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-600 text-center">{error}</p>}
          </form>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[t("landing.feat1"), t("landing.feat2"), t("landing.feat3")].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-stone-200 text-xs font-medium text-slate-600"
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
      <section className="max-w-5xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-16">
        <h2 className="text-center text-lg sm:text-xl font-bold text-[#1A1917] mb-8 tracking-tight">
          {t("landing.how")}
        </h2>
        <div className="grid sm:grid-cols-3 rounded-2xl overflow-hidden border border-stone-200 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
          {[
            { n: "01", emoji: "✉️", title: t("landing.step1.t"), desc: t("landing.step1.d") },
            { n: "02", emoji: "🔍", title: t("landing.step2.t"), desc: t("landing.step2.d") },
            { n: "03", emoji: "🚫", title: t("landing.step3.t"), desc: t("landing.step3.d") },
          ].map((s) => (
            <div key={s.n} className="bg-white p-7 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{s.emoji}</span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">{s.n}</span>
              </div>
              <h3 className="font-semibold text-[#1A1917] text-sm leading-snug">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-stone-400">
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
