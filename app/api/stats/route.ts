import { sql, PLAN } from "@/lib/db";
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

  // Distinct UTC calendar days that have at least one completion, newest first.
  const rows = await sql`
    SELECT DISTINCT (done_at AT TIME ZONE 'UTC')::date AS d
    FROM problems
    WHERE done AND done_at IS NOT NULL
    ORDER BY d DESC;
  `;

  // Streak: consecutive days ending today (UTC) with >= 1 completion.
  const dayMs = 864e5;
  const todayUtc = Math.floor(Date.now() / dayMs) * dayMs;
  let streak = 0;
  for (let i = 0; i < rows.length; i++) {
    const d = new Date(rows[i].d).getTime();
    if (d === todayUtc - i * dayMs) streak++;
    else break;
  }

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
