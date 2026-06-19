"use client";

import { useEffect, useState } from "react";

// Full-screen loading splash: an on-brand checkmark draws in and pulses with a
// shimmer bar, then the whole thing fades out once the dashboard data is ready.
// Stays up a minimum beat so it never flickers, and has a safety timeout so a
// slow/failed fetch can't trap you behind it.
export function Splash({ done }: { done: boolean }) {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 650);
    return () => clearTimeout(t);
  }, []);

  // Safety: never hold the splash longer than this even if data never arrives.
  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done && minElapsed) setLeaving(true);
  }, [done, minElapsed]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShow(false), 460); // match the fade duration
    return () => clearTimeout(t);
  }, [leaving]);

  if (!show) return null;

  return (
    <div className={`splash ${leaving ? "splash-leaving" : ""}`} aria-hidden>
      <div className="splash-logo">
        <svg width="88" height="88" viewBox="0 0 84 84" fill="none">
          <rect
            x="5"
            y="5"
            width="74"
            height="74"
            rx="21"
            fill="rgba(34,211,238,0.10)"
            stroke="rgba(34,211,238,0.40)"
            strokeWidth="2"
          />
          <path
            className="splash-check"
            d="M26 44 l11 11 l21 -25"
            stroke="#22d3ee"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="splash-word">DSA Placement Tracker</div>
      <div className="splash-bar" />
    </div>
  );
}
