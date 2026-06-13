import { ProgressBar } from "./ProgressBar";

// "By pattern" overview — one labelled bar per pattern.
export function PatternProgress({
  items,
}: {
  items: { pattern: string; total: number; done: number }[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
      {items.map((p) => (
        <div key={p.pattern} className="flex items-center gap-3 text-sm">
          <span className="w-36 sm:w-40 shrink-0 text-slate-300 truncate">
            {p.pattern}
          </span>
          <ProgressBar
            value={p.done}
            max={p.total}
            barClass="bg-emerald-500"
            className="flex-1"
          />
          <span className="text-slate-500 text-xs w-10 text-right tabular-nums">
            {p.done}/{p.total}
          </span>
        </div>
      ))}
    </div>
  );
}
