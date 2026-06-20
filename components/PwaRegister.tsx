"use client";

import { useEffect } from "react";

// Registers the service worker so the app is installable + works offline-ish.
// No-op where service workers aren't supported.
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
