// Little reward when a problem gets checked off: a themed confetti burst + a
// short synthesized success chime. Browser-only and best-effort (never throws).
// Confetti is lazy-imported so it stays out of the initial bundle and off the
// server. Respects prefers-reduced-motion for the visual.

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = audioCtx ?? new Ctor();
  return audioCtx;
}

// A quick three-note arpeggio (C5–E5–G5) with a soft decay.
function chime() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.075;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

export function celebrate() {
  if (typeof window === "undefined") return;
  chime();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  import("canvas-confetti")
    .then(({ default: confetti }) => {
      const colors = ["#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a5f3fc"];
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 45,
        scalar: 0.9,
        origin: { y: 0.75 },
        colors,
      });
    })
    .catch(() => {});
}
