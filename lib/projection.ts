// Projects when all problems will be solved, from a recency-weighted solving
// rate. Recent days count more than older ones (exponential decay), so a recent
// sprint or slump moves the estimate. Rest days inside the active window count
// as zero (they correctly pull the rate down); days before you ever started
// don't count at all.

export type Projection = {
  perDay: number; // weighted solves/day
  finishDate: string | null; // YYYY-MM-DD, or null when there's no momentum
  daysToFinish: number | null;
};

const DAY_MS = 86_400_000;
const dayStr = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const parseDay = (d: string) => Date.parse(`${d}T00:00:00Z`);

export function projectCompletion(
  daily: { date: string; count: number }[],
  today: string,
  solved: number,
  total: number,
  opts: { lambda?: number; windowDays?: number } = {}
): Projection {
  const lambda = opts.lambda ?? 0.9; // per-day decay (~half-life of a week)
  const windowDays = opts.windowDays ?? 28;

  const counts = new Map(daily.map((d) => [d.date, d.count]));
  const todayMs = parseDay(today);

  // Don't count calendar days before the first recorded activity.
  const firstMs = daily.length ? parseDay(daily[0].date) : todayMs;
  const windowStartMs = Math.max(todayMs - (windowDays - 1) * DAY_MS, firstMs);
  const nDays = Math.max(1, Math.floor((todayMs - windowStartMs) / DAY_MS) + 1);

  let weightSum = 0;
  let weightedCount = 0;
  for (let i = 0; i < nDays; i++) {
    const day = dayStr(todayMs - i * DAY_MS);
    const w = Math.pow(lambda, i);
    weightSum += w;
    weightedCount += (counts.get(day) ?? 0) * w;
  }
  const perDay = weightSum > 0 ? weightedCount / weightSum : 0;

  const remaining = Math.max(0, total - solved);
  if (remaining === 0) return { perDay, finishDate: today, daysToFinish: 0 };
  if (perDay <= 0) return { perDay, finishDate: null, daysToFinish: null };

  const days = Math.ceil(remaining / perDay);
  return {
    perDay,
    finishDate: dayStr(todayMs + days * DAY_MS),
    daysToFinish: days,
  };
}
