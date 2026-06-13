import type { ReactNode } from "react";
import { COLORS } from "@/lib/colors";
import { Sparkline } from "./Sparkline";

// Metric tile: quiet label, big mono number, optional sub-line + trend sparkline.
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
    <div className="flex flex-col rounded-xl border border-edge bg-panel p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="mt-1 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-100">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      {spark && spark.length > 1 && (
        <Sparkline data={spark} color={sparkColor} className="mt-auto h-7 w-full pt-2" />
      )}
    </div>
  );
}
