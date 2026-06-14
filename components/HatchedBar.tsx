import { ACCENT } from "@/lib/tokens";

// Progress bar filled to `percent` with diagonal stripes (hatched accent fill)
// over a dark, outlined track.
export function HatchedBar({ percent }: { percent: number }) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-5 w-full overflow-hidden rounded-full border border-edge bg-panel2">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{
          width: `${pct}%`,
          backgroundColor: ACCENT,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(3,14,24,0.32) 0 7px, transparent 7px 14px)",
        }}
      />
    </div>
  );
}
