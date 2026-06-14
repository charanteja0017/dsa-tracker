import { ACCENT, rgba } from "@/lib/tokens";

// Progress bar filled to `percent` with diagonal accent stripes (hatched fill).
export function HatchedBar({ percent }: { percent: number }) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-4 w-full overflow-hidden rounded-full border border-edge bg-panel2">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{
          width: `${pct}%`,
          backgroundColor: rgba(ACCENT, 0.95),
          backgroundImage: `repeating-linear-gradient(45deg, ${rgba(
            "#ffffff",
            0.22
          )} 0, ${rgba("#ffffff", 0.22)} 2px, transparent 2px, transparent 8px)`,
        }}
      />
    </div>
  );
}
