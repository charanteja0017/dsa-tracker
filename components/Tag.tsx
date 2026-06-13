import { DIFF_LABEL } from "@/lib/study";

type Variant = "difficulty" | "pattern" | "type";

// Difficulty: emerald/amber/rose. Type: per recruiter category. Pattern: neutral
// (charts color-code patterns separately; an optional `dot` carries that color).
const DIFF_STYLE: Record<string, string> = {
  EASY: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  HARD: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const TYPE_STYLE: Record<string, string> = {
  "Product/Lab": "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  "AI/ML firm": "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30",
  "Service/Consult": "bg-amber-500/15 text-amber-300 ring-amber-500/30",
};

const PATTERN_STYLE = "bg-slate-500/10 text-slate-300 ring-slate-500/25";

// One reusable tag used everywhere tags appear (focus panel, list, chart
// legends, recruiters) so colors stay consistent across the dashboard.
export function Tag({
  variant,
  value,
  dot,
  title,
  className = "",
}: {
  variant: Variant;
  value: string;
  dot?: string;
  title?: string;
  className?: string;
}) {
  const style =
    variant === "difficulty"
      ? DIFF_STYLE[value] ?? PATTERN_STYLE
      : variant === "type"
        ? TYPE_STYLE[value] ?? PATTERN_STYLE
        : PATTERN_STYLE;

  const label =
    variant === "difficulty"
      ? DIFF_LABEL[value as keyof typeof DIFF_LABEL] ?? value
      : value;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style} ${className}`}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: dot }}
        />
      )}
      {label}
    </span>
  );
}
