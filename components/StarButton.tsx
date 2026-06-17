"use client";

import { Star } from "lucide-react";

// Toggle a problem's "starred for revision" flag. Filled amber when starred,
// quiet outline otherwise. Disabled (and dimmed) when editing is locked.
export function StarButton({
  starred,
  onToggle,
  disabled = false,
}: {
  starred: boolean;
  onToggle: (starred: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!starred)}
      aria-pressed={starred}
      aria-label={starred ? "Unstar" : "Star for revision"}
      title={
        disabled
          ? "Unlock to edit"
          : starred
            ? "Starred for revision"
            : "Star for revision"
      }
      className={`shrink-0 rounded transition duration-150 ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer active:scale-90"
      } ${
        starred
          ? "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.45)]"
          : "text-slate-600 hover:text-amber-300"
      }`}
    >
      <Star
        className="h-4 w-4"
        strokeWidth={2}
        fill={starred ? "currentColor" : "none"}
      />
    </button>
  );
}
