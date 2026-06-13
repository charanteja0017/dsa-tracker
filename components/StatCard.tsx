import type { ReactNode } from "react";

// Compact stat tile used in the top grid. Large value, quiet label.
export function StatCard({
  label,
  value,
  accent = "text-slate-100",
}: {
  label: string;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3.5 sm:p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
        {label}
      </div>
      <div className={`text-xl sm:text-2xl font-bold leading-tight ${accent}`}>
        {value}
      </div>
    </div>
  );
}
