"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n, LANGS, LANG_META } from "@/lib/i18n";

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Chiudi al click fuori.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const meta = LANG_META[lang];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{meta.flag}</span>
        {!compact && <span>{meta.label}</span>}
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50"
          role="listbox"
        >
          {LANGS.map((l) => {
            const m = LANG_META[l];
            const active = l === lang;
            return (
              <li key={l}>
                <button
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    active ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span className="text-base leading-none">{m.flag}</span>
                  {m.label}
                  {active && (
                    <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
