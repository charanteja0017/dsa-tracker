"use client";

import { SquarePlay } from "lucide-react";
import type { Problem } from "@/lib/types";
import { Tag } from "./Tag";
import { Checkbox } from "./Checkbox";

// Full-width desktop row: checkbox · title→LeetCode · topic tag · difficulty tag
// · "{companies}co". Both tags inline. Wraps cleanly on narrow screens.
export function ProblemRow({
  problem,
  onToggle,
}: {
  problem: Problem;
  onToggle: (id: number, done: boolean) => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-edge/70 bg-panel/40 px-3 py-2 transition-colors hover:bg-panel2/60">
      <Checkbox
        checked={problem.done}
        onChange={(v) => onToggle(problem.id, v)}
        label={`Mark ${problem.title} done`}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className={`min-w-0 truncate text-sm ${
            problem.done
              ? "text-slate-600 line-through"
              : "text-slate-100 group-hover:text-accent-fg"
          }`}
        >
          {problem.title}
        </a>
        {problem.youtube && (
          <a
            href={problem.youtube}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch ${problem.title} on YouTube`}
            title="Watch on YouTube"
            className="shrink-0 text-slate-500 transition-colors hover:text-red-500"
          >
            <SquarePlay className="h-4 w-4" />
          </a>
        )}
      </div>
      <Tag variant="topic" value={problem.pattern} className="hidden xl:inline-flex" />
      <Tag variant="difficulty" value={problem.difficulty} />
      <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">
        {problem.companies}co
      </span>
    </div>
  );
}
