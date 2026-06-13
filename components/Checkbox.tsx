import { Check } from "lucide-react";

// Themed checkbox: a quiet dark box on the dark UI when unchecked, emerald with
// a white tick when checked. Replaces the bright native checkbox.
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-slate-600 bg-panel2 transition-colors checked:border-emerald-500 checked:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      />
      <Check
        strokeWidth={3.5}
        className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
