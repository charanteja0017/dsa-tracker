"use client";

import { ArrowRight } from "lucide-react";
import type { Problem } from "@/lib/types";
import { WEEK_TOPICS, focusProblems } from "@/lib/study";
import { Tag } from "./Tag";
import { Checkbox } from "./Checkbox";
import { ProgressRing } from "./ProgressRing";
import { YouTubeIcon } from "./YouTubeIcon";

// Accent-bordered hero: an adaptive checklist — the current week's problems,
// plus carried-over incompletes from earlier weeks, plus next week's once the
// current week is finished early. Ring tracks the current week's completion.
export function WeekFocusPanel({
  weekNum,
  problems,
  onToggle,
  canEdit = true,
}: {
  weekNum: number;
  problems: Problem[];
  onToggle: (id: number, done: boolean) => void;
  canEdit?: boolean;
}) {
  const items = focusProblems(problems, weekNum);
  const weekItems = problems.filter((p) => p.week === weekNum);
  const done = weekItems.filter((p) => p.done).length;
  const topic = WEEK_TOPICS[weekNum] ?? "Pattern practice";
  const next = WEEK_TOPICS[weekNum + 1];

  return (
    <section className="flex h-full flex-col rounded-xl border border-accent/40 bg-gradient-to-b from-panel2 to-panel p-4 shadow-card ring-1 ring-accent/10">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent-fg">
            This week · focus
          </div>
          <h2 className="mt-0.5 truncate text-xl font-semibold text-slate-100">
            Week {weekNum}: {topic}
          </h2>
        </div>
        <ProgressRing value={done} max={weekItems.length} size={54} />
      </div>

      <div className="mt-3 max-h-[360px] min-h-0 flex-1 space-y-1.5 overflow-y-auto scroll-thin pr-1">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-edge bg-panel/50 p-4 text-sm text-slate-400">
            No problems mapped to this week. Focus on{" "}
            <span className="font-medium text-slate-200">{topic}</span> — drill
            the pattern and revisit your weak spots.
          </div>
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 rounded-lg border border-edge bg-panel/60 px-2.5 py-2 transition-colors hover:border-slate-700 hover:bg-panel2/70"
            >
              <Checkbox
                checked={p.done}
                onChange={(v) => onToggle(p.id, v)}
                label={`Mark ${p.title} done`}
                disabled={!canEdit}
              />
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className={`min-w-0 flex-1 truncate text-sm ${
                  p.done
                    ? "text-slate-600 line-through"
                    : "text-slate-100 hover:text-accent-fg"
                }`}
              >
                {p.title}
              </a>
              {p.youtube && (
                <a
                  href={p.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Watch ${p.title} on YouTube`}
                  title="Watch on YouTube"
                  className="shrink-0 text-red-600 transition-opacity hover:opacity-80"
                >
                  <YouTubeIcon className="h-4 w-4" />
                </a>
              )}
              {p.week !== weekNum && (
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    p.week < weekNum
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-slate-500/15 text-slate-300"
                  }`}
                  title={
                    p.week < weekNum
                      ? `Carried over from week ${p.week}`
                      : `From week ${p.week} (ahead)`
                  }
                >
                  W{p.week}
                </span>
              )}
              <Tag variant="topic" value={p.pattern} className="hidden lg:inline-flex" />
              <Tag variant="difficulty" value={p.difficulty} />
            </div>
          ))
        )}
      </div>

      {next && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-edge pt-2.5 text-xs text-slate-500">
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          Next week: <span className="font-medium text-slate-300">{next}</span>
        </div>
      )}
    </section>
  );
}
