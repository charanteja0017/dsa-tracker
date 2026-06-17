"use client";

import { Star } from "lucide-react";
import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES, DIFF_LABEL, DIFF_TAG, topicColor, rgba } from "@/lib/tokens";

// Sticky filter bar: difficulty chips, topic-colored pattern chips, a
// "hide completed" switch, and a "starred only" toggle (revision). No selection
// in a group means "all".
export function FilterBar({
  difficulties,
  onToggleDifficulty,
  patterns,
  selectedPatterns,
  onTogglePattern,
  hideCompleted,
  onToggleHideCompleted,
  starredOnly,
  onToggleStarred,
}: {
  difficulties: Set<Difficulty>;
  onToggleDifficulty: (d: Difficulty) => void;
  patterns: string[];
  selectedPatterns: Set<string>;
  onTogglePattern: (p: string) => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  starredOnly: boolean;
  onToggleStarred: () => void;
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
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition duration-150 active:scale-95 ${
                active
                  ? DIFF_TAG[d]
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
          className="flex items-center gap-2 rounded-md border border-edge px-2.5 py-1 text-xs font-medium text-slate-300 transition duration-150 hover:border-slate-600 active:scale-95"
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

        <button
          type="button"
          aria-pressed={starredOnly}
          onClick={onToggleStarred}
          title="Show only problems starred for revision"
          className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition duration-150 active:scale-95 ${
            starredOnly
              ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
              : "border-edge text-slate-400 hover:border-slate-600 hover:text-slate-200"
          }`}
        >
          <Star
            className="h-3.5 w-3.5"
            strokeWidth={2}
            fill={starredOnly ? "currentColor" : "none"}
          />
          Starred
        </button>
      </div>

      {patterns.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {patterns.map((p) => {
            const active = selectedPatterns.has(p);
            const c = topicColor(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => onTogglePattern(p)}
                className="rounded-md border px-2 py-0.5 text-xs transition duration-150 active:scale-95"
                style={
                  active
                    ? { color: c, backgroundColor: rgba(c, 0.15), borderColor: rgba(c, 0.45) }
                    : undefined
                }
              >
                <span className={active ? "" : "text-slate-500"}>{p}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
