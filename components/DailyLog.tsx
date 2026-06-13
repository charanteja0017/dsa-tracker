"use client";

import type { DailyDraft } from "@/lib/types";

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-edge bg-ink/60 px-2.5 py-1.5 text-sm outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
      />
    </label>
  );
}

// Compact "log today" card. State owned by the page; saving refreshes stats +
// analytics so the heatmap cell updates immediately.
export function DailyLog({
  value,
  onField,
  onSave,
  saved,
}: {
  value: DailyDraft;
  onField: (key: keyof DailyDraft, v: string) => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-2">
        <Field
          label="Solved"
          value={value.solved}
          inputMode="numeric"
          onChange={(v) => onField("solved", v)}
        />
        <Field
          label="Minutes"
          value={value.minutes}
          inputMode="numeric"
          onChange={(v) => onField("minutes", v)}
        />
        <Field
          label="Conf 1-5"
          value={value.confidence}
          inputMode="numeric"
          onChange={(v) => onField("confidence", v)}
        />
      </div>
      <Field
        label="Topic"
        value={value.topic}
        onChange={(v) => onField("topic", v)}
      />
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Notes / weak spots
        </span>
        <textarea
          value={value.notes}
          onChange={(e) => onField("notes", e.target.value)}
          className="min-h-[44px] flex-1 resize-none rounded-md border border-edge bg-ink/60 px-2.5 py-1.5 text-sm outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
        />
      </label>
      <button
        onClick={onSave}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        {saved ? "Saved ✓" : "Save today"}
      </button>
    </div>
  );
}
