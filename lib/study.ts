import type {
  Difficulty,
  DifficultyStat,
  Filters,
  PatternGroup,
  PatternStat,
  Problem,
  WeekGroup,
} from "./types";
import { WEEK_TOPICS } from "./seedData";
import { DIFFICULTIES } from "./tokens";

// Single source of truth for week labels lives in seedData.ts; re-exported here
// so UI code can import topic + grouping helpers from one module.
export { WEEK_TOPICS };

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

// Distinct patterns across all problems, sorted by frequency desc.
export function allPatterns(problems: Problem[]): string[] {
  const counts = new Map<string, number>();
  for (const p of problems) counts.set(p.pattern, (counts.get(p.pattern) ?? 0) + 1);
  return Array.from(counts.keys()).sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
  );
}

// Per-pattern done/total, derived client-side so charts react instantly on toggle.
export function patternStats(problems: Problem[]): PatternStat[] {
  const m = new Map<string, { total: number; done: number }>();
  for (const p of problems) {
    const e = m.get(p.pattern) ?? { total: 0, done: 0 };
    e.total++;
    if (p.done) e.done++;
    m.set(p.pattern, e);
  }
  return Array.from(m, ([pattern, v]) => ({ pattern, ...v })).sort(
    (a, b) => b.total - a.total || a.pattern.localeCompare(b.pattern)
  );
}

// Per-difficulty done/total in EASY/MEDIUM/HARD order.
export function difficultyStats(problems: Problem[]): DifficultyStat[] {
  const m = new Map<string, { total: number; done: number }>();
  for (const p of problems) {
    const e = m.get(p.difficulty) ?? { total: 0, done: 0 };
    e.total++;
    if (p.done) e.done++;
    m.set(p.difficulty, e);
  }
  return DIFFICULTIES.map((d) => ({
    difficulty: d,
    total: m.get(d)?.total ?? 0,
    done: m.get(d)?.done ?? 0,
  }));
}
