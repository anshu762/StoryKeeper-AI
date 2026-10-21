"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MagicDemo() {
  const [activeTab, setActiveTab] = useState<"original" | "translation" | "summary">(
    "original"
  );

  return (
    <section className="py-20 sm:py-28 border-b border-line bg-paper">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Interactive Showcase"
          title="See the AI Archival Magic"
          description="How raw spoken dialects are transcribed, faithfully translated, and organized for global accessibility."
        />

        <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-line bg-white shadow-warm-lg overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-line bg-paper-2/60 px-6 py-4 gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-paper border border-line">
              <button
                onClick={() => setActiveTab("original")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeTab === "original"
                    ? "bg-white text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                )}
              >
                1. Original (Bhojpuri)
              </button>
              <button
                onClick={() => setActiveTab("translation")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeTab === "translation"
                    ? "bg-white text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                )}
              >
                2. English Translation
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeTab === "summary"
                    ? "bg-white text-ink shadow-xs"
                    : "text-muted hover:text-ink"
                )}
              >
                3. Cultural Abstract
              </button>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-saffron-subtle text-[#8C5E0D] border border-saffron/30">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />
                <span>AI-generated · reviewed by humans</span>
              </span>
            </div>
          </div>

          {/* Animated Panel Display */}
          <div className="p-8 sm:p-12 min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "original" && (
                <motion.div
                  key="original"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-2xl text-center sm:text-left"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
                    Original Dialect Transcript (Devanagari Script)
                  </span>
                  <p className="font-devanagari-serif text-2xl sm:text-3xl text-ink leading-relaxed">
                    &ldquo;हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी। जाड़े के दिनों में हम सब भाई-बहन मिट्टी के चूल्हे के चारों तरफ बैठ जाते थे।&rdquo;
                  </p>
                  <p className="text-xs text-muted">
                    Bhojpur, Bihar • Circa 1965 • Speaker: Sunita Devi
                  </p>
                </motion.div>
              )}

              {activeTab === "translation" && (
                <motion.div
                  key="translation"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-2xl text-center sm:text-left"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
                    Faithful English Translation
                  </span>
                  <p className="font-serif text-2xl sm:text-3xl text-ink leading-relaxed italic">
                    &ldquo;In our childhood, when my grandmother baked flatbreads on the clay stove, the fragrance of mahua flowers would spread across the courtyard. On winter mornings, all of us siblings gathered closely around the earthen hearth.&rdquo;
                  </p>
                  <p className="text-xs text-muted">
                    Translated via OpenRouter LLM • Cross-verified by community archivist
                  </p>
                </motion.div>
              )}

              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 max-w-2xl text-center sm:text-left"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
                    Key Themes & Context
                  </span>
                  <p className="font-sans text-lg text-ink leading-relaxed">
                    A warm reflection on winter mornings in rural Bhojpur during the late 1960s, describing the ritual of communal cooking on clay stoves and the heirloom recipe for mahua flower flatbread.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-full bg-paper-2 text-xs font-medium text-ink">
                      #Food
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-paper-2 text-xs font-medium text-ink">
                      #Family
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-paper-2 text-xs font-medium text-ink">
                      #Childhood
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Bar */}
          <div className="border-t border-line bg-paper-2/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-moss" />
              <span>Preserves original dialect without overwriting</span>
            </span>
            <Button asChild variant="ghost" size="sm" className="text-terracotta gap-1">
              <Link href="/stories/mahua-clay-oven-recipe">
                <span>View Full Story Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
