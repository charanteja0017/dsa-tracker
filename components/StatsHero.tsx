import { Flame } from "lucide-react";
import type { Stats } from "@/lib/types";
import { HatchedBar } from "./HatchedBar";

// Hero card: solved + streak + percent numbers on top, full-width hatched
// progress bar along the bottom. Oversized display numbers.
export function StatsHero({ stats }: { stats: Stats }) {
  return (
    <div className="flex h-full flex-col justify-center gap-5 rounded-xl border border-edge bg-panel px-6 py-5 shadow-card">
      {/* Numbers row */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-0">
        {/* Solved */}
        <div className="flex items-baseline gap-3 md:flex-1">
          <span className="font-display text-6xl font-black leading-none tracking-tighter text-slate-50 tabular-nums">
            {stats.solved}
          </span>
          <span className="flex flex-col text-sm leading-tight text-slate-400">
            <span className="font-medium text-slate-300">solved</span>
            <span>of {stats.total}</span>
          </span>
        </div>

        <div className="hidden h-12 w-px bg-edge md:block" />

        {/* Streak */}
        <div className="flex items-center gap-3 md:flex-1 md:justify-center">
          <Flame className="h-9 w-9 shrink-0 text-amber-400" />
          <span className="font-display text-6xl font-black leading-none tracking-tighter text-slate-50 tabular-nums">
            {stats.streak}
          </span>
          <span className="flex flex-col text-sm leading-tight text-slate-400">
            <span>day</span>
            <span>streak</span>
          </span>
        </div>

        <div className="hidden h-12 w-px bg-edge md:block" />

        {/* Percent */}
        <div className="flex items-baseline gap-2 md:flex-1 md:justify-end">
          <span className="font-display text-6xl font-black leading-none tracking-tighter text-indigo-300 tabular-nums">
            {stats.percent}%
          </span>
          <span className="text-sm text-slate-400">done</span>
        </div>
      </div>

      {/* Full-width progress bar at the bottom */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-xs text-slate-400">
          <span>Progress to {stats.total}</span>
          <span className="font-mono tabular-nums text-slate-500">
            {stats.solved}/{stats.total}
          </span>
        </div>
        <HatchedBar percent={stats.percent} />
      </div>
    </div>
  );
}
