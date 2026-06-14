import type { PatternStat } from "@/lib/types";
import { topicColor } from "@/lib/tokens";

// One horizontal bar per pattern, colored with its topic color, sorted by
// frequency. Done/total on the right.
export function PatternBars({ byPattern }: { byPattern: PatternStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
      {byPattern.map((p) => {
        const c = topicColor(p.pattern);
        const pct = p.total > 0 ? (p.done / p.total) * 100 : 0;
        return (
          <div key={p.pattern} className="flex items-center gap-3 text-sm">
            <span
              className="w-52 shrink-0 truncate text-slate-300"
              title={p.pattern}
            >
              {p.pattern}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, background: c }}
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
