// Animated streak fire: nested flame layers (red → orange → amber → white-hot
// core) that flicker and sway. The fire grows stronger as the streak climbs —
// more layers, bigger size, and a stronger glow. Respects reduced-motion (the
// flicker is disabled in CSS).

const FLAME_PATH =
  "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z";

// Outer → inner. Hotter cores are revealed as the streak grows.
const LAYERS = [
  { color: "#ef4444", scale: 1 }, // red outer
  { color: "#f97316", scale: 0.8 }, // orange
  { color: "#fbbf24", scale: 0.58 }, // amber
  { color: "#fef3c7", scale: 0.34 }, // near-white core
];

export function StreakFlame({ streak }: { streak: number }) {
  if (streak <= 0) {
    // No streak yet → a dim ember.
    return (
      <svg viewBox="0 0 24 24" width={42} height={42} className="shrink-0" aria-hidden>
        <path d={FLAME_PATH} fill="#475569" opacity={0.5} />
      </svg>
    );
  }

  const t = Math.min(1, streak / 21); // intensity ramps over ~3 weeks
  const size = Math.round(42 + t * 22); // 42 → 64px
  const layerCount = streak < 3 ? 2 : streak < 7 ? 3 : 4;
  const speed = 1.6 - t * 0.7; // faster flicker = more energetic
  const glow = 6 + t * 18;
  const glowAlpha = 0.4 + t * 0.4;

  return (
    <span
      className="relative inline-block shrink-0"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 ${glow}px rgba(249,115,22,${glowAlpha}))`,
      }}
      title={`${streak}-day streak`}
      aria-label={`${streak} day streak`}
    >
      {LAYERS.slice(0, layerCount).map((layer, i) => {
        const s = Math.round(size * layer.scale);
        return (
          <span
            key={i}
            className="absolute bottom-0 left-1/2"
            style={{ width: s, height: s, transform: "translateX(-50%)" }}
          >
            <svg
              viewBox="0 0 24 24"
              width={s}
              height={s}
              className="flame-flicker"
              style={{
                animationDuration: `${Math.max(0.5, speed - i * 0.12)}s`,
                animationDelay: `${i * 0.12}s`,
              }}
              aria-hidden
            >
              <path d={FLAME_PATH} fill={layer.color} />
            </svg>
          </span>
        );
      })}
    </span>
  );
}
