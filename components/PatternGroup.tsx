"use client";

import type { PatternGroup as PatternGroupType } from "@/lib/types";
import { ProblemRow } from "./ProblemRow";
import { Tag } from "./Tag";

// A pattern sub-group inside a week: labelled header + its problem rows.
export function PatternGroup({
  group,
  onToggleProblem,
}: {
  group: PatternGroupType;
  onToggleProblem: (id: number, done: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-1 pb-1.5 pt-1">
        <Tag variant="pattern" value={group.pattern} />
        <span className="font-mono text-xs tabular-nums text-slate-500">
          {group.done}/{group.total}
        </span>
      </div>
      <div className="space-y-1">
        {group.problems.map((p) => (
          <ProblemRow key={p.id} problem={p} onToggle={onToggleProblem} />
        ))}
      </div>
    </div>
  );
}
