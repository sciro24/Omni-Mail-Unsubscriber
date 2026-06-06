"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/session-client";

export default function LoginForm() {
  const { t } = useI18n();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [showHosts, setShowHosts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errMsg = (code: string) =>
    ({
      "auth-failed": t("login.err.auth"),
      "need-hosts": t("login.err.hosts"),
      "missing-credentials": t("login.err.missing"),
      network: t("login.err.network"),
    }[code] ?? t("login.err.auth"));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("login.err.missing"));
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login({
      email,
      password,
      ...(showHosts && imapHost ? { imapHost } : {}),
      ...(showHosts && smtpHost ? { smtpHost } : {}),
    });
    setLoading(false);
    if (!res.ok) {
      if (res.error === "need-hosts") setShowHosts(true);
      setError(errMsg(res.error));
    }
    // success → AuthProvider aggiorna lo stato, la pagina reindirizza a /dashboard
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t("login.email")}</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.emailPh")}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t("login.password")}</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("login.passwordPh")}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
        />
        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t("login.passwordHint")}</p>
      </div>

      {showHosts && (
        <div className="grid grid-cols-1 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t("login.imapHost")}</label>
            <input
              value={imapHost}
              onChange={(e) => setImapHost(e.target.value)}
              placeholder="imap.example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t("login.smtpHost")}</label>
            <input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.example.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 leading-snug">{error}</p>
      )}

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
        {loading ? t("login.connecting") : t("login.submit")}
      </button>

      {!showHosts && (
        <button
          type="button"
          onClick={() => setShowHosts(true)}
          className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          {t("login.advanced")}
        </button>
      )}

      {/* Aiuto app-password */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${showHelp ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {t("login.help.title")}
        </button>
        {showHelp && (
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-500 leading-snug list-disc list-inside">
            <li>{t("login.help.gmail")}</li>
            <li>{t("login.help.outlook")}</li>
            <li>{t("login.help.generic")}</li>
          </ul>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-snug flex items-start gap-1.5 pt-1">
        <svg className="w-3.5 h-3.5 shrink-0 mt-px text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {t("login.secure")}
      </p>
    </form>
  );
}
