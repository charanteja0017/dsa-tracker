// ─────────────────────────────────────────────────────────────────────────
// Design tokens — the single source of truth for color. Tailwind config mirrors
// the surface palette as utility colors; the concrete hexes here are for SVG /
// recharts (which can't take Tailwind classes) and the topic tag system.
// ─────────────────────────────────────────────────────────────────────────

// One accent used sparingly (hero %, hatched bar, pace ACTUAL line, active chips,
// focus border). Swap this single value to re-theme the accent.
export const ACCENT = "#22d3ee"; // cyan

export const SURFACE = {
  ink: "#0a0a0f",
  panel: "#14141c",
  panel2: "#1a1a24",
  edge: "#1f1f2a",
};

export const TEXT = {
  primary: "#e6e9ef",
  muted: "#94a3b8",
  faint: "#64748b",
  grid: "#1f1f2a",
};

// Semantic difficulty colors.
export const DIFF_HEX: Record<string, string> = {
  EASY: "#10b981", // emerald
  MEDIUM: "#f59e0b", // amber
  HARD: "#f43f5e", // rose
};

export const DIFF_LABEL: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Med",
  HARD: "Hard",
};

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

// Tailwind classes for the difficulty Tag (static, so they survive purging).
export const DIFF_TAG: Record<string, string> = {
  EASY: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
  MEDIUM: "text-amber-300 bg-amber-500/15 border-amber-500/30",
  HARD: "text-rose-300 bg-rose-500/15 border-rose-500/30",
};

// Recruiter category colors.
export const TYPE_TAG: Record<string, string> = {
  "Product/Lab": "text-blue-300 bg-blue-500/15 border-blue-500/30",
  "AI/ML firm": "text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/30",
  "Service/Consult": "text-amber-300 bg-amber-500/15 border-amber-500/30",
};

// One distinct color per pattern (=== topic), keyed to the exact `pattern`
// values in seedData.ts. Reused by <Tag variant="topic">, the By-pattern bars,
// and the pattern filter chips so color meaning is uniform across the app.
export const TOPIC_COLORS: Record<string, string> = {
  "Arrays & Hashing": "#60a5fa",
  "Two Pointers": "#22d3ee",
  "Sliding Window": "#2dd4bf",
  Stack: "#4ade80",
  "Binary Search": "#a3e635",
  "Linked List": "#facc15",
  Trees: "#fb923c",
  "Tries + Heaps": "#f97316",
  Backtracking: "#f472b6",
  Graphs: "#e879f9",
  "Advanced Graphs": "#c084fc",
  "1-D DP": "#a78bfa",
  "2-D DP": "#818cf8",
  "Greedy + Intervals": "#38bdf8",
  "Math & Bit Manipulation": "#5eead4",
  "Timed OA — mixed": "#fbbf24",
  "Company set — Amazon/MS/Google": "#fb7185",
  "Company set — bio-AI & ML": "#f87171",
  "Revision — mixed": "#94a3b8",
  "Final polish": "#eab308",
};

const TOPIC_FALLBACK = "#94a3b8";

export function topicColor(pattern: string): string {
  return TOPIC_COLORS[pattern] ?? TOPIC_FALLBACK;
}

// Heatmap intensity ramp (0 → 4); level 0 is just above the card so empty days
// stay visible.
export const HEAT_RAMP = ["#23232e", "#1e4f63", "#1f7d97", "#22a6c3", "#38d4ec"];

export function heatLevel(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

// "#rrggbb" → "rgba(r,g,b,a)" for tinted backgrounds/borders from a hex token.
export function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
