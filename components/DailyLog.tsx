"use client";

import type { DailyDraft } from "@/lib/types";

function Field({
  ph,
  value,
  onChange,
  inputMode,
}: {
  ph: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <input
      placeholder={ph}
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none w-full placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500/60"
    />
  );
}

// "Log today" form. State is owned by the page; this is presentational.
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
    <section className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
      <h2 className="font-semibold mb-3">Log today</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <Field
          ph="Solved"
          value={value.solved}
          inputMode="numeric"
          onChange={(v) => onField("solved", v)}
        />
        <Field
          ph="Minutes"
          value={value.minutes}
          inputMode="numeric"
          onChange={(v) => onField("minutes", v)}
        />
        <Field
          ph="Conf 1-5"
          value={value.confidence}
          inputMode="numeric"
          onChange={(v) => onField("confidence", v)}
        />
        <Field
          ph="Topic"
          value={value.topic}
          onChange={(v) => onField("topic", v)}
        />
      </div>
      <input
        placeholder="Notes / weak spots"
        value={value.notes}
        onChange={(e) => onField("notes", e.target.value)}
        className="w-full bg-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none mb-2 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500/60"
      />
      <button
        onClick={onSave}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
      >
        {saved ? "Saved ✓" : "Save"}
      </button>
    </section>
  );
}
