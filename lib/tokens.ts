// ─────────────────────────────────────────────────────────────────────────
// Design tokens — the single source of truth for color. Tailwind config mirrors
// the surface palette as utility colors; the concrete hexes here are for SVG /
// recharts (which can't take Tailwind classes) and the topic tag system.
// ─────────────────────────────────────────────────────────────────────────

// One accent used sparingly (hero %, hatched bar, pace ACTUAL line, active chips,
// focus border). Swap this single value to re-theme the accent.
export const ACCENT = "#FF8000"; // McLaren orange

export const SURFACE = {
  ink: "#E8EAF0",
  panel: "#DCDEE8",
  panel2: "#D0D3DE",
  edge: "#BCC0CE",
};

export const TEXT = {
  primary: "#1E2030",
  muted: "#5A6280",
  faint: "#8A92A8",
  grid: "#C8CCDA",
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
  EASY: "text-emerald-700 bg-emerald-500/15 border-emerald-500/30",
  MEDIUM: "text-amber-700 bg-amber-500/15 border-amber-500/30",
  HARD: "text-rose-700 bg-rose-500/15 border-rose-500/30",
};

// Recruiter category colors.
export const TYPE_TAG: Record<string, string> = {
  "Product/Lab": "text-blue-700 bg-blue-500/15 border-blue-500/30",
  "AI/ML firm": "text-fuchsia-700 bg-fuchsia-500/15 border-fuchsia-500/30",
  "Service/Consult": "text-amber-700 bg-amber-500/15 border-amber-500/30",
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

// Exam-mode topics (Striver A2Z) — their own color set, distinct from the
// study-plan patterns above. Reused by exam Tags so colors stay consistent.
export const EXAM_TOPIC_COLORS: Record<string, string> = {
  "Basics & Maths": "#60a5fa",
  Sorting: "#34d399",
  Arrays: "#22d3ee",
  "Binary Search": "#a3e635",
  Strings: "#facc15",
  "Linked List": "#fb923c",
  "Recursion & Backtracking": "#f472b6",
  "Bit Manipulation": "#5eead4",
  "Stacks & Queues": "#4ade80",
  "Sliding Window & Two Pointer": "#2dd4bf",
  "Heaps & Priority Queue": "#f97316",
  Greedy: "#38bdf8",
  "Binary Trees": "#c084fc",
  "Binary Search Trees": "#a78bfa",
  Graphs: "#e879f9",
  "Dynamic Programming": "#818cf8",
  "Tries & Strings (Advanced)": "#fbbf24",
};

const TOPIC_FALLBACK = "#94a3b8";

export function topicColor(pattern: string): string {
  return TOPIC_COLORS[pattern] ?? EXAM_TOPIC_COLORS[pattern] ?? TOPIC_FALLBACK;
}

// Heatmap intensity ramp (0 → 4); level 0 is slightly darker than the panel so
// empty days stay visible on the light background.
export const HEAT_RAMP = ["#D8DAEC", "#FFCC99", "#FFA040", "#FF8000", "#CC5000"];

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
