"use client";

import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES, DIFF_CHIP, DIFF_LABEL } from "@/lib/study";

// Lightweight filter bar: difficulty toggle chips + a "hide completed" switch.
// Selecting no difficulty chips means "show all".
export function FilterBar({
  difficulties,
  onToggleDifficulty,
  hideCompleted,
  onToggleHideCompleted,
}: {
  difficulties: Set<Difficulty>;
  onToggleDifficulty: (d: Difficulty) => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {DIFFICULTIES.map((d) => {
        const active = difficulties.has(d);
        return (
          <button
            key={d}
            type="button"
            aria-pressed={active}
            onClick={() => onToggleDifficulty(d)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              active
                ? DIFF_CHIP[d]
                : "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >
            {DIFF_LABEL[d]}
          </button>
        );
      })}

      <span className="mx-1 h-5 w-px bg-slate-700/70" aria-hidden />

      <button
        type="button"
        role="switch"
        aria-checked={hideCompleted}
        onClick={onToggleHideCompleted}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-700 text-xs font-medium text-slate-300 hover:border-slate-600"
      >
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            hideCompleted ? "bg-blue-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              hideCompleted ? "translate-x-3.5" : "translate-x-0.5"
            }`}
          />
        </span>
        Hide completed
      </button>
    </div>
  );
}
