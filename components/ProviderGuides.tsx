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
  { key: "icloud",  color: "from-slate-400 to-slate-600",   mono: "",  url: "https://appleid.apple.com/account/manage" },
  { key: "other",   color: "from-emerald-400 to-teal-500",  mono: "@" },
];

export default function ProviderGuides({
  highlight,
  vertical = false,
}: {
  highlight?: string;
  vertical?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>(highlight ?? "gmail");

  // ── Vertical accordion (right-column mode, matches form height) ──────────
  if (vertical) {
    return (
      <>
        {/* Desktop: vertical stack */}
        <div className="hidden lg:flex flex-col gap-2 h-full">
          {PROVIDERS.map((p) => {
            const isOpen = open === p.key;
            const isHighlighted = highlight === p.key;
            return (
              <div
                key={p.key}
                onClick={() => setOpen(isOpen ? null : p.key)}
                className="relative overflow-hidden rounded-2xl border bg-white cursor-pointer"
                style={{
                  flex: isOpen ? "3 1 0" : "1 1 0",
                  transition: "flex 0.4s cubic-bezier(0.4,0,0.2,1)",
                  borderColor: isOpen ? "#93C5FD" : isHighlighted ? "#BFDBFE" : "#E8E4DC",
                  minHeight: 0,
                }}
              >
                {/* Collapsed: icon + name in a row */}
                <div
                  className="absolute inset-0 flex items-center gap-3 px-4 select-none"
                  style={{
                    opacity: isOpen ? 0 : 1,
                    transition: "opacity 0.15s ease",
                    pointerEvents: isOpen ? "none" : "auto",
                  }}
                >
                  <span className={`w-7 h-7 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-xs`}>
                    {p.mono || <CloudIcon className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate">{t(`prov.${p.key}.name`)}</span>
                  <svg className="ml-auto w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Expanded: full content */}
                <div
                  className="flex flex-col h-full px-4 py-3 overflow-hidden"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.2s ease 0.15s",
                    pointerEvents: isOpen ? "auto" : "none",
                    animation: isOpen ? "providerReveal 0.25s ease 0.1s both" : "none",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2.5 shrink-0">
                    <span className={`w-7 h-7 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-xs`}>
                      {p.mono || <CloudIcon className="w-3.5 h-3.5" />}
                    </span>
                    <span className="font-semibold text-[#1A1917] text-sm">{t(`prov.${p.key}.name`)}</span>
                  </div>
                  <ol className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
                    {["s1", "s2", "s3"].map((s, i) => (
                      <li key={s} className="flex gap-2 text-xs text-slate-600 leading-snug">
                        <span className="w-4 h-4 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-[10px] mt-px">
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
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                      onClick={(e) => e.stopPropagation()}
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

        {/* Mobile: vertical standard accordion */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-3">
          {PROVIDERS.map((p) => {
            const isOpen = open === p.key;
            return (
              <div key={p.key} className={`rounded-2xl border bg-white transition-all ${isOpen ? "border-blue-200 shadow-sm" : "border-stone-200 hover:border-stone-300"}`}>
                <button onClick={() => setOpen(isOpen ? null : p.key)} className="w-full flex items-center gap-3 p-4 text-left">
                  <span className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm`}>
                    {p.mono || <CloudIcon className="w-5 h-5" />}
                  </span>
                  <span className="flex-1 font-semibold text-slate-900 text-sm">{t(`prov.${p.key}.name`)}</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 -mt-1">
                    <ol className="space-y-2">
                      {["s1", "s2", "s3"].map((s, i) => (
                        <li key={s} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-[11px]">{i + 1}</span>
                          <span>{t(`prov.${p.key}.${s}`)}</span>
                        </li>
                      ))}
                    </ol>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
                        {t("prov.openSite")}
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── Desktop: horizontal accordion ─────────────────────── */}
      <div className="hidden lg:flex gap-2" style={{ height: "210px" }}>
        {PROVIDERS.map((p) => {
          const isOpen = open === p.key;
          const isHighlighted = highlight === p.key;
          return (
            <div
              key={p.key}
              onClick={() => setOpen(isOpen ? null : p.key)}
              className="relative overflow-hidden rounded-2xl border bg-white cursor-pointer h-full"
              style={{
                flex: isOpen ? "4 1 0" : "1 1 0",
                transition: "flex 0.4s cubic-bezier(0.4,0,0.2,1)",
                borderColor: isOpen ? "#93C5FD" : isHighlighted ? "#BFDBFE" : "#E8E4DC",
                minWidth: 0,
              }}
            >
              {/* Collapsed: icon + name centered */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 select-none"
                style={{
                  opacity: isOpen ? 0 : 1,
                  transition: "opacity 0.15s ease",
                  pointerEvents: isOpen ? "none" : "auto",
                }}
              >
                <span
                  className={`w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm`}
                >
                  {p.mono || <CloudIcon className="w-4 h-4" />}
                </span>
                <span
                  className="text-[10px] font-semibold text-slate-500 text-center leading-tight"
                  style={{ wordBreak: "break-word" }}
                >
                  {t(`prov.${p.key}.name`)}
                </span>
              </div>

              {/* Expanded content */}
              <div
                className="flex flex-col h-full p-4 overflow-hidden"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: "opacity 0.2s ease 0.15s",
                  pointerEvents: isOpen ? "auto" : "none",
                  minWidth: "175px",
                  animation: isOpen ? "providerReveal 0.25s ease 0.1s both" : "none",
                }}
              >
                <div className="flex items-center gap-2 mb-2.5 shrink-0">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-xs`}
                  >
                    {p.mono || <CloudIcon className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-semibold text-slate-900 text-xs leading-tight">
                    {t(`prov.${p.key}.name`)}
                  </span>
                </div>
                <ol className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
                  {["s1", "s2", "s3"].map((s, i) => (
                    <li key={s} className="flex gap-1.5 text-[11px] text-slate-600 leading-snug">
                      <span className="w-4 h-4 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-[10px] mt-px">
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
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("prov.openSite")}
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile: vertical accordion ────────────────────────── */}
      <div className="lg:hidden grid sm:grid-cols-2 gap-3">
        {PROVIDERS.map((p) => {
          const isOpen = open === p.key;
          return (
            <div
              key={p.key}
              className={`rounded-2xl border bg-white transition-all ${
                isOpen ? "border-blue-200 shadow-sm" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.key)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center font-bold text-sm`}
                >
                  {p.mono || <CloudIcon className="w-5 h-5" />}
                </span>
                <span className="flex-1 font-semibold text-slate-900 text-sm">
                  {t(`prov.${p.key}.name`)}
                </span>
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
                        <span className="w-5 h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-[11px]">
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
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
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
    </>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 100-10 5.5 5.5 0 00-10.9 1.5A4 4 0 003 15z" />
    </svg>
  );
}
