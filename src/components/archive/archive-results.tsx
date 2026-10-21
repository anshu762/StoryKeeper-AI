"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { StoryCard } from "@/components/story/story-card";
import { StoryListItem } from "@/components/archive/story-list-item";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { ArchiveFilters } from "@/components/archive/archive-filters";
import { ArchiveFacets } from "@/lib/search/facets";
import { SearchFilters, SearchResultStory } from "@/lib/search/types";

interface ArchiveResultsProps {
  facets: ArchiveFacets;
  stories: SearchResultStory[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  appliedFilters: SearchFilters;
}

export function ArchiveResults({
  facets,
  stories,
  totalCount,
  currentPage,
  totalPages,
  appliedFilters,
}: ArchiveResultsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <ArchiveFilters
        facets={facets}
        appliedFilters={appliedFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
      />

      {/* Results Content */}
      {stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories match your criteria"
          description="Try broadening your filters or clearing keyword searches to discover oral histories from our contributors."
          actionLabel="Clear all filters"
          onAction={() => router.push(pathname)}
          className="bg-paper-2/40 border border-line rounded-2xl py-16"
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    id={story.id}
                    slug={story.slug}
                    title={story.title}
                    summary={story.summary}
                    originalTranscript={story.originalTranscript}
                    originalLanguage={story.originalLanguage}
                    region={story.region}
                    timePeriodLabel={story.timePeriodLabel}
                    audioDurationSec={story.audioDurationSec}
                    displayPreference={story.displayPreference}
                    contributorName={story.contributorName}
                    isSample={story.isSample}
                    themes={story.themes}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <StoryListItem key={story.id} story={story} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 pb-4 flex items-center justify-between border-t border-line">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="border-line text-xs gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-paper hover:bg-paper-2 border border-line text-ink"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="border-line text-xs gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
