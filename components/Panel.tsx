import type { ReactNode } from "react";

// Consistent card shell: rounded-xl, edge border, panel background, optional
// titled header. `bodyClassName` lets callers set fixed heights for charts or
// scroll regions.
export function Panel({
  title,
  right,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-edge bg-panel shadow-card transition-colors duration-200 hover:border-slate-700/70 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-edge px-4 py-2.5">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {right}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
