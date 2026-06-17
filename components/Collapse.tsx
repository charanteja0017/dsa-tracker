"use client";

import type { ReactNode } from "react";

// Animated expand/collapse using the grid-rows 0fr→1fr trick (smooth height
// transition without measuring). Content stays mounted; it's clipped while
// closed. An item rendered open on first paint shows open with no animation.
// Collapses instantly under prefers-reduced-motion.
export function Collapse({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className={`min-h-0 overflow-hidden ${className}`}>{children}</div>
    </div>
  );
}
