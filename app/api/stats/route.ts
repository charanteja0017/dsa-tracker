import { unstable_cache } from "next/cache";
import { sql, PLAN, APP_TZ } from "@/lib/db";
import { TAG_PROBLEMS, REVALIDATE_PROBLEMS } from "@/lib/cache";
import { currentStreak } from "@/lib/streak";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

// Cache the DB-derived parts (solved/total + the set of active days). Streak and
// the week/Phase-1 countdown are derived from "today", so they're computed fresh
// each request (cheap, no query). Invalidated by revalidateTag("problems").
const getStatsData = unstable_cache(
  async () => {
    const [{ solved, total }] = await sql`
      SELECT COUNT(*) FILTER (WHERE done)::int AS solved,
             COUNT(*)::int AS total
      FROM problems;
    `;
    const rows = await sql`
      SELECT DISTINCT to_char((done_at AT TIME ZONE ${APP_TZ})::date, 'YYYY-MM-DD') AS d
      FROM problems
      WHERE done AND done_at IS NOT NULL;
    `;
    return { solved, total, days: rows.map((r) => r.d as string) };
  },
  ["stats-data"],
  { tags: [TAG_PROBLEMS], revalidate: REVALIDATE_PROBLEMS }
);

export async function GET() {
  const { solved, total, days } = await getStatsData();
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
  const streak = currentStreak(new Set(days));

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
