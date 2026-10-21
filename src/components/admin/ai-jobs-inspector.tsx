"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cpu,
  RotateCcw,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileCode,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import {
  retryAiJob,
  retryAllFailedAiJobs,
  resetStuckAiJobs,
} from "@/server/actions/admin";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { AiJobStatus, AiJobType } from "@prisma/client";

interface AiJobItem {
  id: string;
  storyId: string;
  type: AiJobType;
  status: AiJobStatus;
  errorMessage: string | null;
  retryCount: number;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  story: {
    id: string;
    title: string;
    slug: string;
    contributor: {
      id: string;
      name: string;
    };
  };
}

interface AiJobsInspectorProps {
  initialJobs: AiJobItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentStatus: string;
  currentType: string;
}

export function AiJobsInspector({
  initialJobs,
  pagination,
  currentStatus,
  currentType,
}: AiJobsInspectorProps) {
  const router = useRouter();
  const [selectedErrorJob, setSelectedErrorJob] = useState<AiJobItem | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [isResettingStuck, setIsResettingStuck] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  const handleRetrySingle = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      await retryAiJob(jobId);
      toast.success("AI Job reset to PENDING. Processing scheduled.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetryingJobId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    setIsRetryingAll(true);
    try {
      const res = await retryAllFailedAiJobs();
      toast.success(`Successfully retried ${res.retriedCount} failed jobs!`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to retry jobs");
    } finally {
      setIsRetryingAll(false);
    }
  };

  const handleResetStuck = async () => {
    setIsResettingStuck(true);
    try {
      const res = await resetStuckAiJobs();
      toast.success(
        res.resetCount > 0
          ? `Reset ${res.resetCount} stuck jobs back to PENDING.`
          : "No stuck jobs found (>10 minutes old)."
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset jobs");
    } finally {
      setIsResettingStuck(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Recovery Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-paper-2 border border-line rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600 shrink-0" />
          <span className="text-xs font-semibold text-ink">
            AI Pipeline Health & Self-Healing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetStuck}
            disabled={isResettingStuck}
            className="text-xs h-8 border-line bg-white shadow-2xs"
            title="Reset jobs stuck in PROCESSING status for over 10 minutes"
          >
            {isResettingStuck ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
            )}
            <span>Reset Stuck Jobs (&gt;10m)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAllFailed}
            disabled={isRetryingAll}
            className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 bg-white"
          >
            {isRetryingAll ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>Retry All Failed</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/jobs"
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            !currentStatus && !currentType
              ? "bg-terracotta text-white border-terracotta"
              : "bg-white border-line text-ink hover:border-terracotta/40"
          }`}
        >
          All Jobs
        </Link>
        <Link
          href="/admin/jobs?status=FAILED"
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            currentStatus === "FAILED"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white border-line text-ink hover:border-red-400"
          }`}
        >
          Failed Jobs
        </Link>
        <Link
          href="/admin/jobs?status=PROCESSING"
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            currentStatus === "PROCESSING"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white border-line text-ink hover:border-amber-400"
          }`}
        >
          In Progress
        </Link>
        <Link
          href="/admin/jobs?status=PENDING"
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            currentStatus === "PENDING"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white border-line text-ink hover:border-purple-400"
          }`}
        >
          Pending Queue
        </Link>
        <Link
          href="/admin/jobs?status=COMPLETED"
          className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
            currentStatus === "COMPLETED"
              ? "bg-moss text-white border-moss"
              : "bg-white border-line text-ink hover:border-moss/40"
          }`}
        >
          Completed
        </Link>
      </div>

      {/* Jobs Table */}
      {initialJobs.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No jobs found"
          description="There are currently no AI background jobs matching your filter criteria."
        />
      ) : (
        <div className="rounded-2xl border border-line bg-white shadow-warm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper-2 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4">Task & Story</th>
                <th className="py-3.5 px-4">Job Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Retries</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 text-xs">
              {initialJobs.map((job) => {
                const isRetrying = retryingJobId === job.id;

                return (
                  <tr key={job.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/stories/${job.story.id}`}
                          className="font-semibold text-ink hover:text-terracotta truncate transition-colors"
                        >
                          {job.story.title}
                        </Link>
                        <span className="text-[10px] text-muted">
                          By {job.story.contributor.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-paper-2 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-line text-ink uppercase tracking-wider">
                        {job.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                          job.status === "COMPLETED"
                            ? "bg-moss/10 text-moss"
                            : job.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : job.status === "PROCESSING"
                            ? "bg-amber-100 text-amber-700 animate-pulse"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {job.status === "COMPLETED" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {job.status === "FAILED" && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-muted text-xs">
                      {job.retryCount > 0 ? (
                        <span className="font-medium text-amber-700">
                          {job.retryCount}x retry
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted text-[11px]">
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.errorMessage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedErrorJob(job)}
                            className="h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <FileCode className="h-3 w-3 mr-1" />
                            <span>Error Log</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRetrying || job.status === "PROCESSING"}
                          onClick={() => handleRetrySingle(job.id)}
                          className="h-7 text-[11px] border-line bg-white"
                        >
                          {isRetrying ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          <span>Retry</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Error Details Modal */}
      {selectedErrorJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="font-serif text-base font-bold text-red-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>AI Job Failure Log</span>
              </h3>
              <button
                onClick={() => setSelectedErrorJob(null)}
                className="text-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong>Story:</strong> {selectedErrorJob.story.title}
              </p>
              <p>
                <strong>Job Type:</strong> {selectedErrorJob.type}
              </p>
              <p>
                <strong>Failed At:</strong>{" "}
                {selectedErrorJob.completedAt
                  ? format(new Date(selectedErrorJob.completedAt), "PPpp")
                  : "N/A"}
              </p>

              <div className="pt-2">
                <span className="font-semibold block mb-1 text-ink">
                  Error Message / Stack Trace:
                </span>
                <pre className="p-3 rounded-xl bg-ink text-white font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 border border-line">
                  {selectedErrorJob.errorMessage || "No error detail captured."}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedErrorJob(null)}
                className="border-line text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                variant="moss"
                onClick={() => {
                  handleRetrySingle(selectedErrorJob.id);
                  setSelectedErrorJob(null);
                }}
                className="text-xs"
              >
                Retry Job Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
