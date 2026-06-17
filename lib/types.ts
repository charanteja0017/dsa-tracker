// Shared types for the dashboard. Mirrors the API responses (which mirror the
// DB columns) plus the derived shapes used by the study-plan UI.

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type Problem = {
  id: number;
  title: string;
  companies: number;
  difficulty: string;
  pattern: string;
  week: number;
  link: string;
  youtube: string | null;
  done: boolean;
  starred: boolean;
};

// All stats derive from problems.done_at (no daily_log).
export type Stats = {
  solved: number;
  total: number; // dynamic — COUNT(problems)
  percent: number;
  streak: number;
  weekNum: number;
  daysToPhase1: number;
};

export type Recruiter = {
  company: string;
  hires: number;
  type: string;
  dsa_bar: string;
  pattern: string;
  focus: string;
};

export type PatternStat = { pattern: string; total: number; done: number };
export type DifficultyStat = { difficulty: Difficulty; total: number; done: number };

// Aggregated series from GET /api/analytics.
export type Analytics = {
  range: { start: string; phase1: string; total: number };
  daily: { date: string; count: number }[];
  cumulative: { date: string; total: number }[];
  byPattern: PatternStat[];
  byDifficulty: DifficultyStat[];
};

// Derived shapes for the WEEK → PATTERN → PROBLEM hierarchy.
export type PatternGroup = {
  pattern: string;
  total: number; // true count for the pattern (ignores filters)
  done: number;
  problems: Problem[]; // only the rows currently visible after filtering
};

export type WeekGroup = {
  week: number;
  topic: string;
  total: number; // true count for the week (ignores filters)
  done: number;
  patterns: PatternGroup[];
};

export type Filters = {
  difficulties: Set<Difficulty>; // empty = all difficulties
  patterns: Set<string>; // empty = all patterns
  hideCompleted: boolean;
  starred: boolean; // true = only problems starred for revision
};
