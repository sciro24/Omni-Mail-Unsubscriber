"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const MSG_KEYS = ["load.0", "load.1", "load.2", "load.3", "load.4"];

export default function LoadingScreen() {
  const { t } = useI18n();
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsg((m) => (m + 1) % MSG_KEYS.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center gap-8">
      {/* Busta che fluttua con lettere che escono */}
      <div className="relative w-40 h-32">
        {/* lettere volanti */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-8 h-6 rounded-sm bg-white border border-indigo-200 shadow-sm"
            style={{
              animation: `letterFly 2.4s ease-in-out ${i * 0.5}s infinite`,
            }}
          >
            <div className="w-full h-1.5 bg-indigo-100 rounded-t-sm" />
            <div className="px-1 pt-1 space-y-0.5">
              <div className="h-0.5 bg-slate-200 rounded" />
              <div className="h-0.5 w-2/3 bg-slate-200 rounded" />
            </div>
          </div>
        ))}

        {/* busta */}
        <div
          className="absolute inset-x-0 bottom-0 mx-auto w-32 h-20"
          style={{ animation: "floatY 2.6s ease-in-out infinite" }}
        >
          <div className="w-full h-full rounded-xl bg-indigo-600 shadow-xl shadow-indigo-200 relative overflow-hidden">
            {/* aletta */}
            <div className="absolute inset-x-0 top-0 h-0 border-l-[64px] border-r-[64px] border-t-[40px] border-l-transparent border-r-transparent border-t-indigo-500" />
            <div className="absolute inset-x-0 top-0 mx-auto w-0 h-0 border-l-[64px] border-r-[64px] border-b-[40px] border-l-transparent border-r-transparent border-b-indigo-700/40" />
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-indigo-400"
            style={{ animation: `bounceDot 1s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>

      <p className="text-slate-500 text-sm font-medium h-5 transition-all">{t(MSG_KEYS[msg])}</p>
    </div>
  );
}
