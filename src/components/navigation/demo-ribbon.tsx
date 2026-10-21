"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, ShieldAlert } from "lucide-react";

export function DemoRibbon() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("storykeeper_demo_ribbon_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("storykeeper_demo_ribbon_dismissed", "true");
    } catch {
      // sessionStorage unavailable
    }
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Demonstration Notice"
      className="bg-moss text-white px-4 py-2 text-xs font-medium border-b border-moss/80 transition-all relative z-50"
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="h-3.5 w-3.5 text-saffron shrink-0" />
          <p className="truncate sm:overflow-visible">
            <strong className="font-semibold text-saffron">Portfolio Demonstration:</strong>{" "}
            Stories tagged with <span className="underline decoration-saffron/60">Sample Story</span> are curated oral records. AI transcription, translations, audio recording, and admin workflows are live.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-moss/80 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-saffron"
          aria-label="Dismiss demo notice"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
