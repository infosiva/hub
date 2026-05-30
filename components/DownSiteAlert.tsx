"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "hub_down_alert_dismissed";

export default function DownSiteAlert({ downNames }: { downNames: string[] }) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    if (!wasDismissed) setDismissed(false);
  }, []);

  if (dismissed || downNames.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <p className="text-red-300 text-sm font-medium">
        <span className="mr-1.5">⚠</span>
        {downNames.length} site{downNames.length > 1 ? "s" : ""} down:{" "}
        <span className="font-semibold">{downNames.join(", ")}</span>
      </p>
      <button
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="text-red-400 hover:text-red-200 text-lg leading-none shrink-0 transition-colors"
        aria-label="Dismiss alert"
      >
        ×
      </button>
    </div>
  );
}
