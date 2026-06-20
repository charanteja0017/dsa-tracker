import { unstable_cache } from "next/cache";
import { sql, PLAN, APP_TZ } from "@/lib/db";
import { TAG_PROBLEMS, REVALIDATE_PROBLEMS } from "@/lib/cache";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

// Aggregated series for the dashboard, all derived from problems.done_at. Cached
// (these only change when a problem is toggled, which invalidates "problems").
const getAnalytics = unstable_cache(
  async () => {
  const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM problems;`;

  // Per-day completion counts (local-timezone calendar day).
  const daily = await sql`
    SELECT to_char((done_at AT TIME ZONE ${APP_TZ})::date, 'YYYY-MM-DD') AS date,
           COUNT(*)::int AS count
    FROM problems
    WHERE done AND done_at IS NOT NULL
    GROUP BY 1
    ORDER BY 1;
  `;

  // Cumulative solved over time (running total of the per-day counts).
  const cumulative = await sql`
    SELECT to_char(date, 'YYYY-MM-DD') AS date,
           SUM(count) OVER (ORDER BY date)::int AS total
    FROM (
      SELECT (done_at AT TIME ZONE ${APP_TZ})::date AS date, COUNT(*)::int AS count
      FROM problems
      WHERE done AND done_at IS NOT NULL
      GROUP BY 1
    ) d
    ORDER BY date;
  `;

  const byPattern = await sql`
    SELECT pattern,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE done)::int AS done
    FROM problems
    GROUP BY pattern
    ORDER BY total DESC, pattern;
  `;

  const byDifficulty = await sql`
    SELECT difficulty,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE done)::int AS done
    FROM problems
    GROUP BY difficulty;
  `;

  return {
    range: { start: PLAN.startDate, phase1: PLAN.phase1Date, total },
    daily,
    cumulative: cumulative.map((c) => ({
      date: String(c.date).slice(0, 10),
      total: c.total,
    })),
    byPattern,
    byDifficulty,
  };
  },
  ["analytics"],
  { tags: [TAG_PROBLEMS], revalidate: REVALIDATE_PROBLEMS }
);

export async function GET() {
  return NextResponse.json(await getAnalytics());
}
