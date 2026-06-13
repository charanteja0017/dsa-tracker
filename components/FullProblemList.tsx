"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty, Problem } from "@/lib/types";
import { allPatterns, groupProblems } from "@/lib/study";
import { FilterBar } from "./FilterBar";
import { WeekSection } from "./WeekSection";

// Self-contained study list: owns its filter + accordion state (filters affect
// only this list). Toggling a problem bubbles up so the page can refresh stats.
export function FullProblemList({
  problems,
  currentWeek,
  onToggleProblem,
}: {
  problems: Problem[];
  currentWeek?: number;
  onToggleProblem: (id: number, done: boolean) => void;
}) {
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const didInit = useRef(false);

  const patterns = useMemo(() => allPatterns(problems), [problems]);
  const weekGroups = useMemo(
    () => groupProblems(problems, { difficulties, patterns: selectedPatterns, hideCompleted }),
    [problems, difficulties, selectedPatterns, hideCompleted]
  );

  // Auto-expand the current week once data + current week are known.
  useEffect(() => {
    if (didInit.current || currentWeek === undefined || problems.length === 0) return;
    didInit.current = true;
    setOpenWeeks(new Set([currentWeek]));
  }, [currentWeek, problems]);

  const toggleSet = <T,>(setter: (fn: (prev: Set<T>) => Set<T>) => void) => (v: T) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  const doneTotal = problems.filter((p) => p.done).length;

  return (
    <section className="flex max-h-[760px] flex-col rounded-xl border border-edge bg-panel shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-200">Study plan</h3>
        <span className="font-mono text-xs tabular-nums text-slate-500">
          {doneTotal}/{problems.length} solved
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        <div className="sticky top-0 z-10 border-b border-edge bg-panel/95 px-3 py-2.5 backdrop-blur">
          <FilterBar
            difficulties={difficulties}
            onToggleDifficulty={toggleSet<Difficulty>(setDifficulties)}
            patterns={patterns}
            selectedPatterns={selectedPatterns}
            onTogglePattern={toggleSet<string>(setSelectedPatterns)}
            hideCompleted={hideCompleted}
            onToggleHideCompleted={() => setHideCompleted((v) => !v)}
          />
        </div>

        <div className="space-y-1.5 p-3">
          {weekGroups.map((g) => (
            <WeekSection
              key={g.week}
              group={g}
              open={openWeeks.has(g.week)}
              isCurrent={g.week === currentWeek}
              onToggle={toggleSet<number>(setOpenWeeks)}
              onToggleProblem={onToggleProblem}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
