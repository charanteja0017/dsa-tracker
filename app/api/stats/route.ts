import { sql, PLAN } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  // Problems done out of the must-do 60
  const [{ done }] = await sql`SELECT COUNT(*)::int AS done FROM problems WHERE done = TRUE;`;
  const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM problems;`;

  // Per-pattern progress
  const byPattern = await sql`
    SELECT pattern,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE done)::int AS done
    FROM problems
    GROUP BY pattern
    ORDER BY total DESC;
  `;

  // Daily log aggregates
  const [agg] = await sql`
    SELECT COALESCE(SUM(solved),0)::int AS total_solved,
           COALESCE(SUM(minutes),0)::int AS total_minutes,
           COUNT(*)::int AS days_logged
    FROM daily_log;
  `;

  // Streak: count consecutive days up to today with solved > 0
  const logDates = await sql`
    SELECT log_date FROM daily_log WHERE solved > 0 ORDER BY log_date DESC;
  `;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < logDates.length; i++) {
    const d = new Date(logDates[i].log_date);
    d.setHours(0, 0, 0, 0);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.getTime() === expected.getTime()) streak++;
    else break;
  }

  // Week number relative to plan start
  const start = new Date(PLAN.startDate);
  const weekNum = Math.max(1, Math.floor((today.getTime() - start.getTime()) / (7 * 864e5)) + 1);
  const daysToPhase1 = Math.ceil((new Date(PLAN.phase1Date).getTime() - today.getTime()) / 864e5);

  return NextResponse.json({
    mustDoDone: done,
    mustDoTotal: total,
    totalSolved: agg.total_solved,
    totalMinutes: agg.total_minutes,
    daysLogged: agg.days_logged,
    streak,
    weekNum,
    daysToPhase1,
    target: PLAN.targetProblems,
    byPattern,
  });
}
