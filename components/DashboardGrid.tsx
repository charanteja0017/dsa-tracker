import type { ReactNode } from "react";

// Wide container + a true 3-equal-column grid (repeat(3, 1fr), gap 14px).
// Children place themselves with the Span helper below.
export function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

// Column span on desktop (xl). Collapses to 2 cols at md, 1 col on mobile.
const SPAN: Record<1 | 2 | 3, string> = {
  1: "xl:col-span-1",
  2: "md:col-span-2 xl:col-span-2",
  3: "md:col-span-2 xl:col-span-3",
};

export function Span({
  cols,
  children,
  className = "",
}: {
  cols: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${SPAN[cols]} ${className}`}>{children}</div>;
}
