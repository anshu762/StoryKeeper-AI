"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Archive,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  resolveRemovalRequest,
  resolveStoryReport,
} from "@/server/actions/admin";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  RemovalRequestType,
  RemovalRequestStatus,
  StoryStatus,
} from "@prisma/client";

interface RemovalRequestItem {
  id: string;
  storyId: string;
  type: RemovalRequestType;
  message: string;
  status: RemovalRequestStatus;
  createdAt: Date | string;
  resolvedAt: Date | string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  story: {
    id: string;
    title: string;
    slug: string;
    status: StoryStatus;
  };
}

interface StoryReportItem {
  id: string;
  storyId: string;
  reason: string;
  details: string | null;
  email: string | null;
  status: string;
  createdAt: Date | string;
  story: {
    id: string;
    title: string;
    slug: string;
    status: StoryStatus;
  };
}

interface RequestsQueueProps {
  removalRequests: RemovalRequestItem[];
  storyReports: StoryReportItem[];
}

export function RequestsQueue({
  removalRequests,
  storyReports,
}: RequestsQueueProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"removal" | "reports">("removal");

  // Dialog State
  const [activeRemovalTarget, setActiveRemovalTarget] = useState<RemovalRequestItem | null>(null);
  const [activeReportTarget, setActiveReportTarget] = useState<StoryReportItem | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolveRemoval = async (resolution: "ARCHIVE_STORY" | "KEEP_STORY" | "DECLINE") => {
    if (!activeRemovalTarget) return;
    setIsSubmitting(true);
    try {
      await resolveRemovalRequest(activeRemovalTarget.id, resolution, adminNote);
      toast.success(
        resolution === "ARCHIVE_STORY"
          ? "Request resolved and story archived from public view"
          : resolution === "KEEP_STORY"
          ? "Request resolved (story kept active)"
          : "Request declined"
      );
      setActiveRemovalTarget(null);
      setAdminNote("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveReport = async (resolution: "TAKE_DOWN" | "DISMISS") => {
    if (!activeReportTarget) return;
    setIsSubmitting(true);
    try {
      await resolveStoryReport(activeReportTarget.id, resolution, adminNote);
      toast.success(
        resolution === "TAKE_DOWN"
          ? "Report resolved and story taken down"
          : "Report dismissed"
      );
      setActiveReportTarget(null);
      setAdminNote("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="border-b border-line flex space-x-6">
        <button
          onClick={() => setActiveTab("removal")}
          className={`py-3 px-1 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "removal"
              ? "border-terracotta text-terracotta"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Contributor Removal Requests ({removalRequests.length})
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`py-3 px-1 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "reports"
              ? "border-terracotta text-terracotta"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          Community Concern Reports ({storyReports.length})
        </button>
      </div>

      {/* Tab 1: Removal Requests */}
      {activeTab === "removal" && (
        <div className="space-y-4">
          {removalRequests.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center text-muted text-xs">
              No contributor removal requests currently pending.
            </div>
          ) : (
            removalRequests.map((req) => (
              <div
                key={req.id}
                className={`rounded-2xl border p-5 shadow-warm space-y-3 transition-colors ${
                  req.status === "OPEN"
                    ? "bg-white border-amber-200"
                    : "bg-paper-2 border-line opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-ink">
                      Request Type: {req.type}
                    </span>
                    <span className="text-[11px] text-muted block">
                      Submitted by {req.user.name} ({req.user.email}) ·{" "}
                      {formatDistanceToNow(new Date(req.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider self-start sm:self-auto ${
                      req.status === "OPEN"
                        ? "bg-amber-100 text-amber-800"
                        : req.status === "RESOLVED"
                        ? "bg-moss/10 text-moss"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-ink">
                    <strong>Story:</strong>{" "}
                    <Link
                      href={`/admin/stories/${req.story.id}`}
                      className="font-medium text-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      <span>{req.story.title}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <span className="text-muted ml-2">
                      (Status: {req.story.status})
                    </span>
                  </p>

                  <div className="bg-paper p-3 rounded-xl border border-line text-xs italic text-ink/90">
                    &ldquo;{req.message}&rdquo;
                  </div>
                </div>

                {req.status === "OPEN" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveRemovalTarget(req)}
                      className="h-8 text-xs border-line bg-white shadow-2xs"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Community Concern Reports */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {storyReports.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center text-muted text-xs">
              No community reports submitted by public visitors.
            </div>
          ) : (
            storyReports.map((report) => (
              <div
                key={report.id}
                className={`rounded-2xl border p-5 shadow-warm space-y-3 transition-colors ${
                  report.status === "OPEN"
                    ? "bg-white border-red-200"
                    : "bg-paper-2 border-line opacity-80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-900">
                      Reason: {report.reason}
                    </span>
                    <span className="text-[11px] text-muted block">
                      Reporter Email: {report.email || "Anonymous"} ·{" "}
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider self-start sm:self-auto ${
                      report.status === "OPEN"
                        ? "bg-red-100 text-red-800"
                        : "bg-moss/10 text-moss"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-ink">
                    <strong>Reported Story:</strong>{" "}
                    <Link
                      href={`/admin/stories/${report.story.id}`}
                      className="font-medium text-terracotta hover:underline inline-flex items-center gap-1"
                    >
                      <span>{report.story.title}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </p>

                  {report.details && (
                    <div className="bg-paper p-3 rounded-xl border border-line text-xs italic text-ink/90">
                      &ldquo;{report.details}&rdquo;
                    </div>
                  )}
                </div>

                {report.status === "OPEN" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveReportTarget(report)}
                      className="h-8 text-xs border-line bg-white shadow-2xs"
                    >
                      <span>Investigate & Resolve</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Removal Request Resolution Dialog */}
      {activeRemovalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-ink">
              Resolve Removal Request
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Story: <strong>{activeRemovalTarget.story.title}</strong> by{" "}
              {activeRemovalTarget.user.name}.
            </p>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Curator Resolution Note
              </label>
              <Input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional explanation recorded in audit log..."
                className="text-xs bg-paper border-line"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs text-amber-700 border-amber-200 hover:bg-amber-50 h-auto py-2.5"
                disabled={isSubmitting}
                onClick={() => handleResolveRemoval("ARCHIVE_STORY")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Resolve & Archive Story
                  </span>
                  <span className="text-[10px] text-muted block text-left">
                    Unpublishes the story from public display while preserving record.
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs text-moss border-moss/30 hover:bg-moss/5 h-auto py-2.5"
                disabled={isSubmitting}
                onClick={() => handleResolveRemoval("KEEP_STORY")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Resolve & Keep Story Active
                  </span>
                  <span className="text-[10px] text-muted block text-left">
                    Mark resolved after addressing contributor question without unpublishing.
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs text-red-600 border-red-200 hover:bg-red-50 h-auto py-2.5"
                disabled={isSubmitting}
                onClick={() => handleResolveRemoval("DECLINE")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Decline Request
                  </span>
                  <span className="text-[10px] text-muted block text-left">
                    Marks request as declined with your note.
                  </span>
                </div>
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveRemovalTarget(null)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Community Report Resolution Dialog */}
      {activeReportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-red-900">
              Resolve Community Concern Report
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Reported Story: <strong>{activeReportTarget.story.title}</strong>
              <br />
              Reason: <em>{activeReportTarget.reason}</em>
            </p>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                Curator Investigation Note
              </label>
              <Input
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Details of investigation..."
                className="text-xs bg-paper border-line"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs text-red-700 border-red-200 hover:bg-red-50 h-auto py-2.5"
                disabled={isSubmitting}
                onClick={() => handleResolveReport("TAKE_DOWN")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Take Down Story (Archive)
                  </span>
                  <span className="text-[10px] text-red-600/80 block text-left">
                    Removes story from public archive and marks report as resolved.
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs text-muted hover:bg-gray-100 h-auto py-2.5"
                disabled={isSubmitting}
                onClick={() => handleResolveReport("DISMISS")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Dismiss Report
                  </span>
                  <span className="text-[10px] text-muted block text-left">
                    Report investigated and determined compliant; keep story live.
                  </span>
                </div>
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReportTarget(null)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
