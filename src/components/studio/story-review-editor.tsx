"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  Volume2,
  Globe,
  FileText,
  Layers,
  Tag,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AiBadge } from "@/components/common/ai-badge";
import { WavesurferPlayer } from "@/components/story/wavesurfer-player";
import { saveStoryReview } from "@/server/actions/review";
import { submitStoryForModeration } from "@/server/actions/story";
import { toast } from "sonner";

interface ThemeOption {
  id: string;
  name: string;
  slug: string;
}

interface StoryReviewEditorProps {
  story: {
    id: string;
    slug: string;
    title: string;
    audioKey: string | null;
    audioDurationSec: number | null;
    originalLanguage: string;
    originalTranscript: string;
    englishTranslation: string;
    summary: string;
    region: string | null;
    topic: string | null;
    timePeriodLabel: string | null;
    status: string;
    permission: string;
    displayPreference: string;
    transcriptAi: boolean;
    translationAi: boolean;
    summaryAi: boolean;
    aiReviewedAt: Date | null;
    updatedAt: Date;
    keywords: Array<{ keyword: { name: string; normalizedName: string } }>;
    themes: Array<{ theme: { slug: string; name: string } }>;
  };
  availableThemes: ThemeOption[];
  signedAudioUrl: string;
}

export function StoryReviewEditor({
  story,
  availableThemes,
  signedAudioUrl,
}: StoryReviewEditorProps) {
  const router = useRouter();

  // Mobile tab state
  const [activeTab, setActiveTab] = useState<"transcript" | "translation" | "summary" | "tags">("transcript");

  // Form state
  const [title, setTitle] = useState(story.title);
  const [transcript, setTranscript] = useState(story.originalTranscript);
  const [translation, setTranslation] = useState(story.englishTranslation);
  const [summary, setSummary] = useState(story.summary);
  const [region, setRegion] = useState(story.region || "");
  const [topic, setTopic] = useState(story.topic || "");
  const [timePeriodLabel, setTimePeriodLabel] = useState(story.timePeriodLabel || "");

  // Keywords & Themes
  const [keywords, setKeywords] = useState<string[]>(
    story.keywords.map((k) => k.keyword.name)
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedThemeSlugs, setSelectedThemeSlugs] = useState<string[]>(
    story.themes.map((t) => t.theme.slug)
  );

  // Review status
  const [isReviewed, setIsReviewed] = useState(Boolean(story.aiReviewedAt));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date(story.updatedAt));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastServerUpdatedAt, setLastServerUpdatedAt] = useState<string>(
    new Date(story.updatedAt).toISOString()
  );

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced autosave
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await saveStoryReview(story.id, {
          title,
          originalTranscript: transcript,
          englishTranslation: translation,
          summary,
          region: region || null,
          topic: topic || null,
          timePeriodLabel: timePeriodLabel || null,
          keywords,
          themeSlugs: selectedThemeSlugs,
          expectedUpdatedAt: lastServerUpdatedAt,
        });

        if (res.updatedAt) {
          setLastServerUpdatedAt(res.updatedAt);
        }
        setLastSaved(new Date());
      } catch (err) {
        console.warn("[AUTOSAVE ERROR]", err);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    title,
    transcript,
    translation,
    summary,
    region,
    topic,
    timePeriodLabel,
    keywords,
    selectedThemeSlugs,
    story.id,
    lastServerUpdatedAt,
  ]);

  const handleMarkAsReviewed = async () => {
    setIsSaving(true);
    try {
      await saveStoryReview(story.id, {
        markAsReviewed: true,
      });
      setIsReviewed(true);
      toast.success("AI output verified and marked as reviewed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as reviewed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = keywordInput.trim();
      if (val && !keywords.includes(val)) {
        setKeywords([...keywords, val]);
        setKeywordInput("");
      }
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const toggleTheme = (slug: string) => {
    if (selectedThemeSlugs.includes(slug)) {
      setSelectedThemeSlugs(selectedThemeSlugs.filter((s) => s !== slug));
    } else {
      setSelectedThemeSlugs([...selectedThemeSlugs, slug]);
    }
  };

  const handleSubmitStory = async () => {
    if (!title.trim() || title === "Untitled Oral Memory") {
      toast.error("Please provide a title for your story");
      return;
    }

    if (!transcript.trim()) {
      toast.error("Original transcript cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Ensure all latest changes saved with markAsReviewed set
      await saveStoryReview(story.id, {
        title,
        originalTranscript: transcript,
        englishTranslation: translation,
        summary,
        region,
        topic,
        timePeriodLabel,
        keywords,
        themeSlugs: selectedThemeSlugs,
        markAsReviewed: true,
      });

      // 2. Submit for moderation
      await submitStoryForModeration(story.id);

      toast.success("Story submitted for moderation! You can track its status.");
      router.push(`/dashboard/stories/${story.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit story");
      setIsSubmitting(false);
    }
  };

  const getLangCode = (l: string) => {
    const clean = l.toLowerCase();
    if (clean.includes("hindi")) return "hi";
    if (clean.includes("bhojpuri")) return "bho";
    if (clean.includes("bengali")) return "bn";
    if (clean.includes("punjabi")) return "pa";
    if (clean.includes("tamil")) return "ta";
    return "en";
  };

  const langCode = getLangCode(story.originalLanguage);
  const isDevanagari = ["hi", "bho", "mai"].includes(langCode);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="bg-paper-2/50 border border-line rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {story.originalLanguage}
            </Badge>
            {isReviewed ? (
              <Badge className="bg-moss/10 text-moss border-moss/20 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Reviewed by human
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-terracotta border-terracotta/30 gap-1">
                <Sparkles className="w-3 h-3" />
                AI Generated · Needs Review
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              {isSaving ? "Saving..." : "Changes saved"}
            </span>
          </div>

          <div className="mt-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story Title..."
              className="font-serif text-lg sm:text-xl font-medium bg-transparent border-0 border-b border-line/60 rounded-none px-0 focus-visible:ring-0 focus-visible:border-terracotta text-ink"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          {!isReviewed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAsReviewed}
              className="border-line text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-moss" />
              Mark as Reviewed
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleSubmitStory}
            disabled={isSubmitting}
            className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit for Moderation</span>
          </Button>
        </div>
      </div>

      {/* Pinned Audio Player on Top */}
      <div className="sticky top-20 z-30 shadow-md">
        <WavesurferPlayer
          audioUrl={signedAudioUrl}
          title={title}
          durationSec={story.audioDurationSec}
          sticky={false}
        />
      </div>

      {/* Mobile Tabs Switcher */}
      <div className="lg:hidden flex border-b border-line overflow-x-auto pb-0.5">
        {[
          { key: "transcript", label: `Original (${story.originalLanguage})` },
          { key: "translation", label: "English Translation" },
          { key: "summary", label: "Summary & Context" },
          { key: "tags", label: "Themes & Keywords" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 ${
              activeTab === t.key
                ? "border-terracotta text-terracotta font-semibold"
                : "border-transparent text-muted-foreground hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor Main Content: Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Column 1: Original Language Transcript */}
        <div
          className={`space-y-3 bg-paper border border-line rounded-2xl p-5 sm:p-6 shadow-xs ${
            activeTab !== "transcript" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-medium text-ink">
                Original Oral Recording Transcript
              </span>
              <AiBadge />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase">
              {story.originalLanguage}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Preserve native colloquial phrasing and dialect words. You have final editorial authority.
          </p>

          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            lang={langCode}
            dir="auto"
            rows={14}
            className={`w-full text-base sm:text-lg leading-relaxed bg-paper-2/40 border-line font-sans p-4 rounded-xl ${
              isDevanagari ? "font-serif text-ink" : ""
            }`}
            placeholder="Type or edit the native script transcript here..."
          />
        </div>

        {/* Column 2: English Translation */}
        <div
          className={`space-y-3 bg-paper border border-line rounded-2xl p-5 sm:p-6 shadow-xs ${
            activeTab !== "translation" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-medium text-ink">
                English Translation
              </span>
              <AiBadge />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase">
              English
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Literary translation for worldwide readers. Does not overwrite the original language transcript.
          </p>

          <Textarea
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            rows={14}
            className="w-full text-base sm:text-lg leading-relaxed bg-paper-2/40 border-line font-sans p-4 rounded-xl text-ink"
            placeholder="Edit the English translation here..."
          />
        </div>
      </div>

      {/* Summary, Metadata & Tags Panel */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${
          activeTab === "summary" || activeTab === "tags" ? "" : "hidden lg:grid"
        }`}
      >
        {/* Left: Summary & Metadata */}
        <div className="space-y-4 bg-paper border border-line rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="font-serif text-base font-medium text-ink">
              Editorial Synopsis & Region
            </span>
            <AiBadge />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Archive Summary
            </label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="text-sm bg-paper-2/40 border-line"
              placeholder="Short 2-3 sentence overview of this memory..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Region / Locale
              </label>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g. Mithila, Bihar"
                className="text-sm bg-paper-2/40 border-line"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Era / Decade
              </label>
              <Input
                value={timePeriodLabel}
                onChange={(e) => setTimePeriodLabel(e.target.value)}
                placeholder="e.g. 1960s"
                className="text-sm bg-paper-2/40 border-line"
              />
            </div>
          </div>
        </div>

        {/* Right: Themes & Keywords Chip Editor */}
        <div className="space-y-4 bg-paper border border-line rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="font-serif text-base font-medium text-ink">
              Themes & Keywords
            </span>
            <AiBadge />
          </div>

          {/* Themes multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Community Themes (Click to Toggle)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
              {availableThemes.map((th) => {
                const isSelected = selectedThemeSlugs.includes(th.slug);
                return (
                  <button
                    key={th.slug}
                    type="button"
                    onClick={() => toggleTheme(th.slug)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? "bg-moss text-white border-moss"
                        : "bg-paper-2 text-muted-foreground border-line hover:border-ink/40"
                    }`}
                  >
                    #{th.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keywords editor */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Search Keywords (Press Enter to Add)
            </label>

            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-paper-2/40 border border-line rounded-xl min-h-[46px]">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-paper border border-line text-ink"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-terracotta"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder={keywords.length === 0 ? "Add keyword..." : ""}
                className="text-xs bg-transparent border-0 focus:outline-none flex-1 min-w-[100px] text-ink"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
