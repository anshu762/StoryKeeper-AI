import React from "react";
import Link from "next/link";
import {
  Mic,
  Plus,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Edit3,
  Eye,
  Volume2,
} from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatDuration } from "@/lib/utils";
import { format } from "date-fns";

export default async function DashboardPage() {
  const user = await requireUser();

  const stories = await prisma.story.findMany({
    where: {
      contributorId: user.id,
      deletedAt: null,
    },
    include: {
      themes: {
        include: {
          theme: true,
        },
      },
      moderationLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const publishedCount = stories.filter((s) => s.status === "PUBLISHED").length;
  const draftCount = stories.filter((s) => s.status === "DRAFT").length;
  const reviewCount = stories.filter(
    (s) =>
      s.status === "NEEDS_REVIEW" ||
      s.status === "SUBMITTED" ||
      s.status === "PROCESSING"
  ).length;

  // Stories that have an active change request from admin
  const storiesWithChangesRequested = stories.filter(
    (s) => s.status === "REJECTED" || s.moderationLogs[0]?.action === "REQUEST_CHANGES"
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Contributor Studio"
        title={`Welcome, ${user.name || "Storykeeper"}`}
        description="Preserve oral memories, review AI-generated bilingual transcripts, and control your public consent."
        action={
          <Button asChild className="bg-terracotta hover:bg-terracotta/90 text-white rounded-xl shadow-sm">
            <Link href="/dashboard/stories/new">
              <Plus className="h-4 w-4 mr-2" />
              <span>Record New Story</span>
            </Link>
          </Button>
        }
      />

      {/* Notifications Area for Changes Requested */}
      {storiesWithChangesRequested.length > 0 && (
        <div className="rounded-2xl border border-saffron/50 bg-saffron/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink font-semibold text-sm">
            <AlertCircle className="w-4 h-4 text-terracotta shrink-0" />
            <span>
              Curator Feedback: Changes Requested on {storiesWithChangesRequested.length}{" "}
              {storiesWithChangesRequested.length === 1 ? "story" : "stories"}
            </span>
          </div>
          <p className="text-xs text-ink/80 leading-relaxed">
            Our archive curators have reviewed your submission and provided notes to help preserve cultural accuracy.
          </p>
          <div className="space-y-2 pt-1">
            {storiesWithChangesRequested.map((s) => (
              <div
                key={s.id}
                className="bg-paper p-3.5 rounded-xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-ink">{s.title}</span>
                  {s.moderationLogs[0]?.note && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 italic">
                      &ldquo;{s.moderationLogs[0].note}&rdquo;
                    </p>
                  )}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1 shrink-0"
                >
                  <Link href={`/dashboard/stories/${s.id}/review`}>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Resubmit</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Published & Preserved
          </p>
          <p className="font-serif text-3xl font-bold text-moss mt-1">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            In Review & Processing
          </p>
          <p className="font-serif text-3xl font-bold text-terracotta mt-1">
            {reviewCount}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Drafts in Progress
          </p>
          <p className="font-serif text-3xl font-bold text-ink mt-1">
            {draftCount}
          </p>
        </div>
      </div>

      {/* Recent Stories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium text-ink">
              Recent Audio Recordings
            </h2>
            <p className="text-xs text-muted-foreground">
              Your contributed stories and preservation statuses.
            </p>
          </div>
          {stories.length > 0 && (
            <Link
              href="/dashboard/stories"
              className="text-xs text-terracotta hover:underline font-medium inline-flex items-center gap-1"
            >
              View all ({stories.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {stories.length === 0 ? (
          <EmptyState
            icon={<Mic className="h-6 w-6 stroke-[1.5]" />}
            title="No oral histories recorded yet"
            description="Start preserving family recipes, village tales, or personal memories in your native language."
            actionLabel="Start your first recording"
            actionHref="/dashboard/stories/new"
            className="bg-paper-2/40 border border-line rounded-2xl py-14"
          />
        ) : (
          <div className="space-y-3">
            {stories.slice(0, 5).map((story) => (
              <div
                key={story.id}
                className="bg-paper border border-line rounded-2xl p-5 hover:border-terracotta/40 hover:shadow-warm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={story.status} />
                    <Badge variant="secondary" className="text-[11px]">
                      {story.originalLanguage}
                    </Badge>
                    {story.audioDurationSec && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-terracotta" />
                        {formatDuration(story.audioDurationSec)}
                      </span>
                    )}
                  </div>

                  <Link
                    href={
                      story.status === "NEEDS_REVIEW"
                        ? `/dashboard/stories/${story.id}/review`
                        : `/dashboard/stories/${story.id}`
                    }
                    className="block group"
                  >
                    <h3 className="font-serif text-lg font-medium text-ink group-hover:text-terracotta transition-colors truncate">
                      {story.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Created {format(new Date(story.createdAt), "MMM d, yyyy")}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{story.permission.toLowerCase()} archive</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {story.status === "NEEDS_REVIEW" && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-terracotta hover:bg-terracotta/90 text-white text-xs gap-1.5"
                    >
                      <Link href={`/dashboard/stories/${story.id}/review`}>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Review AI Output</span>
                      </Link>
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-line text-xs gap-1"
                  >
                    <Link href={`/dashboard/stories/${story.id}`}>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
