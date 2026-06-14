import { DIFF_LABEL, DIFF_TAG, TYPE_TAG, topicColor, rgba } from "@/lib/tokens";

type Variant = "difficulty" | "topic" | "type";

const base =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-xs font-medium";

// One reusable tag. `topic` is colored from the TOPIC_COLORS map (inline style,
// since hexes are dynamic); `difficulty`/`type` use static Tailwind classes.
export function Tag({
  variant,
  value,
  className = "",
}: {
  variant: Variant;
  value: string;
  className?: string;
}) {
  if (variant === "topic") {
    const c = topicColor(value);
    return (
      <span
        className={`${base} ${className}`}
        style={{
          color: c,
          backgroundColor: rgba(c, 0.12),
          borderColor: rgba(c, 0.3),
        }}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: c }}
        />
        {value}
      </span>
    );
  }

  const cls =
    variant === "difficulty"
      ? DIFF_TAG[value] ?? "text-slate-300 bg-slate-500/10 border-slate-500/25"
      : TYPE_TAG[value] ?? "text-slate-300 bg-slate-500/10 border-slate-500/25";
  const label = variant === "difficulty" ? DIFF_LABEL[value] ?? value : value;

  return <span className={`${base} ${cls} ${className}`}>{label}</span>;
}
