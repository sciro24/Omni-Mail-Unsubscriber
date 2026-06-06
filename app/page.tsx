"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { REPO_URL } from "@/lib/config";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top bar: lingua + GitHub */}
      <div className="flex items-center justify-end gap-2 p-4">
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
        <LanguageSelector />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-16">
        <div className="w-full max-w-sm mx-auto px-6">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <Logo className="w-14 h-14" />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{t("brand")}</h1>
            <p className="text-slate-500 text-base leading-relaxed">{t("landing.tagline")}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all duration-150 text-sm shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
              </svg>
              {t("landing.google")}
            </button>

            <div className="flex items-center gap-3 my-3">
              <span className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">{t("landing.or")}</span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <button
              onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-all duration-150 text-sm shadow-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#7FBA00" d="M12 1h10v10H12z" />
                <path fill="#00A4EF" d="M1 12h10v10H1z" />
                <path fill="#FFB900" d="M12 12h10v10H12z" />
              </svg>
              {t("landing.microsoft")}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400 leading-relaxed">
              {t("landing.privacy1")}
              <br />
              {t("landing.privacy2")}
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "🔍", label: t("landing.feat1") },
              { icon: "⚡", label: t("landing.feat2") },
              { icon: "🔒", label: t("landing.feat3") },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5">
                <span className="text-xl">{f.icon}</span>
                <span className="text-xs text-slate-400 leading-tight">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
