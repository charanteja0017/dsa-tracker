import type {
  Difficulty,
  Filters,
  PatternGroup,
  Problem,
  WeekGroup,
} from "./types";
import { WEEK_TOPICS } from "./seedData";

// Single source of truth for week labels lives in seedData.ts; re-exported here
// so UI code can import topic + grouping helpers from one module.
export { WEEK_TOPICS };

export const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export const DIFF_LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Med",
  HARD: "Hard",
};

// Text color for a difficulty badge on a problem row.
export const DIFF_TEXT: Record<string, string> = {
  EASY: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HARD: "text-rose-400",
};

// Chip styling for the active state of a difficulty filter.
export const DIFF_CHIP: Record<Difficulty, string> = {
  EASY: "bg-emerald-500/20 text-emerald-200 border-emerald-500/50",
  MEDIUM: "bg-amber-500/20 text-amber-200 border-amber-500/50",
  HARD: "bg-rose-500/20 text-rose-200 border-rose-500/50",
};

// Groups a flat problem list into WEEK → PATTERN → PROBLEM for ALL 23 roadmap
// weeks (plus any extra weeks present in the data). Header counts (done/total)
// always reflect the real seeded totals; each pattern's `problems` array holds
// only the rows that pass the active filters. Weeks with no seeded problems
// still appear (total === 0) so the list can show topic guidance for them.
export function groupProblems(
  problems: Problem[],
  filters: Filters
): WeekGroup[] {
  const matches = (p: Problem): boolean =>
    (filters.difficulties.size === 0 ||
      filters.difficulties.has(p.difficulty as Difficulty)) &&
    (filters.patterns.size === 0 || filters.patterns.has(p.pattern)) &&
    (!filters.hideCompleted || !p.done);

  type Agg = { total: number; done: number; problems: Problem[] };
  const weeks = new Map<number, Map<string, Agg>>();

  for (const p of problems) {
    let pats = weeks.get(p.week);
    if (!pats) {
      pats = new Map();
      weeks.set(p.week, pats);
    }
    let agg = pats.get(p.pattern);
    if (!agg) {
      agg = { total: 0, done: 0, problems: [] };
      pats.set(p.pattern, agg);
    }
    agg.total++;
    if (p.done) agg.done++;
    if (matches(p)) agg.problems.push(p);
  }

  // Full week set: every roadmap week plus any unexpected week in the data.
  const allWeeks = new Set<number>([
    ...Object.keys(WEEK_TOPICS).map(Number),
    ...weeks.keys(),
  ]);

  const result: WeekGroup[] = [];
  for (const week of Array.from(allWeeks).sort((a, b) => a - b)) {
    const pats = weeks.get(week);
    const patterns: PatternGroup[] = [];
    let total = 0;
    let done = 0;
    if (pats) {
      for (const [pattern, agg] of pats) {
        total += agg.total;
        done += agg.done;
        if (agg.problems.length > 0) {
          patterns.push({
            pattern,
            total: agg.total,
            done: agg.done,
            problems: agg.problems,
          });
        }
      }
    }
    patterns.sort(
      (a, b) => b.total - a.total || a.pattern.localeCompare(b.pattern)
    );
    result.push({
      week,
      topic: WEEK_TOPICS[week] ?? patterns[0]?.pattern ?? "Pattern practice",
      total,
      done,
      patterns,
    });
  }
  return result;
}

// Returns the sorted set of distinct patterns across all problems.
export function allPatterns(problems: Problem[]): string[] {
  return Array.from(new Set(problems.map((p) => p.pattern))).sort((a, b) =>
    a.localeCompare(b)
  );
}
