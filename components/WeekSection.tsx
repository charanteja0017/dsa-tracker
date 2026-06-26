"use client";

import { ChevronRight } from "lucide-react";
import type { WeekGroup } from "@/lib/types";
import { PatternGroup } from "./PatternGroup";
import { ProgressBar } from "./ProgressBar";
import { Collapse } from "./Collapse";

// One week accordion. Header: "W{n} · {topic}" + done/total + mini bar. Body
// groups by pattern, or shows topic guidance for empty / filtered-out weeks.
export function WeekSection({
  group,
  open,
  isCurrent,
  onToggle,
  onToggleProblem,
  onToggleStar,
  canEdit = true,
}: {
  group: WeekGroup;
  open: boolean;
  isCurrent: boolean;
  onToggle: (week: number) => void;
  onToggleProblem: (id: number, done: boolean) => void;
  onToggleStar?: (id: number, starred: boolean) => void;
  canEdit?: boolean;
}) {
  const complete = group.total > 0 && group.done === group.total;

  return (
    <section className="overflow-hidden rounded-lg border border-edge bg-panel/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(group.week)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-panel2/50"
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
        <span className="shrink-0 font-mono text-xs font-semibold text-accent-fg">
          W{group.week}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
          {group.topic}
        </span>
        {isCurrent && (
          <span className="hidden shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-fg sm:inline">
            current
          </span>
        )}
        <div className="hidden w-20 shrink-0 sm:block">
          <ProgressBar
            value={group.done}
            max={Math.max(1, group.total)}
            barClass={complete ? "bg-emerald-500" : "bg-accent"}
          />
        </div>
        <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-slate-500">
          {group.done}/{group.total}
        </span>
      </button>

      <Collapse open={open}>
        <div className="space-y-3 border-t border-edge px-3 py-3">
          {group.total === 0 ? (
            <p className="rounded-md border border-dashed border-edge bg-panel/40 px-3 py-2.5 text-xs text-slate-500">
              No problems mapped — focus on{" "}
              <span className="text-slate-700">{group.topic}</span> pattern
              practice this week.
            </p>
          ) : group.patterns.length === 0 ? (
            <p className="px-1 py-1 text-xs text-slate-400">
              No problems match the current filters.
            </p>
          ) : (
            group.patterns.map((pg) => (
              <PatternGroup
                key={pg.pattern}
                group={pg}
                onToggleProblem={onToggleProblem}
                onToggleStar={onToggleStar}
                canEdit={canEdit}
              />
            ))
          )}
        </div>
      </Collapse>
    </section>
  );
}
