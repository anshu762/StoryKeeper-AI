"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Share2, AlertCircle, Edit3, Check, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface StoryActionsProps {
  slug: string;
  title: string;
  contributorId: string;
}

export function StoryActions({ slug, title, contributorId }: StoryActionsProps) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === contributorId;

  // Share state
  const [copied, setCopied] = useState(false);

  // Edit / Removal Request Dialog
  const [isRemovalOpen, setIsRemovalOpen] = useState(false);
  const [removalType, setRemovalType] = useState<"EDIT" | "REMOVE">("REMOVE");
  const [removalMessage, setRemovalMessage] = useState("");
  const [isSubmittingRemoval, setIsSubmittingRemoval] = useState(false);

  // Report Dialog
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Consent or privacy question");
  const [reportDetails, setReportDetails] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — StoryKeeper AI`,
          text: `Listen to this oral history recording on StoryKeeper AI`,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Story link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error("Failed to copy link");
    }
  };

  const submitRemovalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removalMessage.trim()) return;

    setIsSubmittingRemoval(true);
    try {
      const res = await fetch(`/api/stories/${slug}/removal-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: removalType,
          message: removalMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit request");
        setIsSubmittingRemoval(false);
        return;
      }

      toast.success(data.message);
      setIsRemovalOpen(false);
      setRemovalMessage("");
    } catch (err) {
      toast.error("An unexpected network error occurred.");
    } finally {
      setIsSubmittingRemoval(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      const res = await fetch(`/api/stories/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
          email: reportEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit report");
        setIsSubmittingReport(false);
        return;
      }

      toast.success("Report submitted. An archivist will investigate.");
      setIsReportOpen(false);
      setReportDetails("");
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-line">
      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="rounded-xl gap-2 hover:bg-paper-2"
        aria-label="Share story"
      >
        {copied ? (
          <Check className="h-4 w-4 text-moss" />
        ) : (
          <Share2 className="h-4 w-4 text-terracotta" />
        )}
        <span>{copied ? "Link Copied" : "Share Story"}</span>
      </Button>

      {/* Request Edit / Removal Dialog */}
      <Dialog open={isRemovalOpen} onOpenChange={setIsRemovalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2 text-muted hover:text-ink hover:bg-paper-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Request edit or removal</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Contributor Rights & Story Removal</DialogTitle>
            <DialogDescription>
              StoryKeeper is an ethical, consent-first community archive. Contributors retain ownership of their recorded memories and may modify or withdraw them at any time.
            </DialogDescription>
          </DialogHeader>

          {isOwner ? (
            <form onSubmit={submitRemovalRequest} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                  Action Requested
                </label>
                <Select
                  value={removalType}
                  onValueChange={(v: "EDIT" | "REMOVE") => setRemovalType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REMOVE">Remove story from public archive</SelectItem>
                    <SelectItem value="EDIT">Request edits to transcripts or metadata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                  Reason or specific changes
                </label>
                <Textarea
                  placeholder="Explain why you would like to edit or remove this story..."
                  value={removalMessage}
                  onChange={(e) => setRemovalMessage(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRemovalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isSubmittingRemoval}
                >
                  {isSubmittingRemoval ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-2 text-sm text-ink leading-relaxed">
              <p>
                To request edits or removal of this recording, please{" "}
                <Link
                  href={`/login?callbackUrl=/stories/${slug}`}
                  className="font-semibold text-terracotta underline"
                >
                  sign in to the contributor account
                </Link>{" "}
                that submitted this narrative.
              </p>
              <div className="rounded-xl bg-paper-2 p-3.5 border border-line text-xs text-muted">
                If you are a family descendant, community representative, or participant wishing to dispute this recording, you can also{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRemovalOpen(false);
                    setIsReportOpen(true);
                  }}
                  className="font-semibold text-terracotta underline"
                >
                  Report a Concern
                </button>{" "}
                or email our ethics board at <strong className="text-ink">ethics@storykeeper.org</strong>.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report a Concern Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-2 text-muted hover:text-red-700 hover:bg-red-50"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Report a concern</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Report a Concern</DialogTitle>
            <DialogDescription>
              Help us maintain an accurate, respectful, and ethical historical archive.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitReport} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Nature of Concern
              </label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consent or privacy question">
                    Consent or privacy question
                  </SelectItem>
                  <SelectItem value="Inaccurate AI translation">
                    Inaccurate AI translation
                  </SelectItem>
                  <SelectItem value="Audio corruption or playback issue">
                    Audio corruption or playback issue
                  </SelectItem>
                  <SelectItem value="Disputed cultural fact or memory">
                    Disputed cultural fact or memory
                  </SelectItem>
                  <SelectItem value="Other">Other concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Details & Context
              </label>
              <Textarea
                placeholder="Please describe the issue in detail..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Your Email (optional)
              </label>
              <Input
                type="email"
                placeholder="you@example.com (if you'd like follow-up)"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Concern</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
