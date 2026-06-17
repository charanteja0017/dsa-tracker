"use client";

import { useEffect, useState } from "react";
import type { PatternStat } from "@/lib/types";
import { topicColor } from "@/lib/tokens";

// One horizontal bar per pattern, colored with its topic color. Bars grow from
// the left on mount (scaleX, staggered) and re-flow when a value changes.
// Done/total on the right.
export function PatternBars({ byPattern }: { byPattern: PatternStat[] }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setGrown(true);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    // Multi-column so the list fills the FIRST column top-to-bottom, then the
    // second (column-major), instead of snaking left↔right row by row.
    <div className="columns-1 gap-x-8 md:columns-2">
      {byPattern.map((p, i) => {
        const c = topicColor(p.pattern);
        const ratio = p.total > 0 ? p.done / p.total : 0;
        return (
          <div
            key={p.pattern}
            className="mb-2.5 flex items-center gap-3 break-inside-avoid text-sm"
          >
            <span
              className="w-52 shrink-0 truncate text-slate-300"
              title={p.pattern}
            >
              {p.pattern}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full origin-left rounded-full"
                style={{
                  width: "100%",
                  background: c,
                  transform: `scaleX(${grown ? ratio : 0})`,
                  transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
                  transitionDelay: `${Math.min(i, 12) * 40}ms`,
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono tabular-nums text-slate-500">
              {p.done}/{p.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
