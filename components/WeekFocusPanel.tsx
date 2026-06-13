"use client";

import { ArrowRight } from "lucide-react";
import type { Problem } from "@/lib/types";
import { WEEK_TOPICS } from "@/lib/study";
import { Tag } from "./Tag";
import { ProgressRing } from "./ProgressRing";

// The hero panel opened first every day: this week's problems as an actionable
// checklist, a progress ring, and a next-week hint. Never renders blank.
export function WeekFocusPanel({
  weekNum,
  problems,
  onToggle,
}: {
  weekNum: number;
  problems: Problem[];
  onToggle: (id: number, done: boolean) => void;
}) {
  const items = problems
    .filter((p) => p.week === weekNum)
    .sort((a, b) => b.companies - a.companies || a.title.localeCompare(b.title));
  const done = items.filter((p) => p.done).length;
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
          <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500">
            {done}/{items.length} done
          </p>
        </div>
        <ProgressRing value={done} max={items.length} size={64} />
      </div>

      <div className="mt-3 min-h-0 flex-1">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-edge bg-panel/50 p-4 text-sm text-slate-400">
            No must-do problems seeded for this week. Focus on{" "}
            <span className="font-medium text-slate-200">{topic}</span> — drill
            the pattern, revisit notes, and log your reps below.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {items.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2.5 rounded-lg border border-edge bg-panel/60 px-2.5 py-2"
              >
                <input
                  type="checkbox"
                  checked={p.done}
                  onChange={(e) => onToggle(p.id, e.target.checked)}
                  aria-label={`Mark ${p.title} done`}
                  className="h-4 w-4 shrink-0 accent-[#6366f1]"
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
                <Tag variant="difficulty" value={p.difficulty} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {next && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-edge pt-2.5 text-xs text-slate-500">
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          Next week:{" "}
          <span className="font-medium text-slate-300">{next}</span>
        </div>
      )}
    </section>
  );
}
