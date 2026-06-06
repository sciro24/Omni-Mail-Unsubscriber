// Logo dell'app: busta con badge "unsubscribe" (cerchio col segno meno).
// Riutilizzabile in navbar e landing. `className` controlla la dimensione del box.

export default function Logo({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/60 ${className}`}
    >
      <svg className="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      {/* badge unsubscribe */}
      <span className="absolute -bottom-1 -right-1 w-1/2 h-1/2 max-w-6 max-h-6 rounded-full bg-rose-500 ring-2 ring-white flex items-center justify-center">
        <svg className="w-2/3 h-2/3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" d="M6 12h12" />
        </svg>
      </span>
    </div>
  );
}
