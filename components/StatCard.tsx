import type { ReactNode } from "react";
import { COLORS } from "@/lib/colors";
import { Sparkline } from "./Sparkline";

// Metric tile: quiet label, big mono number centered in the card, optional
// sub-line + trend sparkline. Fills its cell height so the 2×2 grid stays even.
export function StatCard({
  label,
  value,
  sub,
  icon,
  spark,
  sparkColor = COLORS.accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  spark?: number[];
  sparkColor?: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-edge bg-panel p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="flex flex-1 flex-col justify-center py-1">
        <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-100">
          {value}
        </div>
        {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      </div>
      {spark && spark.length > 1 ? (
        <Sparkline data={spark} color={sparkColor} className="h-7 w-full" />
      ) : (
        <div className="h-7" aria-hidden />
      )}
    </div>
  );
}
