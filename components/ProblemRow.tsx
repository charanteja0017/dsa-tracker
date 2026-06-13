"use client";

import type { Problem } from "@/lib/types";
import { DIFF_LABEL, DIFF_TEXT } from "@/lib/study";

// A single problem: big checkbox tap target, LeetCode link, difficulty + company
// count. Wraps cleanly on narrow screens — no fixed-width columns, no h-scroll.
export function ProblemRow({
  problem,
  onToggle,
}: {
  problem: Problem;
  onToggle: (id: number, done: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 border border-slate-800/60 px-3 py-2.5">
      <input
        type="checkbox"
        checked={problem.done}
        onChange={(e) => onToggle(problem.id, e.target.checked)}
        aria-label={`Mark ${problem.title} done`}
        className="w-5 h-5 accent-blue-500 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className={`block truncate text-sm ${
            problem.done
              ? "line-through text-slate-600"
              : "text-slate-100 hover:underline"
          }`}
        >
          {problem.title}
        </a>
        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
          <span className={DIFF_TEXT[problem.difficulty] ?? "text-slate-400"}>
            {DIFF_LABEL[problem.difficulty as keyof typeof DIFF_LABEL] ??
              problem.difficulty}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">{problem.companies} co</span>
        </div>
      </div>
    </div>
  );
}
