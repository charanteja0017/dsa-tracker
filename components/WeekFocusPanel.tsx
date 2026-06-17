"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Problem } from "@/lib/types";
import { WEEK_TOPICS, focusProblems } from "@/lib/study";
import { Tag } from "./Tag";
import { Checkbox } from "./Checkbox";
import { ProgressRing } from "./ProgressRing";
import { YouTubeIcon } from "./YouTubeIcon";
import { Collapse } from "./Collapse";
import { CompanyBadge } from "./CompanyBadge";
import { StarButton } from "./StarButton";

type Group = {
  week: number;
  topic: string;
  problems: Problem[];
  done: number;
  total: number;
};

// Accent-bordered hero: an adaptive checklist grouped into collapsible week
// sections (like the study plan). The current week, carried-over incompletes,
// and next week (once caught up) each get a section. A fully completed week
// collapses by default so the list stays about what's left.
export function WeekFocusPanel({
  weekNum,
  problems,
  onToggle,
  onToggleStar,
  canEdit = true,
}: {
  weekNum: number;
  problems: Problem[];
  onToggle: (id: number, done: boolean) => void;
  onToggleStar?: (id: number, starred: boolean) => void;
  canEdit?: boolean;
}) {
  const items = focusProblems(problems, weekNum);

  // The week you're actually working on: the earliest week in the focus set
  // that still has incomplete problems (you may be ahead of the calendar week).
  // The header, ring, and "next week" hint all track this active week so the
  // progress reflects what's left, not a week you already finished.
  const focusWeeks = Array.from(new Set(items.map((p) => p.week))).sort(
    (a, b) => a - b
  );
  const activeWeek =
    focusWeeks.find((w) =>
      problems.some((p) => p.week === w && !p.done)
    ) ??
    focusWeeks[focusWeeks.length - 1] ??
    weekNum;
  const lastFocusWeek = focusWeeks[focusWeeks.length - 1] ?? weekNum;

  const weekItems = problems.filter((p) => p.week === activeWeek);
  const ringDone = weekItems.filter((p) => p.done).length;
  const topic = WEEK_TOPICS[activeWeek] ?? "Pattern practice";
  const next = WEEK_TOPICS[lastFocusWeek + 1];

  // Group the focus set by week; header counts reflect the real week totals.
  // Active weeks first (in week order); fully-completed weeks sink to the bottom.
  const groups: Group[] = Array.from(new Set(items.map((p) => p.week)))
    .map((w) => ({
      week: w,
      topic: WEEK_TOPICS[w] ?? "Pattern practice",
      problems: items
        .filter((p) => p.week === w)
        .sort(
          (a, b) =>
            Number(a.done) - Number(b.done) ||
            b.companies - a.companies ||
            a.title.localeCompare(b.title)
        ),
      total: problems.filter((p) => p.week === w).length,
      done: problems.filter((p) => p.week === w && p.done).length,
    }))
    .sort((a, b) => {
      const ac = a.total > 0 && a.done === a.total ? 1 : 0;
      const bc = b.total > 0 && b.done === b.total ? 1 : 0;
      return ac - bc || a.week - b.week;
    });

  // Open by default when a week still has incomplete problems; collapse a fully
  // done week. User clicks override that default for the session.
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});
  const defaultOpen = (g: Group) => g.problems.some((p) => !p.done);
  const isOpen = (g: Group) => overrides[g.week] ?? defaultOpen(g);
  const toggleWeek = (g: Group) =>
    setOverrides((o) => ({ ...o, [g.week]: !(o[g.week] ?? defaultOpen(g)) }));

  const renderRow = (p: Problem) => (
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
      {p.companies > 0 && <CompanyBadge count={p.companies} />}
      <Tag variant="topic" value={p.pattern} className="hidden lg:inline-flex" />
      <Tag variant="difficulty" value={p.difficulty} />
      {onToggleStar && (
        <StarButton
          starred={p.starred}
          onToggle={(v) => onToggleStar(p.id, v)}
          disabled={!canEdit}
        />
      )}
    </div>
  );

  return (
    <section className="flex h-full flex-col rounded-xl border border-accent/40 bg-gradient-to-b from-panel2 to-panel p-4 shadow-card ring-1 ring-accent/10">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent-fg">
            This week · focus
          </div>
          <h2 className="mt-0.5 truncate text-xl font-semibold text-slate-100">
            Week {activeWeek}: {topic}
          </h2>
        </div>
        <ProgressRing value={ringDone} max={weekItems.length} size={54} />
      </div>

      <div className="mt-3 max-h-[360px] min-h-0 flex-1 space-y-2 overflow-y-auto scroll-thin pr-1">
        {groups.length === 0 ? (
          <div className="rounded-lg border border-dashed border-edge bg-panel/50 p-4 text-sm text-slate-400">
            No problems mapped to this week. Focus on{" "}
            <span className="font-medium text-slate-200">{topic}</span> — drill
            the pattern and revisit your weak spots.
          </div>
        ) : (
          groups.map((g) => {
            const open = isOpen(g);
            const complete = g.total > 0 && g.done === g.total;
            return (
              <div
                key={g.week}
                className="overflow-hidden rounded-lg border border-edge bg-panel/30"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleWeek(g)}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-panel2/50"
                >
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                      open ? "rotate-90" : ""
                    }`}
                  />
                  <span className="shrink-0 font-mono text-xs font-semibold text-accent-fg">
                    W{g.week}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                    {g.topic}
                  </span>
                  {g.week === weekNum && (
                    <span className="hidden shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-fg sm:inline">
                      current
                    </span>
                  )}
                  {complete && <span className="shrink-0 text-emerald-400">✓</span>}
                  <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500">
                    {g.done}/{g.total}
                  </span>
                </button>
                <Collapse open={open}>
                  <div className="space-y-1.5 border-t border-edge p-2">
                    {g.problems.map(renderRow)}
                  </div>
                </Collapse>
              </div>
            );
          })
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
