"use client";

import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES, DIFF_CHIP, DIFF_LABEL } from "@/lib/study";

// Sticky filter bar for the full list: difficulty chips, pattern chips, and a
// "hide completed" switch. No selection in a group means "all". Applies to the
// list only (not the Week Focus panel).
export function FilterBar({
  difficulties,
  onToggleDifficulty,
  patterns,
  selectedPatterns,
  onTogglePattern,
  hideCompleted,
  onToggleHideCompleted,
}: {
  difficulties: Set<Difficulty>;
  onToggleDifficulty: (d: Difficulty) => void;
  patterns: string[];
  selectedPatterns: Set<string>;
  onTogglePattern: (p: string) => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {DIFFICULTIES.map((d) => {
          const active = difficulties.has(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleDifficulty(d)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? DIFF_CHIP[d]
                  : "border-edge text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {DIFF_LABEL[d]}
            </button>
          );
        })}

        <span className="mx-1 h-5 w-px bg-edge" aria-hidden />

        <button
          type="button"
          role="switch"
          aria-checked={hideCompleted}
          onClick={onToggleHideCompleted}
          className="flex items-center gap-2 rounded-md border border-edge px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-600"
        >
          <span
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
              hideCompleted ? "bg-accent" : "bg-slate-700"
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

      {patterns.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {patterns.map((p) => {
            const active = selectedPatterns.has(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => onTogglePattern(p)}
                className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  active
                    ? "border-accent/50 bg-accent/15 text-accent-fg"
                    : "border-edge text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
