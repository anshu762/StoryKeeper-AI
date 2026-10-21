"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatDistanceToNow, format } from "date-fns";
import { StoryStatus, StoryPermission } from "@prisma/client";

interface StoryItem {
  id: string;
  title: string;
  slug: string;
  status: StoryStatus;
  permission: StoryPermission;
  originalLanguage: string;
  aiReviewedAt: string | Date | null;
  submittedAt: string | Date | null;
  createdAt: string | Date;
  contributor: {
    id: string;
    name: string;
    email: string;
  };
  collection: {
    id: string;
    name: string;
    motif: string;
    coverGradient: string;
  } | null;
}

interface ModerationQueueProps {
  initialStories: StoryItem[];
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentTab: string;
}

const TABS = [
  { id: "submitted", label: "Submitted for Review" },
  { id: "needs_changes", label: "Needs Changes" },
  { id: "approved", label: "Approved & Published" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All Stories" },
];

export function ModerationQueue({
  initialStories,
  initialPagination,
  currentTab,
}: ModerationQueueProps) {
  const [activeTab, setActiveTab] = useState(currentTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const filteredStories = initialStories.filter((s) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchUser =
        s.contributor.name.toLowerCase().includes(q) ||
        s.contributor.email.toLowerCase().includes(q);
      if (!matchTitle && !matchUser) return false;
    }
    if (selectedLanguage && s.originalLanguage !== selectedLanguage) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-line overflow-x-auto">
        <nav className="flex space-x-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/moderation?tab=${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-muted hover:text-ink hover:border-line"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by story title, contributor name or email..."
            className="pl-9 text-xs bg-white border-line h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs bg-white border border-line rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta h-9"
          >
            <option value="">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="Bhojpuri">Bhojpuri</option>
            <option value="Maithili">Maithili</option>
            <option value="Bengali">Bengali</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      {/* Queue Content */}
      {filteredStories.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No stories in this queue"
          description={
            searchTerm || selectedLanguage
              ? "No stories match the active filters. Try clearing search keywords."
              : "All stories in this status have been reviewed. Outstanding work!"
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-line bg-white shadow-warm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-paper-2 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Story & Title</th>
                  <th className="py-3.5 px-4">Contributor</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Permission</th>
                  <th className="py-3.5 px-4">AI Verification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 text-xs">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-semibold text-ink line-clamp-1">
                          {story.title}
                        </span>
                        {story.collection && (
                          <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-saffron inline-block" />
                            {story.collection.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">
                          {story.contributor.name}
                        </span>
                        <span className="text-[10px] text-muted truncate max-w-[140px]">
                          {story.contributor.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-paper-2 border border-line text-ink">
                        {story.originalLanguage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          story.permission === "PUBLIC"
                            ? "bg-moss/10 text-moss"
                            : story.permission === "RESEARCH_ONLY"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {story.permission}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {story.aiReviewedAt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-moss font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Reviewed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Unreviewed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={story.status} />
                    </td>

                    <td className="py-3.5 px-4 text-muted text-[11px]">
                      {story.submittedAt
                        ? formatDistanceToNow(new Date(story.submittedAt), {
                            addSuffix: true,
                          })
                        : "Draft"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button asChild size="sm" variant="moss" className="text-xs h-8">
                        <Link href={`/admin/stories/${story.id}`}>
                          <span>Review</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-warm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sm text-ink block line-clamp-1">
                      {story.title}
                    </span>
                    <span className="text-xs text-muted">
                      By {story.contributor.name}
                    </span>
                  </div>
                  <StatusBadge status={story.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-line/60">
                  <span className="bg-paper-2 px-2 py-0.5 rounded text-[11px] border border-line">
                    {story.originalLanguage}
                  </span>
                  <span className="text-[11px] text-muted">
                    Tier: <strong>{story.permission}</strong>
                  </span>
                  {story.aiReviewedAt ? (
                    <span className="text-[11px] text-moss font-medium">
                      ✓ AI Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">
                      ⚠ Unreviewed AI
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    {story.submittedAt
                      ? format(new Date(story.submittedAt), "MMM d, yyyy")
                      : "Unsubmitted"}
                  </span>
                  <Button asChild size="sm" variant="moss" className="text-xs h-8">
                    <Link href={`/admin/stories/${story.id}`}>
                      <span>Review Story</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {initialPagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted pt-4">
              <span>
                Showing Page {initialPagination.page} of {initialPagination.totalPages} (
                {initialPagination.total} total stories)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={initialPagination.page <= 1}
                  className="h-8 text-xs border-line bg-white"
                >
                  <Link
                    href={`/admin/moderation?tab=${activeTab}&page=${
                      initialPagination.page - 1
                    }`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={initialPagination.page >= initialPagination.totalPages}
                  className="h-8 text-xs border-line bg-white"
                >
                  <Link
                    href={`/admin/moderation?tab=${activeTab}&page=${
                      initialPagination.page + 1
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
