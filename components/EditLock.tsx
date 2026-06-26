"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";

// Header lock control for the edit gate. Locked → reveals a password field that
// POSTs /api/auth; Unlocked → click to DELETE /api/auth (re-lock). State is
// lifted to the page via onChange so the checkboxes enable/disable.
export function EditLock({
  authed,
  configured,
  onChange,
}: {
  authed: boolean;
  configured: boolean;
  onChange: (authed: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (res.ok) {
      setPw("");
      setOpen(false);
      onChange(true);
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Unlock failed.");
    }
  }

  async function lock() {
    await fetch("/api/auth", { method: "DELETE" });
    onChange(false);
  }

  if (authed) {
    return (
      <button
        type="button"
        onClick={lock}
        title="Lock editing"
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15"
      >
        <LockOpen className="h-3.5 w-3.5" />
        Unlocked
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Unlock to edit"
        className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-panel px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300"
      >
        <Lock className="h-3.5 w-3.5" />
        Locked
      </button>
      {open && (
        <form
          onSubmit={unlock}
          className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-edge bg-panel p-2 shadow-card"
        >
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={configured ? "Edit password" : "EDIT_PASSWORD not set"}
            className="w-full rounded-md border border-edge bg-ink/60 px-2.5 py-1.5 text-sm outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
          />
          {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </form>
      )}
    </div>
  );
}
