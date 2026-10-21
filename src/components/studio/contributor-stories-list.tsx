"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Mic,
  Clock,
  Sparkles,
  ArrowRight,
  Edit3,
  Eye,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, StoryStatusType } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatDuration } from "@/lib/utils";
import { format } from "date-fns";

export interface DashboardStoryItem {
  id: string;
  slug: string;
  title: string;
  status: StoryStatusType;
  permission: string;
  originalLanguage: string;
  audioDurationSec: number | null;
  createdAt: Date;
  updatedAt: Date;
  themes: Array<{ theme: { name: string; slug: string } }>;
}

interface ContributorStoriesListProps {
  stories: DashboardStoryItem[];
}

const TABS = [
  { key: "all", label: "All Stories" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PROCESSING", label: "Processing" },
  { key: "NEEDS_REVIEW", label: "Needs Review" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "PUBLISHED", label: "Published" },
  { key: "REJECTED", label: "Changes Requested" },
];

export function ContributorStoriesList({ stories }: ContributorStoriesListProps) {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = stories.filter((story) => {
    // Tab filter
    if (selectedTab !== "all" && story.status !== selectedTab) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = story.title.toLowerCase().includes(q);
      const matchLang = story.originalLanguage.toLowerCase().includes(q);
      const matchTheme = story.themes.some((t) =>
        t.theme.name.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchLang && !matchTheme) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within your stories..."
            className="pl-9 bg-paper border-line text-sm"
          />
        </div>

        {/* Action Button */}
        <Button asChild className="bg-terracotta hover:bg-terracotta/90 text-white shrink-0 text-xs gap-1.5 shadow-sm">
          <Link href="/dashboard/stories/new">
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Story</span>
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line overflow-x-auto pb-0.5 gap-1">
        {TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? stories.length
              : stories.filter((s) => s.status === tab.key).length;

          const isActive = selectedTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`px-3.5 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-paper border-t border-x border-line text-terracotta font-semibold"
                  : "text-muted-foreground hover:text-ink hover:bg-paper-2/50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-terracotta/10 text-terracotta"
                    : "bg-paper-2 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stories Listing */}
      {filteredStories.length === 0 ? (
        <EmptyState
          icon={<Mic className="w-6 h-6 stroke-[1.5]" />}
          title={
            searchQuery
              ? "No stories match your search"
              : selectedTab === "DRAFT"
              ? "No drafts in progress"
              : selectedTab === "PROCESSING"
              ? "No stories currently processing"
              : selectedTab === "NEEDS_REVIEW"
              ? "No stories awaiting review"
              : selectedTab === "SUBMITTED"
              ? "No stories currently submitted"
              : selectedTab === "PUBLISHED"
              ? "No published stories yet"
              : "No stories recorded yet"
          }
          description="Start a new oral recording to transcribe, translate, and preserve a living memory."
          actionLabel="Record or Add Story"
          actionHref="/dashboard/stories/new"
          className="bg-paper-2/40 border border-line rounded-2xl py-14"
        />
      ) : (
        <div className="space-y-3">
          {filteredStories.map((story) => (
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
                    <span>View Status</span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
