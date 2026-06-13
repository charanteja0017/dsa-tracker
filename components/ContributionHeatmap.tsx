import { HEAT_RAMP, heatLevel } from "@/lib/colors";

type Day = { solved: number; minutes: number };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Cell = { key: string; date: string | null; solved: number; minutes: number };

// Build GitHub-style columns (one per week, 7 rows Sun→Sat) from start→end.
// Days outside [start, end] are rendered as empty placeholders.
function buildWeeks(start: Date, end: Date, map: Map<string, Day>) {
  const weeks: Cell[][] = [];
  const cur = new Date(start);
  cur.setUTCDate(cur.getUTCDate() - cur.getUTCDay()); // back up to Sunday
  let week: Cell[] = [];

  while (cur <= end) {
    const inRange = cur >= start;
    const key = iso(cur);
    const d = map.get(key);
    week.push({
      key,
      date: inRange ? key : null,
      solved: d?.solved ?? 0,
      minutes: d?.minutes ?? 0,
    });
    if (cur.getUTCDay() === 6) {
      weeks.push(week);
      week = [];
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ key: `pad-${week.length}`, date: null, solved: 0, minutes: 0 });
    }
    weeks.push(week);
  }
  return weeks;
}

export function ContributionHeatmap({
  daily,
  start,
  end,
}: {
  daily: { date: string; solved: number; minutes: number }[];
  start: string;
  end: string;
}) {
  const map = new Map<string, Day>(
    daily.map((d) => [d.date, { solved: d.solved, minutes: d.minutes }])
  );
  const weeks = buildWeeks(new Date(start), new Date(end), map);

  // Month label above the first column where a new month begins.
  const monthLabels = weeks.map((week, i) => {
    const firstReal = week.find((c) => c.date);
    if (!firstReal) return "";
    const m = new Date(firstReal.date as string).getUTCMonth();
    const prev = weeks[i - 1]?.find((c) => c.date)?.date;
    const prevM = prev ? new Date(prev).getUTCMonth() : -1;
    return m !== prevM ? MONTHS[m] : "";
  });

  return (
    <div className="overflow-x-auto scroll-thin">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-[3px] pl-0 text-[10px] text-slate-500">
          {monthLabels.map((label, i) => (
            <div key={i} className="w-[13px] shrink-0">
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.key}
                  title={
                    cell.date
                      ? `${cell.date} · ${cell.solved} solved · ${cell.minutes} min`
                      : undefined
                  }
                  className="h-[13px] w-[13px] rounded-[3px]"
                  style={{
                    background: cell.date
                      ? HEAT_RAMP[heatLevel(cell.solved)]
                      : "transparent",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>Less</span>
          {HEAT_RAMP.map((c, i) => (
            <span
              key={i}
              className="h-[11px] w-[11px] rounded-[3px]"
              style={{ background: c }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
