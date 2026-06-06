"use client";
import { useI18n } from "@/lib/i18n";

type Props = {
  open: boolean;
  count: number;
  names: string[];
  manual: number;
  onClose: () => void;
  onGoRemoved: () => void;
};

export default function SuccessModal({ open, count, names, manual, onClose, onGoRemoved }: Props) {
  const { t } = useI18n();
  if (!open) return null;

  const title = count === 1 ? t("modal.titleOne") : t("modal.titleMany", { n: count });
  const subject = count === 1 ? names[0] : t("modal.subjectMany", { n: count });

  // Template RAW (senza vars → i placeholder restano letterali), poi split sui token
  // così {subject} e {removed} restano stilizzati indipendentemente dalla lingua.
  const tmpl = count === 1 ? t("modal.bodyOne") : t("modal.bodyMany");
  const bodyParts = tmpl.split(/(\{subject\}|\{removed\})/).map((part, i) => {
    if (part === "{subject}") return <span key={i} className="font-medium text-slate-700">{subject}</span>;
    if (part === "{removed}") return <span key={i} className="font-semibold text-indigo-600">{t("modal.removed")}</span>;
    return <span key={i}>{part}</span>;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeBackdrop_.15s_ease-out]"
        onClick={onClose}
      />
      {/* card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center animate-[popIn_.2s_ease-out]">
        {/* check animato */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center animate-[popIn_.3s_.05s_both]">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-sm text-slate-500 mb-1">{bodyParts}</p>

        {manual > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            {manual === 1 ? t("modal.manualOne", { n: manual }) : t("modal.manualMany", { n: manual })}
          </p>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {t("modal.continue")}
          </button>
          <button
            onClick={onGoRemoved}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            {t("modal.goRemoved")}
          </button>
        </div>
      </div>
    </div>
  );
}
