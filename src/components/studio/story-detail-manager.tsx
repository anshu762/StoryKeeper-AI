"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  Edit3,
  Trash2,
  Lock,
  Globe,
  BookOpen,
  ArrowRight,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, StoryStatusType } from "@/components/common/status-badge";
import { WavesurferPlayer } from "@/components/story/wavesurfer-player";
import { updateStoryConsent, deleteStoryDraft } from "@/server/actions/story";
import { StoryPermission, DisplayPreference } from "@prisma/client";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/errors";

interface StoryDetailManagerProps {
  story: {
    id: string;
    slug: string;
    title: string;
    status: StoryStatusType;
    permission: StoryPermission;
    displayPreference: DisplayPreference;
    originalLanguage: string;
    originalTranscript: string;
    englishTranslation: string;
    summary: string;
    region: string | null;
    topic: string | null;
    timePeriodLabel: string | null;
    audioKey: string | null;
    audioDurationSec: number | null;
    submittedAt: Date | null;
    publishedAt: Date | null;
    aiReviewedAt: Date | null;
    themes: Array<{ theme: { name: string; slug: string } }>;
    keywords: Array<{ keyword: { name: string } }>;
    moderationLogs: Array<{
      id: string;
      action: string;
      note: string | null;
      createdAt: Date;
    }>;
  };
  signedAudioUrl: string;
}

const STATUS_EXPLANATIONS: Record<StoryStatusType, string> = {
  DRAFT: "Draft: Your recording is saved. You can add details and start transcription anytime.",
  PROCESSING: "Processing: AI transcription and translation are running in the background.",
  NEEDS_REVIEW: "Needs Review: AI processing is complete. Review and polish your transcript before submission.",
  SUBMITTED: "Submitted: Your recording is in queue for archival review by community curators.",
  APPROVED: "Approved: Your story has been approved and is queued for public preservation.",
  REJECTED: "Changes Needed: Curators requested adjustments before this story can be published.",
  PUBLISHED: "Published: Your oral memory is live and discoverable in the public archive.",
  ARCHIVED: "Archived: Story preserved in historical cold storage.",
};

export function StoryDetailManager({
  story,
  signedAudioUrl,
}: StoryDetailManagerProps) {
  const router = useRouter();

  // Permission settings state
  const [currentPermission, setCurrentPermission] = useState<StoryPermission>(
    story.permission
  );
  const [currentDisplay, setCurrentDisplay] = useState<DisplayPreference>(
    story.displayPreference
  );
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);

  // Edit published warning dialog
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  // Check for admin "changes requested" note
  const latestLog = story.moderationLogs[0];
  const hasChangesRequested =
    story.status === "REJECTED" ||
    latestLog?.action === "REQUEST_CHANGES";

  const handleConsentChange = async (
    newPerm: StoryPermission,
    newDisp: DisplayPreference
  ) => {
    setIsUpdatingConsent(true);
    try {
      await updateStoryConsent(story.id, {
        permission: newPerm,
        displayPreference: newDisp,
      });
      setCurrentPermission(newPerm);
      setCurrentDisplay(newDisp);
      toast.success("Permission settings updated! Changes logged.");
    } catch (err: unknown) {
      toast.error(
        getFriendlyErrorMessage(err, "Failed to update permission settings.")
      );
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this draft recording?")) {
      return;
    }

    setIsDeletingDraft(true);
    try {
      await deleteStoryDraft(story.id);
      toast.success("Draft story deleted.");
      router.push("/dashboard/stories");
    } catch (err: unknown) {
      toast.error(
        getFriendlyErrorMessage(err, "Failed to delete draft. Please try again.")
      );
      setIsDeletingDraft(false);
    }
  };

  const handleEditClick = () => {
    if (story.status === "SUBMITTED" || story.status === "PUBLISHED") {
      setShowEditWarning(true);
    } else {
      router.push(`/dashboard/stories/${story.id}/review`);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Status & Actions */}
      <div className="bg-paper-2/50 border border-line rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={story.status} />
            <span className="text-xs text-muted-foreground font-mono">
              ID: {story.slug}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
            {story.title}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            {STATUS_EXPLANATIONS[story.status]}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch sm:self-center justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleEditClick}
            className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Transcript & Details</span>
          </Button>

          {(story.status === "DRAFT" || story.status === "REJECTED") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeletingDraft}
              className="border-line text-xs text-muted-foreground hover:text-red-600 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Draft</span>
            </Button>
          )}
        </div>
      </div>

      {/* Admin Changes Requested Alert Banner */}
      {hasChangesRequested && latestLog?.note && (
        <div className="rounded-2xl border border-saffron/40 bg-saffron/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-sm">
            <AlertCircle className="w-4 h-4 text-terracotta" />
            <span>Curator Feedback / Changes Requested</span>
          </div>
          <p className="text-xs text-ink/85 leading-relaxed bg-paper/60 p-3.5 rounded-xl border border-line/60">
            &ldquo;{latestLog.note}&rdquo;
          </p>
          <div className="pt-1">
            <Button
              size="sm"
              onClick={handleEditClick}
              className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit and Resubmit Story</span>
            </Button>
          </div>
        </div>
      )}

      {/* Pinned Audio Player */}
      <div>
        <WavesurferPlayer
          audioUrl={signedAudioUrl}
          title={story.title}
          durationSec={story.audioDurationSec}
        />
      </div>

      {/* Content Preview & Consent Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Story Transcripts (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Transcript */}
          <div className="bg-paper border border-line rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-serif text-lg font-medium text-ink">
                Original Language Transcript ({story.originalLanguage})
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">
              {story.originalTranscript || (
                <span className="italic text-muted-foreground">
                  No transcript generated yet.
                </span>
              )}
            </p>
          </div>

          {/* English Translation */}
          <div className="bg-paper border border-line rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-serif text-lg font-medium text-ink">
                English Translation
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">
              {story.englishTranslation || (
                <span className="italic text-muted-foreground">
                  No translation generated yet.
                </span>
              )}
            </p>
          </div>

          {/* Summary */}
          {story.summary && (
            <div className="bg-paper border border-line rounded-2xl p-6 space-y-2 shadow-xs">
              <h4 className="font-serif text-base font-medium text-ink">
                Summary & Synopsis
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {story.summary}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Metadata & Granular Consent Settings (1 column) */}
        <div className="space-y-6">
          {/* Metadata Block */}
          <div className="bg-paper border border-line rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h4 className="font-serif text-base font-medium text-ink border-b border-line/60 pb-2">
              Story Metadata
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-line/40">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-medium text-ink">{story.originalLanguage}</span>
              </div>
              {story.region && (
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="font-medium text-ink">{story.region}</span>
                </div>
              )}
              {story.timePeriodLabel && (
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-muted-foreground">Era:</span>
                  <span className="font-medium text-ink">{story.timePeriodLabel}</span>
                </div>
              )}
              {story.topic && (
                <div className="flex justify-between py-1 border-b border-line/40">
                  <span className="text-muted-foreground">Topic:</span>
                  <span className="font-medium text-ink">{story.topic}</span>
                </div>
              )}
            </div>

            {/* Themes & Keywords */}
            {story.themes.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Themes
                </span>
                <div className="flex flex-wrap gap-1">
                  {story.themes.map((t) => (
                    <span
                      key={t.theme.slug}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-paper-2 text-ink font-medium"
                    >
                      #{t.theme.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Granular Consent & Permission Controls */}
          <div className="bg-paper border border-line rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-line/60 pb-2">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              <h4 className="font-serif text-base font-medium text-ink">
                Consent & Visibility
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You can adjust this story&apos;s visibility tier or attribution preference at any time. Changes take effect immediately.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Visibility Tier
                </label>
                <Select
                  value={currentPermission}
                  disabled={isUpdatingConsent}
                  onValueChange={(val) =>
                    handleConsentChange(
                      val as StoryPermission,
                      currentDisplay
                    )
                  }
                >
                  <SelectTrigger className="bg-white/90 border-line text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public Archive (Visible to all)</SelectItem>
                    <SelectItem value="PRIVATE">Private Archive (Family only)</SelectItem>
                    <SelectItem value="RESEARCH_ONLY">Research Archive (Academic export)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Attribution
                </label>
                <Select
                  value={currentDisplay}
                  disabled={isUpdatingConsent}
                  onValueChange={(val) =>
                    handleConsentChange(
                      currentPermission,
                      val as DisplayPreference
                    )
                  }
                >
                  <SelectTrigger className="bg-white/90 border-line text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAMED">Named Contributor</SelectItem>
                    <SelectItem value="ANONYMOUS">Anonymous Contributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Warning Dialog Modal */}
      {showEditWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-terracotta">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-serif text-lg font-medium text-ink">
                Edit Submitted or Published Story?
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Because this story has already been submitted or approved, editing its content will temporarily unpublish it and place it back in <strong>Needs Review</strong> status until re-submitted for moderation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditWarning(false)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowEditWarning(false);
                  router.push(`/dashboard/stories/${story.id}/review`);
                }}
                className="bg-terracotta hover:bg-terracotta/90 text-white text-xs"
              >
                Proceed to Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
