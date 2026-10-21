import React from "react";
import Link from "next/link";
import { Radio } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-paper">
      {/* Left Column: Atmospheric Heritage Editorial Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-[#271E19] via-[#352520] to-[#1F1A17] text-paper overflow-hidden border-r border-line/20">
        {/* Subtle background SVG motif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="auth-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1.5" fill="#FFF" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white shadow">
              <Radio className="h-5 w-5" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-paper">
              StoryKeeper<span className="text-terracotta">.ai</span>
            </span>
          </Link>
        </div>

        {/* Center: Evocative Quote & Waveform Motif */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="flex items-center gap-1.5 h-12 py-2">
            {[40, 65, 30, 85, 95, 45, 70, 80, 50, 90, 60, 35, 75, 100, 55, 30, 85].map(
              (h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-saffron/80 transition-all duration-300 animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              )
            )}
          </div>

          <blockquote className="space-y-3">
            <p className="font-serif text-2xl sm:text-3xl font-normal leading-snug italic text-[#F7EFE4]">
              &ldquo;When an elder passes away, a whole library burns to the ground.
              Record the voices before the fire takes them.&rdquo;
            </p>
            <footer className="text-sm text-saffron font-medium">
              — Amadou Hampâté Bâ, Historian & Ethnologist
            </footer>
          </blockquote>
        </div>

        {/* Bottom Ethics Notice */}
        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-[#E4DACB]/70 leading-relaxed">
          <p>
            StoryKeeper is an ethical, consent-first community archive. All personal
            memories remain under contributor ownership and are shared solely with
            explicit permission.
          </p>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16 xl:px-24">
        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta text-white">
              <Radio className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-ink">
              StoryKeeper<span className="text-terracotta">.ai</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
