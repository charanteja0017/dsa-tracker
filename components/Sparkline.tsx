import { COLORS } from "@/lib/colors";

// Tiny dependency-free trend line for stat cards. Stretches to its container.
export function Sparkline({
  data,
  color = COLORS.accent,
  className = "",
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  if (data.length < 2) return <div className={className} aria-hidden />;

  const w = 100;
  const h = 28;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const pts = data.map(
    (v, i) => [i * step, h - ((v - min) / range) * h] as const
  );
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d={area} fill={color} opacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
