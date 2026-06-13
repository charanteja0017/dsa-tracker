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
  done: boolean;
};

export type Stats = {
  mustDoDone: number;
  mustDoTotal: number;
  totalSolved: number;
  totalMinutes: number;
  streak: number;
  weekNum: number;
  daysToPhase1: number;
  target: number;
  byPattern: { pattern: string; total: number; done: number }[];
};

export type Recruiter = {
  company: string;
  hires: number;
  type: string;
  dsa_bar: string;
  pattern: string;
  focus: string;
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
};

// Draft state for the "log today" form.
export type DailyDraft = {
  solved: string;
  minutes: string;
  confidence: string;
  topic: string;
  notes: string;
};

// A persisted daily_log row (as returned by GET /api/log).
export type DailyLogRow = {
  log_date: string;
  solved: number;
  minutes: number;
  confidence: number | null;
  topic: string | null;
  notes: string | null;
};

// Aggregated series for the data-viz row, from GET /api/analytics.
export type Analytics = {
  range: { start: string; phase1: string; target: number };
  daily: { date: string; solved: number; minutes: number }[];
  cumulative: { date: string; total: number }[];
  byPattern: { pattern: string; total: number; done: number }[];
  byDifficulty: { difficulty: Difficulty; total: number; done: number }[];
};
