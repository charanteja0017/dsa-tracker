import { HEAT_RAMP, heatLevel } from "@/lib/tokens";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Cell = { key: string; date: string | null; count: number };

// GitHub-style columns (one per week, 7 day-rows Sun→Sat) from start→end.
function buildWeeks(start: Date, end: Date, map: Map<string, number>): Cell[][] {
  const weeks: Cell[][] = [];
  const cur = new Date(start);
  cur.setUTCDate(cur.getUTCDate() - cur.getUTCDay()); // back up to Sunday
  let week: Cell[] = [];

  while (cur <= end) {
    const inRange = cur >= start;
    const key = iso(cur);
    week.push({ key, date: inRange ? key : null, count: map.get(key) ?? 0 });
    if (cur.getUTCDay() === 6) {
      weeks.push(week);
      week = [];
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  if (week.length > 0) {
    while (week.length < 7)
      week.push({ key: `pad-${week.length}`, date: null, count: 0 });
    weeks.push(week);
  }
  return weeks;
}

// Heatmap of completions per day. Cells flex to fill the panel width (square,
// capped) so the strip uses the full span.
export function ContributionHeatmap({
  daily,
  start,
  end,
}: {
  daily: { date: string; count: number }[];
  start: string;
  end: string;
}) {
  const map = new Map(daily.map((d) => [d.date, d.count]));
  const weeks = buildWeeks(new Date(start), new Date(end), map);

  const monthLabels = weeks.map((week, i) => {
    const first = week.find((c) => c.date);
    if (!first) return "";
    const m = new Date(first.date as string).getUTCMonth();
    const prev = weeks[i - 1]?.find((c) => c.date)?.date;
    const prevM = prev ? new Date(prev).getUTCMonth() : -1;
    return m !== prevM ? MONTHS[m] : "";
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex w-full gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={
                  cell.date
                    ? `${cell.date} · ${cell.count} solved`
                    : undefined
                }
                className="aspect-square w-full rounded-[2px]"
                style={{
                  maxWidth: 16,
                  background: cell.date
                    ? HEAT_RAMP[heatLevel(cell.count)]
                    : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex w-full gap-[3px] text-[10px] text-slate-500">
        {monthLabels.map((label, i) => (
          <div key={i} className="flex-1 overflow-visible whitespace-nowrap">
            {label}
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
        <span>Less</span>
        {HEAT_RAMP.map((c, i) => (
          <span
            key={i}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ background: c }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
