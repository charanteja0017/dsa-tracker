import { Check } from "lucide-react";

// Themed checkbox: a quiet dark box on the dark UI when unchecked, emerald with
// a white tick when checked. Replaces the bright native checkbox.
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        title={disabled ? "Unlock to edit" : undefined}
        className="peer h-4 w-4 appearance-none rounded-[5px] border border-slate-300 bg-panel2 transition-colors checked:border-emerald-500 checked:bg-emerald-500 checked:[animation:cbx-fill_.18s_ease-out] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:checked:animate-none"
      />
      <Check
        strokeWidth={3.5}
        className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-white opacity-0 peer-checked:opacity-100 peer-checked:[animation:check-pop_.2s_ease-out] motion-reduce:peer-checked:animate-none"
      />
    </span>
  );
}
