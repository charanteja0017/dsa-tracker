import type { PatternStat } from "@/lib/types";
import { topicColor } from "@/lib/tokens";

// One horizontal bar per pattern, colored with its topic color, sorted by
// frequency. Done/total on the right.
export function PatternBars({ byPattern }: { byPattern: PatternStat[] }) {
  return (
    <div className="space-y-2">
      {byPattern.map((p) => {
        const c = topicColor(p.pattern);
        const pct = p.total > 0 ? (p.done / p.total) * 100 : 0;
        return (
          <div key={p.pattern} className="flex items-center gap-2 text-xs">
            <span
              className="w-28 shrink-0 truncate text-slate-300 xl:w-32"
              title={p.pattern}
            >
              {p.pattern}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: c }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono tabular-nums text-slate-500">
              {p.done}/{p.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
