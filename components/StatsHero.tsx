import { Flame } from "lucide-react";
import type { Stats } from "@/lib/types";
import { HatchedBar } from "./HatchedBar";

// Hero card: oversized solved + streak numbers on top, then a PROGRESS row
// (label left, big % right) above a full-width hatched bar.
export function StatsHero({ stats }: { stats: Stats }) {
  return (
    <div className="flex h-full flex-col justify-center gap-8 rounded-xl border border-edge bg-panel px-7 py-6 shadow-card">
      {/* Numbers */}
      <div className="flex flex-wrap items-center gap-x-14 gap-y-6">
        {/* Solved */}
        <div className="flex items-baseline gap-3">
          <span className="font-display text-8xl font-black leading-none tracking-tighter text-slate-50 tabular-nums">
            {stats.solved}
          </span>
          <span className="flex flex-col text-base leading-tight text-slate-400">
            <span className="font-semibold text-slate-200">solved</span>
            <span>/{stats.total}</span>
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3">
          <Flame className="h-10 w-10 shrink-0 text-amber-400" />
          <span className="font-display text-8xl font-black leading-none tracking-tighter text-slate-50 tabular-nums">
            {stats.streak}
          </span>
          <span className="flex flex-col text-base leading-tight text-slate-400">
            <span>day</span>
            <span>streak</span>
          </span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-end justify-between">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Progress
          </span>
          <span className="font-display text-5xl font-black leading-none tracking-tighter text-accent tabular-nums">
            {stats.percent}%
          </span>
        </div>
        <HatchedBar percent={stats.percent} />
      </div>
    </div>
  );
}
