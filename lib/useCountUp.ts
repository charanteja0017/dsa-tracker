"use client";

import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

// Animate a number toward `target` with requestAnimationFrame. Counts up from 0
// on mount, then from the *current* displayed value whenever the target changes
// (so a checkbox toggle ticks from the old number, not from 0). Honors
// prefers-reduced-motion by snapping straight to the value.
export function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState<number>(() =>
    prefersReduced() ? target : 0
  );
  const valueRef = useRef(value);
  valueRef.current = value;
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReduced() || durationMs <= 0) {
      setValue(target);
      return;
    }
    const from = valueRef.current;
    if (from === target) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
