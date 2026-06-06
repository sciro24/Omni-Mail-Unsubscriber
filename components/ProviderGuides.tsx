"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Provider = {
  key: string;
  color: string;
  mono: string;
  url?: string;
};

const PROVIDERS: Provider[] = [
  { key: "gmail",   color: "from-red-400 to-orange-400",    mono: "G", url: "https://myaccount.google.com/apppasswords" },
  { key: "outlook", color: "from-sky-400 to-blue-500",      mono: "O", url: "https://account.live.com/proofs/AppPassword" },
  { key: "yahoo",   color: "from-violet-500 to-purple-600", mono: "Y", url: "https://login.yahoo.com/account/security" },
  { key: "icloud",  color: "from-slate-400 to-slate-600",   mono: "", url: "https://appleid.apple.com/account/manage" },
  { key: "other",   color: "from-emerald-400 to-teal-500",  mono: "@" },
];

export default function ProviderGuides({
  highlight,
  allOpen = false,
}: {
  highlight?: string;
  allOpen?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>(highlight ?? "gmail");

  if (allOpen) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PROVIDERS.map((p) => {
          const isHighlighted = highlight === p.key;
          return (
            <div
              key={p.key}
              className={`rounded-2xl border bg-white flex flex-col ${
                isHighlighted
                  ? "border-indigo-300 shadow-md ring-1 ring-indigo-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm`}
                >
                  {p.mono || <CloudIcon className="w-4 h-4" />}
                </span>
                <span className="font-semibold text-slate-900 text-sm leading-tight">
                  {t(`prov.${p.key}.name`)}
                </span>
              </div>
              <div className="px-4 pb-4 flex-1 flex flex-col">
                <ol className="space-y-2.5 flex-1">
                  {["s1", "s2", "s3"].map((s, i) => (
                    <li key={s} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-[11px] mt-px">
                        {i + 1}
                      </span>
                      <span>{t(`prov.${p.key}.${s}`)}</span>
                    </li>
                  ))}
                </ol>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {t("prov.openSite")}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {PROVIDERS.map((p) => {
        const isOpen = open === p.key;
        return (
          <div
            key={p.key}
            className={`rounded-2xl border bg-white transition-all ${
              isOpen ? "border-indigo-200 shadow-md" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : p.key)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm`}>
                {p.mono || <CloudIcon className="w-5 h-5" />}
              </span>
              <span className="flex-1 font-semibold text-slate-900 text-sm">{t(`prov.${p.key}.name`)}</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 -mt-1">
                <ol className="space-y-2">
                  {["s1", "s2", "s3"].map((s, i) => (
                    <li key={s} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-[11px]">
                        {i + 1}
                      </span>
                      <span>{t(`prov.${p.key}.${s}`)}</span>
                    </li>
                  ))}
                </ol>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {t("prov.openSite")}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 100-10 5.5 5.5 0 00-10.9 1.5A4 4 0 003 15z" />
    </svg>
  );
}
