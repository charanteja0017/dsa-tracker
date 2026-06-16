import { sql, PLAN, APP_TZ } from "@/lib/db";
import { currentStreak } from "@/lib/streak";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

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
  const streak = currentStreak(new Set(rows.map((r) => r.d as string)));

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
