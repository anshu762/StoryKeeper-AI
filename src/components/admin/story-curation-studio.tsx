"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Send,
  XCircle,
  Archive,
  ArrowLeft,
  Shield,
  User,
  Layers,
  Sparkles,
  Tag,
  Plus,
  X,
  History,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/status-badge";
import { WavesurferPlayer } from "@/components/story/wavesurfer-player";
import {
  approveStory,
  requestStoryChanges,
  rejectStory,
  unpublishStory,
  updateStoryAsAdmin,
  acceptAiTheme,
} from "@/server/actions/admin";
import {
  StoryStatus,
  StoryPermission,
  DisplayPreference,
  Collection,
  Theme,
} from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface StoryCurationStudioProps {
  story: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    audioKey: string | null;
    originalLanguage: string;
    originalTranscript: string;
    englishTranslation: string;
    summary: string;
    region: string | null;
    topic: string | null;
    timePeriodLabel: string | null;
    timePeriodStart: number | null;
    timePeriodEnd: number | null;
    status: StoryStatus;
    permission: StoryPermission;
    displayPreference: DisplayPreference;
    aiReviewedAt: Date | string | null;
    submittedAt: Date | string | null;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    contributor: {
      id: string;
      name: string;
      email: string;
      preferredLanguage: string;
      createdAt: Date | string;
    };
    collection: Collection | null;
    collectionId: string | null;
    keywords: { keyword: { id: string; name: string } }[];
    themes: { theme: { id: string; name: string; slug: string } }[];
    moderationLogs: {
      id: string;
      action: string;
      note: string | null;
      createdAt: Date | string;
      admin: { id: string; name: string; email: string };
    }[];
    consentLogs: {
      id: string;
      oldPermission: string;
      newPermission: string;
      oldDisplay: string;
      newDisplay: string;
      createdAt: Date | string;
      user: { id: string; name: string };
    }[];
  };
  audioUrl: string | null;
  availableCollections: Collection[];
  availableThemes: Theme[];
}

export function StoryCurationStudio({
  story,
  audioUrl,
  availableCollections,
  availableThemes,
}: StoryCurationStudioProps) {
  const router = useRouter();

  // Story Form State
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description || "");
  const [originalLanguage, setOriginalLanguage] = useState(story.originalLanguage);
  const [originalTranscript, setOriginalTranscript] = useState(story.originalTranscript);
  const [englishTranslation, setEnglishTranslation] = useState(story.englishTranslation);
  const [summary, setSummary] = useState(story.summary);
  const [region, setRegion] = useState(story.region || "");
  const [topic, setTopic] = useState(story.topic || "");
  const [timePeriodLabel, setTimePeriodLabel] = useState(story.timePeriodLabel || "");
  const [collectionId, setCollectionId] = useState(story.collectionId || "");
  const [permission, setPermission] = useState<StoryPermission>(story.permission);
  const [displayPreference, setDisplayPreference] = useState<DisplayPreference>(
    story.displayPreference
  );
  const [keywords, setKeywords] = useState<string[]>(
    story.keywords.map((k) => k.keyword.name)
  );
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(
    story.themes.map((t) => t.theme.id)
  );
  const [isAiReviewed, setIsAiReviewed] = useState(Boolean(story.aiReviewedAt));

  // Keyword input
  const [newKeyword, setNewKeyword] = useState("");

  // Action Modals State
  const [isSaving, setIsSaving] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changesNote, setChangesNote] = useState("");
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [unpublishNote, setUnpublishNote] = useState("");
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  // Add keyword
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newKeyword.trim()) {
      e.preventDefault();
      const val = newKeyword.trim();
      if (!keywords.includes(val)) {
        setKeywords([...keywords, val]);
      }
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  // Toggle theme
  const toggleTheme = (themeId: string) => {
    setSelectedThemeIds((prev) =>
      prev.includes(themeId)
        ? prev.filter((id) => id !== themeId)
        : [...prev, themeId]
    );
  };

  // Save changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateStoryAsAdmin(
        story.id,
        {
          title,
          description,
          originalLanguage,
          originalTranscript,
          englishTranslation,
          summary,
          region,
          topic,
          timePeriodLabel,
          collectionId: collectionId || null,
          permission,
          displayPreference,
          keywords,
          themeIds: selectedThemeIds,
          markReviewed: isAiReviewed,
        },
        "Curator edited story fields."
      );
      toast.success("Story changes saved successfully");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save story");
    } finally {
      setIsSaving(false);
    }
  };

  // Approve action
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveStory(story.id, approveNote);
      toast.success(
        permission === "PUBLIC"
          ? "Story approved and published to public archive!"
          : "Story approved for private/research archive!"
      );
      setShowApproveDialog(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  // Request changes action
  const handleRequestChanges = async () => {
    if (!changesNote.trim()) {
      toast.error("Please provide feedback notes explaining the changes needed.");
      return;
    }
    setIsRequestingChanges(true);
    try {
      await requestStoryChanges(story.id, changesNote);
      toast.success("Changes requested. Contributor notified.");
      setShowChangesDialog(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setIsRequestingChanges(false);
    }
  };

  // Reject action
  const handleReject = async () => {
    if (!rejectNote.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsRejecting(true);
    try {
      await rejectStory(story.id, rejectNote);
      toast.success("Story marked as rejected.");
      setShowRejectDialog(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setIsRejecting(false);
    }
  };

  // Unpublish action
  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      await unpublishStory(story.id, unpublishNote);
      toast.success("Story unpublished and moved to archive.");
      setShowUnpublishDialog(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setIsUnpublishing(false);
    }
  };

  const isPublished = story.status === "PUBLISHED";
  const canPublishDirectly = isAiReviewed && title && originalTranscript && englishTranslation;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1">
          <Link
            href="/admin/moderation"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Moderation Queue</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="font-serif text-2xl font-bold text-ink">
              Story Moderation & Curation Studio
            </h1>
            <StatusBadge status={story.status} />
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="border-line bg-white shadow-2xs text-xs h-9"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5 text-terracotta" />
            )}
            <span>Save Edits</span>
          </Button>

          {story.status !== "APPROVED" && story.status !== "PUBLISHED" && (
            <Button
              variant="moss"
              size="sm"
              onClick={() => setShowApproveDialog(true)}
              disabled={!canPublishDirectly}
              className="text-xs h-9"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Approve Story</span>
            </Button>
          )}

          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnpublishDialog(true)}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 text-xs h-9"
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              <span>Unpublish / Archive</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChangesDialog(true)}
            className="border-line text-xs h-9 bg-white"
          >
            <Send className="h-3.5 w-3.5 mr-1.5 text-saffron" />
            <span>Request Changes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-9"
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>Reject</span>
          </Button>
        </div>
      </div>

      {/* Audio Waveform Player */}
      <div className="bg-paper-2 border border-line rounded-2xl p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
          <span>Audio Recording</span>
          <span className="text-[11px] font-normal text-muted lowercase">
            ({story.originalLanguage} · Key: {story.audioKey || "local-recording"})
          </span>
        </h2>
        {audioUrl ? (
          <WavesurferPlayer audioUrl={audioUrl} title={story.title} />
        ) : (
          <div className="p-6 text-center text-xs text-muted border border-dashed border-line rounded-xl">
            No audio file currently attached to this story record.
          </div>
        )}
      </div>

      {/* Main Grid: Editorial Editor & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Bilingual Transcript, Translation, Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-warm space-y-4">
            <h2 className="font-serif text-base font-bold text-ink">
              Story Identity & Context
            </h2>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Story Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-serif text-base font-semibold bg-paper border-line"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Background Context / Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-xs bg-paper border-line"
                placeholder="Details about the setting, contributor's family, or community background..."
              />
            </div>
          </div>

          {/* Bilingual Transcripts Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Transcript */}
            <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                  Original Transcript ({originalLanguage})
                </span>
                <span className="text-[10px] text-muted font-medium bg-paper-2 px-2 py-0.5 rounded border border-line">
                  Native Script
                </span>
              </div>
              <Textarea
                value={originalTranscript}
                onChange={(e) => setOriginalTranscript(e.target.value)}
                rows={12}
                className="font-serif text-sm leading-relaxed bg-paper border-line"
                lang={originalLanguage.toLowerCase()}
              />
            </div>

            {/* English Translation */}
            <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                  English Translation
                </span>
                <span className="text-[10px] text-moss font-medium bg-moss/10 px-2 py-0.5 rounded">
                  AI + Human Review
                </span>
              </div>
              <Textarea
                value={englishTranslation}
                onChange={(e) => setEnglishTranslation(e.target.value)}
                rows={12}
                className="text-xs leading-relaxed bg-paper border-line"
              />
            </div>
          </div>

          {/* Cultural Summary */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-warm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-ink">
                Cultural Summary & Key Themes
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAiReviewed}
                  onChange={(e) => setIsAiReviewed(e.target.checked)}
                  className="rounded border-line text-moss accent-moss"
                />
                <span className="text-xs font-medium text-moss">
                  ✓ Verified by Human Curator
                </span>
              </label>
            </div>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="text-xs leading-relaxed bg-paper border-line"
            />
          </div>

          {/* Keywords & Themes */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-warm space-y-4">
            <h2 className="font-serif text-base font-bold text-ink">
              Cultural Tags & Classification
            </h2>

            {/* Keywords */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                Keywords (Press Enter to add)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 bg-paper-2 border border-line text-xs px-2.5 py-1 rounded-lg text-ink font-medium"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-muted hover:text-ink"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Type keyword and press Enter..."
                className="text-xs bg-paper border-line h-8 max-w-sm"
              />
            </div>

            {/* Themes */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                Curated Themes
              </label>
              <div className="flex flex-wrap gap-2">
                {availableThemes.map((th) => {
                  const isSelected = selectedThemeIds.includes(th.id);
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => toggleTheme(th.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-colors font-medium ${
                        isSelected
                          ? "bg-moss text-white border-moss"
                          : "bg-paper-2 text-ink border-line hover:border-moss/40"
                      }`}
                    >
                      {th.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata, Consent & Moderation Timeline */}
        <div className="space-y-6">
          {/* Consent Status Card (Crucial for AGENTS.md rule 1 & 2) */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-serif text-sm font-bold text-ink flex items-center gap-2">
                <Shield className="h-4 w-4 text-terracotta" />
                <span>Consent & Privacy Status</span>
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  permission === "PUBLIC"
                    ? "bg-moss/10 text-moss"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {permission}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Access & Visibility Tier
                </label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as StoryPermission)}
                  className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2 text-ink"
                >
                  <option value="PUBLIC">PUBLIC — Open Digital Archive</option>
                  <option value="RESEARCH_ONLY">RESEARCH_ONLY — Academic / Export Only</option>
                  <option value="PRIVATE">PRIVATE — Hidden from Public Archive</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Contributor Attribution
                </label>
                <select
                  value={displayPreference}
                  onChange={(e) => setDisplayPreference(e.target.value as DisplayPreference)}
                  className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2 text-ink"
                >
                  <option value="NAMED">NAMED — Display Full Contributor Name</option>
                  <option value="ANONYMOUS">ANONYMOUS — Display as Community Elder</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-paper-2 border border-line/60 space-y-1 text-[11px] text-muted">
                <p className="font-medium text-ink">Contributor Details (Admin Only):</p>
                <p>Name: {story.contributor.name}</p>
                <p>Email: {story.contributor.email}</p>
                <p>
                  Joined:{" "}
                  {format(new Date(story.contributor.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Curated Collection Assignment */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-3">
            <h2 className="font-serif text-sm font-bold text-ink flex items-center gap-2">
              <Layers className="h-4 w-4 text-saffron" />
              <span>Exhibition Collection</span>
            </h2>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full text-xs bg-paper border border-line rounded-xl px-3 py-2 text-ink"
            >
              <option value="">No Collection Assigned</option>
              {availableCollections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Metadata Card: Region, Topic, Era */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-3">
            <h2 className="font-serif text-sm font-bold text-ink">
              Geographic & Temporal Metadata
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Coarse Region / District
                </label>
                <Input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Bhojpur, Bihar"
                  className="text-xs bg-paper border-line"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Primary Topic
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Folk Traditions"
                  className="text-xs bg-paper border-line"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Time Period / Era
                </label>
                <Input
                  value={timePeriodLabel}
                  onChange={(e) => setTimePeriodLabel(e.target.value)}
                  placeholder="e.g. 1960s"
                  className="text-xs bg-paper border-line"
                />
              </div>
            </div>
          </div>

          {/* Moderation History Stream */}
          <div className="bg-white border border-line rounded-2xl p-5 shadow-warm space-y-3">
            <h2 className="font-serif text-sm font-bold text-ink flex items-center gap-2">
              <History className="h-4 w-4 text-muted" />
              <span>Moderation History</span>
            </h2>

            <div className="divide-y divide-line/60 text-xs">
              {story.moderationLogs.length === 0 ? (
                <p className="text-[11px] text-muted py-2">
                  No previous moderation actions.
                </p>
              ) : (
                story.moderationLogs.map((log) => (
                  <div key={log.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-ink">
                        {log.action}
                      </span>
                      <span className="text-muted">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-[11px] text-muted italic bg-paper-2 p-2 rounded border border-line/60">
                        &ldquo;{log.note}&rdquo;
                      </p>
                    )}
                    <span className="text-[10px] text-muted block">
                      Curator: {log.admin.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE DIALOG */}
      {showApproveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">
              Approve Story: {story.title}
            </h3>

            {permission === "PUBLIC" ? (
              <p className="text-xs text-ink/80 leading-relaxed">
                This story has permission set to <strong>PUBLIC</strong>. Approving it will set status to <strong>PUBLISHED</strong>, make it live on the public archive immediately, and trigger automatic cache revalidation.
              </p>
            ) : (
              <p className="text-xs text-ink/80 leading-relaxed">
                This story has permission set to <strong>{permission}</strong>. Approving it will set status to <strong>APPROVED</strong>, but it will <strong>remain non-public</strong> in accordance with contributor consent choices.
              </p>
            )}

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Curator Approval Note (Optional)
              </label>
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="e.g. Transcripts verified and cultural terms preserved."
                className="text-xs bg-paper border-line"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApproveDialog(false)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="moss"
                onClick={handleApprove}
                disabled={isApproving}
                className="text-xs"
              >
                {isApproving ? "Approving..." : "Confirm Approval"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CHANGES DIALOG */}
      {showChangesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">
              Request Changes from Contributor
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Explain clearly what needs updating (e.g. spelling of family names, unclear audio timestamp, missing region). This note will be visible to the contributor on their dashboard.
            </p>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Feedback & Instructions *
              </label>
              <Textarea
                value={changesNote}
                onChange={(e) => setChangesNote(e.target.value)}
                rows={4}
                placeholder="Please review the spelling of the harvest song title and confirm the region..."
                className="text-xs bg-paper border-line"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangesDialog(false)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRequestChanges}
                disabled={isRequestingChanges || !changesNote.trim()}
                className="bg-saffron hover:bg-saffron/90 text-ink text-xs"
              >
                {isRequestingChanges ? "Submitting..." : "Send Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT DIALOG */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-red-900">
              Reject Story Submission
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Rejecting a story sets status to <strong>REJECTED</strong>. A reason note is mandatory for our ethical audit log.
            </p>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Rejection Reason *
              </label>
              <Textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                placeholder="Unclear audio, out-of-scope content, or copyright concern..."
                className="text-xs bg-paper border-line"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={isRejecting || !rejectNote.trim()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH DIALOG */}
      {showUnpublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">
              Unpublish Story
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Unpublishing will remove this story from public search, archive, and collection pages immediately. The story remains preserved in the database with status <strong>ARCHIVED</strong>.
            </p>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Reason / Internal Note (Optional)
              </label>
              <Input
                value={unpublishNote}
                onChange={(e) => setUnpublishNote(e.target.value)}
                placeholder="e.g. Temporary takedown pending contributor review"
                className="text-xs bg-paper border-line"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnpublishDialog(false)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
              >
                {isUnpublishing ? "Unpublishing..." : "Confirm Unpublish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
