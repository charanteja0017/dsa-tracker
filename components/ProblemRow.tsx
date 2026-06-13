"use client";

import type { Problem } from "@/lib/types";
import { Tag } from "./Tag";

// Full-width desktop row: checkbox · title→LeetCode · pattern · difficulty · co.
export function ProblemRow({
  problem,
  onToggle,
}: {
  problem: Problem;
  onToggle: (id: number, done: boolean) => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-edge/70 bg-panel/40 px-3 py-2 transition-colors hover:bg-panel2/60">
      <input
        type="checkbox"
        checked={problem.done}
        onChange={(e) => onToggle(problem.id, e.target.checked)}
        aria-label={`Mark ${problem.title} done`}
        className="h-4 w-4 shrink-0 accent-[#6366f1]"
      />
      <a
        href={problem.link}
        target="_blank"
        rel="noreferrer"
        className={`min-w-0 flex-1 truncate text-sm ${
          problem.done
            ? "text-slate-600 line-through"
            : "text-slate-100 group-hover:text-accent-fg"
        }`}
      >
        {problem.title}
      </a>
      <Tag variant="pattern" value={problem.pattern} className="hidden lg:inline-flex" />
      <Tag variant="difficulty" value={problem.difficulty} />
      <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">
        {problem.companies}co
      </span>
    </div>
  );
}
