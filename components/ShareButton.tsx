"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

// Copies the dashboard link to the clipboard (the public URL unfurls with the
// live progress card).
export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy link to share"
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-panel px-2.5 py-1 text-xs font-medium text-slate-300 transition duration-150 hover:border-slate-600 active:scale-95"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
