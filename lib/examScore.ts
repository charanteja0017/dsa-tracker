// Scoring for exams: harder problems are worth more. An exam's score is the
// points for the problems you solved; max is the points for all of them.

export const DIFFICULTY_POINTS: Record<string, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export function pointsFor(difficulty: string): number {
  return DIFFICULTY_POINTS[difficulty] ?? 1;
}

// SQL CASE expression (same weights) for aggregating scores in queries.
export const POINTS_SQL =
  "CASE difficulty WHEN 'EASY' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'HARD' THEN 3 ELSE 1 END";

export type Grade = { label: string; emoji: string; color: string };

// A playful grade from the score percentage.
export function grade(pct: number): Grade {
  if (pct >= 90) return { label: "Ace", emoji: "🏆", color: "text-amber-700" };
  if (pct >= 70) return { label: "Strong", emoji: "🔥", color: "text-emerald-700" };
  if (pct >= 50) return { label: "Solid", emoji: "💪", color: "text-cyan-700" };
  if (pct >= 25)
    return { label: "Warming up", emoji: "🌱", color: "text-sky-700" };
  if (pct > 0) return { label: "Keep going", emoji: "🚀", color: "text-slate-700" };
  return { label: "Not graded", emoji: "📝", color: "text-slate-500" };
}
