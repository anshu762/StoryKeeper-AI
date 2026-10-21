import React from "react";
import Link from "next/link";
import { Radio, Heart, Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-paper-2/60 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Mission & Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta text-white">
                <Radio className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-ink">
                StoryKeeper<span className="text-terracotta">.ai</span>
              </span>
            </div>

            <p className="text-sm text-muted leading-relaxed max-w-md font-sans">
              A public digital archive for oral histories, folk traditions, recipes,
              community memories, and cultural knowledge. Helping communities record
              real human voices before they disappear, preserving authentic heritage
              through ethical AI.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted">
              <Shield className="h-3.5 w-3.5 text-moss" />
              <span>Ethical consent-first preservation</span>
            </div>
          </div>

          {/* Archive Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
              Archive
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/archive" className="hover:text-terracotta transition-colors">
                  Explore Archive
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-terracotta transition-colors">
                  Search & Ask Archive
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-terracotta transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="hover:text-terracotta transition-colors">
                  Decade Timeline
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
              Principles & Guides
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/ethics" className="hover:text-terracotta transition-colors">
                  Consent & Ethics Charter
                </Link>
              </li>
              <li>
                <Link href="/contributor-guide" className="hover:text-terracotta transition-colors">
                  Contributor Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-terracotta transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-terracotta transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-terracotta transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Disclaimer (AGENTS.md Section 5 Rule 6) */}
        <div className="rounded-2xl border border-line bg-paper p-4 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
          <div className="p-2 rounded-xl bg-saffron-subtle text-saffron shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-ink font-medium">Historical Disclaimer:</strong> Stories represent personal memories and community histories, not verified historical facts. AI transcribes, translates, and organizes stories; all narratives are reviewed by humans.
          </p>
        </div>

        {/* Bottom copyright and attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-line/60 text-xs text-muted">
          <p>© {new Date().getFullYear()} StoryKeeper AI. Built for cultural memory.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-terracotta fill-terracotta" />
            <span>for communities everywhere</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
