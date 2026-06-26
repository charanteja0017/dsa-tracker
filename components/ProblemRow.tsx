"use client";

import type { Problem } from "@/lib/types";
import { Tag } from "./Tag";
import { Checkbox } from "./Checkbox";
import { YouTubeIcon } from "./YouTubeIcon";
import { StarButton } from "./StarButton";

// Full-width desktop row: checkbox · title→LeetCode · topic tag · difficulty tag
// · "{companies}co" · star. Both tags inline. Wraps cleanly on narrow screens.
export function ProblemRow({
  problem,
  onToggle,
  onToggleStar,
  canEdit = true,
}: {
  problem: Problem;
  onToggle: (id: number, done: boolean) => void;
  onToggleStar?: (id: number, starred: boolean) => void;
  canEdit?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-edge/70 bg-panel/40 px-3 py-2 transition-[background-color,border-color,transform] duration-150 hover:-translate-y-px hover:border-slate-200 hover:bg-panel2/60">
      <Checkbox
        checked={problem.done}
        onChange={(v) => onToggle(problem.id, v)}
        label={`Mark ${problem.title} done`}
        disabled={!canEdit}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className={`min-w-0 truncate text-sm transition-colors duration-200 ${
            problem.done
              ? "text-slate-400 line-through"
              : "text-slate-900 group-hover:text-accent-fg"
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
            className="shrink-0 text-red-600 transition-opacity hover:opacity-80"
          >
            <YouTubeIcon className="h-4 w-4" />
          </a>
        )}
      </div>
      <Tag variant="topic" value={problem.pattern} className="hidden xl:inline-flex" />
      <Tag variant="difficulty" value={problem.difficulty} />
      <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">
        {problem.companies}co
      </span>
      {onToggleStar && (
        <StarButton
          starred={problem.starred}
          onToggle={(v) => onToggleStar(problem.id, v)}
          disabled={!canEdit}
        />
      )}
    </div>
  );
}
