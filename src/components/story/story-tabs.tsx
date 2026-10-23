"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, Globe, Sparkles } from "lucide-react";
import { AiBadge } from "@/components/common/ai-badge";
import { cn } from "@/lib/utils";

interface StoryTabsProps {
  originalTranscript: string;
  englishTranslation: string;
  summary: string;
  originalLanguage: string;
  transcriptAi?: boolean;
  translationAi?: boolean;
  summaryAi?: boolean;
  aiReviewedAt?: Date | null;
}

export function StoryTabs({
  originalTranscript,
  englishTranslation,
  summary,
  originalLanguage,
  transcriptAi = false,
  translationAi = false,
  summaryAi = false,
  aiReviewedAt,
}: StoryTabsProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "translation" | "summary">(
    "transcript"
  );

  const isReviewed = Boolean(aiReviewedAt);

  // Derive BCP-47 language tag
  const getLangCode = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("hindi")) return "hi";
    if (l.includes("bhojpuri")) return "bho";
    if (l.includes("maithili")) return "mai";
    if (l.includes("bengali")) return "bn";
    if (l.includes("punjabi")) return "pa";
    if (l.includes("tamil")) return "ta";
    if (l.includes("gujarati")) return "gu";
    return "en";
  };

  const langCode = getLangCode(originalLanguage);
  const isDevanagari = ["hi", "bho", "mai"].includes(langCode);

  return (
    <div className="rounded-3xl border border-line bg-white/90 shadow-warm overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-line px-3 sm:px-6 pt-3 bg-paper-2/50 overflow-x-auto scrollbar-none">
        <div className="flex space-x-1 sm:space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab("transcript")}
            className={cn(
              "relative px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0",
              activeTab === "transcript"
                ? "border-terracotta text-terracotta font-semibold"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <span>Original Transcript</span>
            <span className="ml-1.5 text-xs text-muted/70 font-normal">
              ({originalLanguage})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("translation")}
            className={cn(
              "relative px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0",
              activeTab === "translation"
                ? "border-terracotta text-terracotta font-semibold"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <span>English Translation</span>
          </button>

          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "relative px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap shrink-0",
              activeTab === "summary"
                ? "border-terracotta text-terracotta font-semibold"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            <span>Story Summary</span>
          </button>
        </div>

        {/* AI & Verification Badge */}
        <div className="hidden sm:flex items-center gap-2 pb-2">
          {isReviewed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-moss-subtle text-moss border border-moss/30">
              <CheckCircle2 className="h-3 w-3 text-moss" />
              <span>Reviewed by an archivist</span>
            </span>
          ) : (
            <AiBadge />
          )}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="p-6 sm:p-8 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "transcript" && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-line/40">
                <span className="font-semibold uppercase tracking-wider text-terracotta">
                  Mother Tongue Narration ({originalLanguage})
                </span>
                <span className="text-[11px] text-muted">
                  Original speech transcript preserved exactly as spoken
                </span>
              </div>

              <div
                lang={langCode}
                className={cn(
                  "text-lg sm:text-xl text-ink leading-relaxed whitespace-pre-line selection:bg-terracotta-subtle",
                  isDevanagari ? "font-devanagari-serif" : "font-serif"
                )}
              >
                {originalTranscript}
              </div>
            </motion.div>
          )}

          {activeTab === "translation" && (
            <motion.div
              key="translation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-line/40">
                <span className="font-semibold uppercase tracking-wider text-terracotta">
                  English Translation
                </span>
                <span className="text-[11px] text-muted">
                  Bilingual bridge for cross-cultural research
                </span>
              </div>

              <p className="font-serif text-lg sm:text-xl text-ink leading-relaxed whitespace-pre-line">
                {englishTranslation}
              </p>
            </motion.div>
          )}

          {activeTab === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-line/40">
                <span className="font-semibold uppercase tracking-wider text-terracotta">
                  Archival Abstract & Context
                </span>
                <span className="text-[11px] text-muted">
                  Key cultural themes & historical overview
                </span>
              </div>

              <p className="font-sans text-base sm:text-lg text-ink leading-relaxed">
                {summary}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
