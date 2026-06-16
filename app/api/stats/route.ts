import { sql, PLAN, APP_TZ } from "@/lib/db";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

// Step a YYYY-MM-DD string by whole days (UTC math, safe for date-only values).
function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// All stats derive from problems.done_at — there is no daily_log anymore.
export async function GET() {
  const [{ solved, total }] = await sql`
    SELECT COUNT(*) FILTER (WHERE done)::int AS solved,
           COUNT(*)::int AS total
    FROM problems;
  `;
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Distinct local-timezone days (as strings) that have >= 1 completion.
  const rows = await sql`
    SELECT DISTINCT to_char((done_at AT TIME ZONE ${APP_TZ})::date, 'YYYY-MM-DD') AS d
    FROM problems
    WHERE done AND done_at IS NOT NULL;
  `;
  const days = new Set(rows.map((r) => r.d as string));

  // Streak: consecutive days with >= 1 completion, ending today — with a 1-day
  // grace so it doesn't read 0 just because today isn't logged yet.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(
    new Date()
  );
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

  const dayMs = 864e5;
  const start = new Date(PLAN.startDate).getTime();
  const weekNum = Math.max(
    1,
    Math.floor((Date.now() - start) / (7 * dayMs)) + 1
  );
  const daysToPhase1 = Math.ceil(
    (new Date(PLAN.phase1Date).getTime() - Date.now()) / dayMs
  );

  return NextResponse.json({ solved, total, percent, streak, weekNum, daysToPhase1 });
}
