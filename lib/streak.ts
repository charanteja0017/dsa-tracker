import { APP_TZ } from "./tz";

// Step a YYYY-MM-DD string by whole days (UTC math, safe for date-only values).
export function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Today's date (YYYY-MM-DD) in the app timezone.
export function todayInTz(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(new Date());
}

// Consecutive days with >= 1 completion ending today — with a 1-day grace so it
// doesn't read 0 just because today isn't logged yet. `days` is the set of
// YYYY-MM-DD strings (in APP_TZ) that have at least one completion.
export function currentStreak(days: Set<string>, today = todayInTz()): number {
  let cursor: string | null = days.has(today)
    ? today
    : days.has(shiftDay(today, -1))
      ? shiftDay(today, -1)
      : null;
  let streak = 0;
  while (cursor && days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}
