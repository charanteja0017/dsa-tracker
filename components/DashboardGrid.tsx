import type { ReactNode } from "react";

// Owns the wide max-width container + the 12-column grid. Children place
// themselves with col-span utilities (col-span-12 on mobile collapsing up).
export function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
      <div className="grid grid-cols-12 gap-4">{children}</div>
    </div>
  );
}
