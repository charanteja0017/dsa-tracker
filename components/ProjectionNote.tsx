import type { Projection } from "@/lib/projection";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmt(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return `${MONTHS[m - 1]} ${day}, ${y}`;
}
function daysBetween(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  );
}

// One-line completion forecast shown under the Pace chart: the projected finish
// date (from recency-weighted velocity) and how that lands vs the Phase 1 goal.
export function ProjectionNote({
  projection,
  phase1,
}: {
  projection: Projection;
  phase1: string;
}) {
  if (projection.daysToFinish === 0) {
    return (
      <div className="mt-2 border-t border-edge pt-2 text-xs font-medium text-emerald-300">
        All solved — every problem done. 🎉
      </div>
    );
  }

  if (!projection.finishDate) {
    return (
      <div className="mt-2 border-t border-edge pt-2 text-xs text-slate-500">
        Projected finish — solve a few problems to estimate the pace.
      </div>
    );
  }

  const slack = daysBetween(projection.finishDate, phase1); // +early / −late
  const early = slack >= 0;

  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-edge pt-2 text-xs">
      <span className="text-slate-400">
        Projected finish{" "}
        <span className="font-semibold text-slate-100">
          {fmt(projection.finishDate)}
        </span>
      </span>
      <span
        className={`rounded-md px-1.5 py-0.5 font-medium ${
          early
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-amber-500/15 text-amber-300"
        }`}
      >
        {early ? `${slack}d before` : `${Math.abs(slack)}d after`} Phase 1 ·{" "}
        {projection.perDay.toFixed(1)}/day
      </span>
    </div>
  );
}
