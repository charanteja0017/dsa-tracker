import { COLORS } from "@/lib/colors";

// Circular progress with a centered percentage. Used by the Week Focus panel.
export function ProgressRing({
  value,
  max,
  size = 60,
  stroke = 6,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      role="img"
      aria-label={`${Math.round(pct * 100)}% complete`}
    >
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={COLORS.grid}
        strokeWidth={stroke}
      />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-[stroke-dashoffset] duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-slate-100"
        fontSize={size * 0.26}
        fontWeight={600}
        fontFamily="var(--font-mono)"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}
