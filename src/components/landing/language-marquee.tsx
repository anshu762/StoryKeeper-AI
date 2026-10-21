"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

export function LanguageMarquee() {
  const shouldReduceMotion = useReducedMotion();

  const languages = [
    { script: "हिन्दी", name: "Hindi" },
    { script: "বাংলা", name: "Bengali" },
    { script: "ਪੰਜਾਬੀ", name: "Punjabi" },
    { script: "தமிழ்", name: "Tamil" },
    { script: "मैथिली", name: "Maithili" },
    { script: "भोजपुरी", name: "Bhojpuri" },
    { script: "ગુજરાતી", name: "Gujarati" },
    { script: "English", name: "English" },
    { script: "తెలుగు", name: "Telugu" },
    { script: "मराठी", name: "Marathi" },
    { script: "اردو", name: "Urdu" },
    { script: "മലയാളം", name: "Malayalam" },
    { script: "ଓଡ଼ିଆ", name: "Odia" },
  ];

  // Duplicate for seamless infinite loop
  const list = [...languages, ...languages];

  return (
    <div className="relative w-full overflow-hidden border-b border-line bg-paper-2/50 py-4 select-none">
      {/* Left/Right Vignette Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

      <div
        className={`flex w-max items-center gap-8 ${
          shouldReduceMotion ? "overflow-x-auto" : "animate-marquee"
        }`}
      >
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 shrink-0">
            <span className="font-serif text-lg font-medium text-ink/90">
              {item.script}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted font-sans font-semibold">
              {item.name}
            </span>
            <span className="text-terracotta/40 font-bold">•</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
