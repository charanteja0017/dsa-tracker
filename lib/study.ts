import type {
  Difficulty,
  Filters,
  PatternGroup,
  Problem,
  WeekGroup,
} from "./types";

// Curated topic label per week of the 23-week roadmap. Where a week has no
// explicit label here, groupProblems() falls back to that week's dominant
// pattern, so this map is safe to edit/extend without breaking the UI.
export const WEEK_TOPICS: Record<number, string> = {
  1: "Arrays, Hashing & Strings",
  2: "Two Pointers",
  3: "Sliding Window",
  4: "Stack",
  5: "Binary Search & Sorting",
  6: "Linked List",
  7: "Recursion & Trees I",
  8: "Trees (BFS / DFS)",
  9: "Tries & Heaps",
  10: "Heap / Priority Queue",
  11: "Backtracking",
  12: "Graphs I",
  13: "Graphs II (Union-Find, Topo)",
  14: "Dynamic Programming I",
  15: "Dynamic Programming II",
  16: "Greedy & Intervals",
  17: "Bit Manipulation",
  18: "Math & Matrix",
  19: "Design",
  20: "Advanced Strings",
  21: "Mixed Hard Set",
  22: "Mock Interviews",
  23: "Review & Weak Spots",
};

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

function topicForWeek(week: number, patterns: PatternGroup[]): string {
  // patterns are sorted by total desc, so [0] is the dominant pattern.
  return WEEK_TOPICS[week] ?? patterns[0]?.pattern ?? "Mixed";
}

// Groups a flat problem list into WEEK → PATTERN → PROBLEM. Header counts
// (done/total) always reflect the real totals; the `problems` arrays contain
// only rows that pass the active filters. Patterns/weeks with no visible rows
// are omitted so the accordion never shows empty sections.
export function groupProblems(
  problems: Problem[],
  filters: Filters
): WeekGroup[] {
  const matches = (p: Problem): boolean =>
    (filters.difficulties.size === 0 ||
      filters.difficulties.has(p.difficulty as Difficulty)) &&
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

  const result: WeekGroup[] = [];
  for (const week of Array.from(weeks.keys()).sort((a, b) => a - b)) {
    const pats = weeks.get(week)!;
    const patterns: PatternGroup[] = [];
    let total = 0;
    let done = 0;
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
    if (patterns.length === 0) continue; // nothing visible this week
    patterns.sort(
      (a, b) => b.total - a.total || a.pattern.localeCompare(b.pattern)
    );
    result.push({ week, topic: topicForWeek(week, patterns), total, done, patterns });
  }
  return result;
}
