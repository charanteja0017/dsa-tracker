"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Recruiter } from "@/lib/types";
import { Tag } from "./Tag";
import { Collapse } from "./Collapse";

// Self-contained card: expandable per-company interview pattern + prep focus.
// Internal scroll so its height aligns with the study-list column.
export function RecruiterList({ recruiters }: { recruiters: Recruiter[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="flex max-h-[760px] flex-col rounded-xl border border-edge bg-panel shadow-card">
      <div className="border-b border-edge px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-200">
          Senior recruiters · AI Dept 2026
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Tap a company for its interview pattern &amp; your prep focus.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto scroll-thin p-3">
        {recruiters.map((r) => {
          const isOpen = open === r.company;
          return (
            <div
              key={r.company}
              className="overflow-hidden rounded-lg border border-edge bg-panel/40"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : r.company)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-panel2/50"
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                  {r.company}
                </span>
                <Tag variant="type" value={r.type} />
                <span className="shrink-0 font-mono text-xs tabular-nums text-slate-500">
                  {r.hires}h
                </span>
              </button>

              <Collapse open={isOpen}>
                <div className="space-y-2 border-t border-edge px-3 py-2.5 text-sm">
                  <p className="text-xs text-slate-500">
                    DSA bar:{" "}
                    <span className="text-slate-300">{r.dsa_bar}</span>
                  </p>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      Pattern
                    </span>
                    <p className="mt-0.5 text-slate-300">{r.pattern}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-accent-fg">
                      Your focus
                    </span>
                    <p className="mt-0.5 text-slate-200">{r.focus}</p>
                  </div>
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
    </section>
  );
}
