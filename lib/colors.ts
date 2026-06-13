// Concrete hex values for SVG/recharts (which can't consume Tailwind classes).
// Mirrors the semantic palette defined in tailwind.config.ts.
export const COLORS = {
  accent: "#6366f1", // indigo-500
  easy: "#10b981", // emerald-500
  medium: "#f59e0b", // amber-500
  hard: "#f43f5e", // rose-500
  grid: "#1f1f2a", // borders / chart gridlines
  muted: "#64748b", // slate-500
  text: "#94a3b8", // slate-400
};

export const DIFF_HEX: Record<string, string> = {
  EASY: COLORS.easy,
  MEDIUM: COLORS.medium,
  HARD: COLORS.hard,
};

// Heatmap intensity ramp (0 → 4), GitHub-contribution style in emerald.
// Level 0 is a touch lighter than the card so empty days stay visible.
export const HEAT_RAMP = ["#23232e", "#0e3a2e", "#13754f", "#1ea672", "#34d399"];

export function heatLevel(solved: number): number {
  if (solved <= 0) return 0;
  if (solved <= 2) return 1;
  if (solved <= 4) return 2;
  if (solved <= 6) return 3;
  return 4;
}

// Stable palette for pattern bars/legends.
export const PATTERN_PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#ec4899",
  "#a855f7",
  "#22d3ee",
  "#84cc16",
  "#eab308",
];

export function patternColor(index: number): string {
  return PATTERN_PALETTE[index % PATTERN_PALETTE.length];
}
