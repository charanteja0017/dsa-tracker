import { sql, PLAN } from "@/lib/db";
import { NextResponse } from "next/server";

// Hits the database, so it must never be prerendered/executed at build time.
export const dynamic = "force-dynamic";

// Aggregated series for the dashboard's data-viz row. All computed in SQL.
export async function GET() {
  const daily = await sql`
    SELECT to_char(log_date, 'YYYY-MM-DD') AS date, solved, minutes
    FROM daily_log
    ORDER BY log_date;
  `;

  const cumulative = await sql`
    SELECT to_char(log_date, 'YYYY-MM-DD') AS date,
           SUM(solved) OVER (ORDER BY log_date)::int AS total
    FROM daily_log
    ORDER BY log_date;
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

  return NextResponse.json({
    range: {
      start: PLAN.startDate,
      phase1: PLAN.phase1Date,
      target: PLAN.targetProblems,
    },
    daily,
    cumulative,
    byPattern,
    byDifficulty,
  });
}
