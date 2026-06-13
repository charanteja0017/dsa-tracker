"use client";

import type { WeekGroup } from "@/lib/types";
import { ProblemRow } from "./ProblemRow";
import { ProgressBar } from "./ProgressBar";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${
        open ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Collapsible week accordion. Header shows week number, topic label, and a
// done/total ratio with a progress bar. Body groups problems by pattern.
export function WeekSection({
  group,
  open,
  isCurrent,
  onToggle,
  onToggleProblem,
}: {
  group: WeekGroup;
  open: boolean;
  isCurrent: boolean;
  onToggle: (week: number) => void;
  onToggleProblem: (id: number, done: boolean) => void;
}) {
  const complete = group.done === group.total;
  return (
    <section className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(group.week)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
      >
        <Chevron open={open} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-400">
              Week {group.week}
            </span>
            {isCurrent && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                current
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {group.topic}
          </div>
        </div>
        <div className="w-20 sm:w-32 shrink-0">
          <div className="flex justify-end items-center gap-1 text-[11px] text-slate-400 mb-1 tabular-nums">
            {complete && <span className="text-emerald-400">✓</span>}
            {group.done}/{group.total}
          </div>
          <ProgressBar
            value={group.done}
            max={group.total}
            barClass={complete ? "bg-emerald-500" : "bg-blue-500"}
          />
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-4">
          {group.patterns.map((pg) => (
            <div key={pg.pattern}>
              <div className="flex items-center gap-2 px-1 pt-1 pb-1.5">
                <h4 className="text-xs font-medium text-slate-300">
                  {pg.pattern}
                </h4>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {pg.done}/{pg.total}
                </span>
              </div>
              <div className="space-y-1.5">
                {pg.problems.map((p) => (
                  <ProblemRow key={p.id} problem={p} onToggle={onToggleProblem} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
