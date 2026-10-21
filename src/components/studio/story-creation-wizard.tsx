"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  UploadCloud,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
  Globe,
  BookOpen,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AudioRecorder } from "./audio-recorder";
import { AudioUploader } from "./audio-uploader";
import { AiProcessingStatus } from "./ai-processing-status";
import {
  createStoryDraft,
  updateStoryDraft,
  updateStoryConsent,
} from "@/server/actions/story";
import { StoryPermission, DisplayPreference } from "@prisma/client";
import { toast } from "sonner";

interface CollectionOption {
  id: string;
  name: string;
  slug: string;
}

interface StoryCreationWizardProps {
  collections: CollectionOption[];
  userPreferredLanguage?: string;
  userDefaultPermission?: StoryPermission;
  userDefaultDisplay?: DisplayPreference;
}

const LANGUAGES = [
  "Hindi",
  "Bhojpuri",
  "Maithili",
  "Magahi",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Malayalam",
  "Kannada",
  "Odia",
  "Assamese",
  "English",
  "Other",
];

const ERAS = [
  "1940s",
  "1950s",
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "Present Era",
];

export function StoryCreationWizard({
  collections,
  userPreferredLanguage = "Hindi",
  userDefaultPermission = "PUBLIC",
  userDefaultDisplay = "NAMED",
}: StoryCreationWizardProps) {
  const router = useRouter();

  // Wizard Step: 1 = Audio, 2 = Details, 3 = Consent, 4 = AI Pipeline
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Story ID in DB (created after audio upload)
  const [storyId, setStoryId] = useState<string | null>(null);

  // Step 1: Audio state
  const [audioMode, setAudioMode] = useState<"record" | "upload">("record");
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Step 2: Metadata state
  const [title, setTitle] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState(userPreferredLanguage);
  const [region, setRegion] = useState("");
  const [topic, setTopic] = useState("");
  const [timePeriodLabel, setTimePeriodLabel] = useState("");
  const [timePeriodStart, setTimePeriodStart] = useState<string>("");
  const [timePeriodEnd, setTimePeriodEnd] = useState<string>("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Step 3: Consent state
  const [permission, setPermission] = useState<StoryPermission>(userDefaultPermission);
  const [displayPreference, setDisplayPreference] = useState<DisplayPreference>(userDefaultDisplay);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Autosave debouncer ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1: Upload Audio to Storage & Create Draft Story in DB
  const handleUploadAndSaveAudio = async () => {
    if (!selectedAudioFile) {
      toast.error("Please record or select an audio file first");
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgress(10);

    try {
      // 1. Get presigned PUT URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mimeType: selectedAudioFile.type || "audio/wav",
          sizeBytes: selectedAudioFile.size,
          filename: selectedAudioFile.name,
        }),
      });

      if (!presignedRes.ok) {
        const errorData = await presignedRes.json();
        throw new Error(errorData.error || "Failed to generate upload URL");
      }

      const { uploadUrl, key } = await presignedRes.json();
      setUploadProgress(35);

      // 2. Direct PUT to R2 (or local fallback)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedAudioFile.type || "audio/wav",
        },
        body: selectedAudioFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload audio file to storage");
      }

      setUploadProgress(75);

      // 3. Create Draft Story in DB immediately
      const draftResult = await createStoryDraft({
        audioKey: key,
        audioMimeType: selectedAudioFile.type || "audio/wav",
        audioSizeBytes: selectedAudioFile.size,
        audioDurationSec,
        originalLanguage,
      });

      setStoryId(draftResult.storyId);
      setUploadProgress(100);
      toast.success("Audio saved! Your story is secured as a draft.");
      setCurrentStep(2);
    } catch (err: any) {
      console.error("[AUDIO SAVE ERROR]", err);
      toast.error(err.message || "Failed to save audio recording");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Step 2: Debounced autosave
  useEffect(() => {
    if (!storyId || currentStep !== 2) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        await updateStoryDraft(storyId, {
          title: title.trim() || "Untitled Oral Memory",
          originalLanguage,
          region: region.trim() || null,
          topic: topic.trim() || null,
          timePeriodLabel: timePeriodLabel || null,
          timePeriodStart: timePeriodStart ? parseInt(timePeriodStart, 10) : null,
          timePeriodEnd: timePeriodEnd ? parseInt(timePeriodEnd, 10) : null,
          collectionId: collectionId || null,
          description: description.trim() || null,
        });
        setLastSavedTime(new Date());
      } catch (err) {
        console.warn("[AUTOSAVE ERROR]", err);
      } finally {
        setIsAutosaving(false);
      }
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    storyId,
    currentStep,
    title,
    originalLanguage,
    region,
    topic,
    timePeriodLabel,
    timePeriodStart,
    timePeriodEnd,
    collectionId,
    description,
  ]);

  // Step 3: Save consent & proceed to Step 4
  const handleProceedToAi = async () => {
    if (!consentConfirmed) {
      toast.error("Please confirm that you have permission to share this recording");
      return;
    }

    if (!storyId) return;

    try {
      await updateStoryConsent(storyId, {
        permission,
        displayPreference,
      });

      // Trigger AI pipeline
      await fetch(`/api/stories/${storyId}/process`, {
        method: "POST",
      });

      setCurrentStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to update consent preferences");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Step Indicator Header */}
      <div className="bg-paper-2/40 border border-line rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          {[
            { num: 1, label: "Audio Capture" },
            { num: 2, label: "Story Details" },
            { num: 3, label: "Consent & Rights" },
            { num: 4, label: "AI Preservation" },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-terracotta text-white"
                      : isDone
                      ? "bg-moss text-white"
                      : "bg-paper text-muted-foreground border border-line"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isActive ? "text-ink font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {s.num < 4 && (
                  <div className="w-4 sm:w-6 h-px bg-line/80 mx-1 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Autosave badge */}
        {storyId && currentStep === 2 && (
          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
            {isAutosaving ? "Saving draft..." : lastSavedTime ? "Draft saved" : "Draft"}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================
            STEP 1: AUDIO RECORD OR UPLOAD
        ======================================================== */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Step 1: Capture the Voice
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Record your elder or community member directly, or upload a pre-recorded audio file.
              </p>
            </div>

            {/* Audio Method Switcher Tabs */}
            <div className="flex border-b border-line">
              <button
                type="button"
                onClick={() => setAudioMode("record")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  audioMode === "record"
                    ? "border-terracotta text-terracotta font-semibold"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                <Mic className="w-4 h-4" />
                Record in Browser
              </button>
              <button
                type="button"
                onClick={() => setAudioMode("upload")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  audioMode === "upload"
                    ? "border-terracotta text-terracotta font-semibold"
                    : "border-transparent text-muted-foreground hover:text-ink"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Upload Audio File
              </button>
            </div>

            {/* Audio capture controls */}
            {audioMode === "record" ? (
              <AudioRecorder
                onRecordingComplete={(file, duration) => {
                  setSelectedAudioFile(file);
                  setAudioDurationSec(duration);
                }}
                disabled={isUploadingAudio}
              />
            ) : (
              <AudioUploader
                onFileSelected={(file, duration) => {
                  setSelectedAudioFile(file);
                  setAudioDurationSec(duration);
                }}
                disabled={isUploadingAudio}
              />
            )}

            {/* Upload Progress Bar */}
            {isUploadingAudio && (
              <div className="space-y-2 p-4 bg-paper-2 rounded-xl border border-line">
                <div className="flex items-center justify-between text-xs text-ink font-medium">
                  <span>Securing audio in archive storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-paper overflow-hidden">
                  <div
                    className="h-full bg-terracotta transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Next Action */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleUploadAndSaveAudio}
                disabled={!selectedAudioFile || isUploadingAudio}
                className="bg-terracotta hover:bg-terracotta/90 text-white px-7 rounded-xl gap-2 shadow-sm"
              >
                {isUploadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Securing Audio...</span>
                  </>
                ) : (
                  <>
                    <span>Save Audio & Add Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            STEP 2: STORY METADATA & DETAILS
        ======================================================== */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Step 2: Memory Details
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add context to anchor this recording in community time and geography. Changes autosave.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Story Title <span className="text-terracotta">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grandmother's Mustard Mango Pickle Recipe of 1968"
                  className="bg-paper text-sm sm:text-base border-line"
                />
              </div>

              {/* Language & Era Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Language */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Original Spoken Language <span className="text-terracotta">*</span>
                  </label>
                  <select
                    value={originalLanguage}
                    onChange={(e) => setOriginalLanguage(e.target.value)}
                    className="w-full text-sm bg-paper border border-line rounded-xl px-3 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Era / Decade */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Approximate Time Period
                  </label>
                  <select
                    value={timePeriodLabel}
                    onChange={(e) => setTimePeriodLabel(e.target.value)}
                    className="w-full text-sm bg-paper border border-line rounded-xl px-3 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer"
                  >
                    <option value="">Select an era...</option>
                    {ERAS.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Region & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Region */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Geographic Region
                  </label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Madhubani, Mithila, Bihar"
                    className="bg-paper text-sm border-line"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Village/district/state is fine — please don&apos;t enter exact residential addresses.
                  </p>
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Topic or Tradition
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Traditional Recipes, Handloom Weaving, Migration"
                    className="bg-paper text-sm border-line"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Brief description of the cultural activity or memory.
                  </p>
                </div>
              </div>

              {/* Curated Collection */}
              {collections.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Add to Curated Collection (Optional)
                  </label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full text-sm bg-paper border border-line rounded-xl px-3 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta cursor-pointer"
                  >
                    <option value="">None (General Archive)</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Curator / Contributor Notes
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share any special background about the storyteller, the day of recording, or family context..."
                  className="bg-paper text-sm border-line min-h-[90px]"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="border-line text-xs gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Audio
              </Button>

              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!title.trim()}
                className="bg-terracotta hover:bg-terracotta/90 text-white px-7 rounded-xl gap-2 shadow-sm"
              >
                <span>Continue to Consent</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            STEP 3: ETHICS, PERMISSION & CONSENT
        ======================================================== */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Step 3: Permission & Contributor Rights
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You control how this story is shared. Read our{" "}
                <Link href="/ethics" target="_blank" className="text-terracotta underline">
                  Ethics Charter
                </Link>{" "}
                to understand our commitments.
              </p>
            </div>

            {/* Permission Tier Cards */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Archive Visibility Tier
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PUBLIC */}
                <div
                  onClick={() => setPermission("PUBLIC")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    permission === "PUBLIC"
                      ? "border-terracotta bg-terracotta/5 shadow-xs"
                      : "border-line bg-paper hover:bg-paper-2/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-5 h-5 text-terracotta" />
                    <input
                      type="radio"
                      name="permission"
                      checked={permission === "PUBLIC"}
                      onChange={() => setPermission("PUBLIC")}
                      className="accent-terracotta"
                    />
                  </div>
                  <h4 className="font-serif font-medium text-ink text-base">
                    Public Archive
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Accessible to community members, educators, and grandchildren worldwide.
                  </p>
                </div>

                {/* PRIVATE */}
                <div
                  onClick={() => setPermission("PRIVATE")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    permission === "PRIVATE"
                      ? "border-terracotta bg-terracotta/5 shadow-xs"
                      : "border-line bg-paper hover:bg-paper-2/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Lock className="w-5 h-5 text-moss" />
                    <input
                      type="radio"
                      name="permission"
                      checked={permission === "PRIVATE"}
                      onChange={() => setPermission("PRIVATE")}
                      className="accent-terracotta"
                    />
                  </div>
                  <h4 className="font-serif font-medium text-ink text-base">
                    Private Family Archive
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Strictly confidential. Visible only in your personal contributor dashboard.
                  </p>
                </div>

                {/* RESEARCH ONLY */}
                <div
                  onClick={() => setPermission("RESEARCH_ONLY")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    permission === "RESEARCH_ONLY"
                      ? "border-terracotta bg-terracotta/5 shadow-xs"
                      : "border-line bg-paper hover:bg-paper-2/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-plum" />
                    <input
                      type="radio"
                      name="permission"
                      checked={permission === "RESEARCH_ONLY"}
                      onChange={() => setPermission("RESEARCH_ONLY")}
                      className="accent-terracotta"
                    />
                  </div>
                  <h4 className="font-serif font-medium text-ink text-base">
                    Research Archive Only
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Hidden from public pages. Included solely in permitted academic linguistic datasets.
                  </p>
                </div>
              </div>
            </div>

            {/* Contributor Attribution Preference */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Public Attribution
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDisplayPreference("NAMED")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    displayPreference === "NAMED"
                      ? "border-terracotta bg-terracotta/5"
                      : "border-line bg-paper"
                  }`}
                >
                  <div>
                    <h5 className="text-sm font-medium text-ink">Named Attribution</h5>
                    <p className="text-xs text-muted-foreground">Show your display name on this story</p>
                  </div>
                  <input
                    type="radio"
                    name="display"
                    checked={displayPreference === "NAMED"}
                    onChange={() => setDisplayPreference("NAMED")}
                    className="accent-terracotta"
                  />
                </div>

                <div
                  onClick={() => setDisplayPreference("ANONYMOUS")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    displayPreference === "ANONYMOUS"
                      ? "border-terracotta bg-terracotta/5"
                      : "border-line bg-paper"
                  }`}
                >
                  <div>
                    <h5 className="text-sm font-medium text-ink">Anonymous Contributor</h5>
                    <p className="text-xs text-muted-foreground">No name or account info will ever be shown</p>
                  </div>
                  <input
                    type="radio"
                    name="display"
                    checked={displayPreference === "ANONYMOUS"}
                    onChange={() => setDisplayPreference("ANONYMOUS")}
                    className="accent-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* Required Consent Checkbox */}
            <div className="p-5 rounded-2xl bg-paper-2/60 border border-line space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line text-terracotta focus:ring-terracotta accent-terracotta shrink-0"
                />
                <span className="text-xs sm:text-sm text-ink leading-relaxed">
                  <strong>Contributor Consent Statement:</strong> I certify that I am the storyteller or that I have the storyteller&apos;s explicit, informed consent to record, transcribe, and preserve this oral memory according to the visibility tier selected above.
                </span>
              </label>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="border-line text-xs gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </Button>

              <Button
                type="button"
                onClick={handleProceedToAi}
                disabled={!consentConfirmed}
                className="bg-terracotta hover:bg-terracotta/90 text-white px-7 rounded-xl gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Transcript & Translation</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* ========================================================
            STEP 4: AI BACKGROUND PIPELINE PROGRESS
        ======================================================== */}
        {currentStep === 4 && storyId && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <AiProcessingStatus storyId={storyId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
