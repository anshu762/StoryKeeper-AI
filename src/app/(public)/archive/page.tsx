import * as React from "react";
import { Metadata } from "next";
import { getArchiveFacets } from "@/lib/search/facets";
import { searchStories } from "@/lib/search";
import { SearchFilters, StorySortOption } from "@/lib/search/types";
import { PageHeader } from "@/components/common/page-header";
import { ArchiveSidebar } from "@/components/archive/archive-filters";
import { ArchiveResults } from "@/components/archive/archive-results";

export const metadata: Metadata = {
  title: "Browse Oral History Archive | StoryKeeper AI",
  description:
    "Explore community memories, cultural wisdom, folk traditions, and first-person stories preserved in original languages with English translations.",
};

interface ArchivePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const resolvedParams = await searchParams;

  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const region =
    typeof resolvedParams.region === "string" ? resolvedParams.region : undefined;
  const language =
    typeof resolvedParams.language === "string"
      ? resolvedParams.language
      : undefined;

  let themes: string[] = [];
  if (Array.isArray(resolvedParams.theme)) {
    themes = resolvedParams.theme.filter(Boolean);
  } else if (typeof resolvedParams.theme === "string") {
    themes = [resolvedParams.theme];
  }

  const timePeriod =
    typeof resolvedParams.timePeriod === "string"
      ? resolvedParams.timePeriod
      : undefined;
  const topic =
    typeof resolvedParams.topic === "string" ? resolvedParams.topic : undefined;
  const collection =
    typeof resolvedParams.collection === "string"
      ? resolvedParams.collection
      : undefined;
  const sort =
    typeof resolvedParams.sort === "string"
      ? (resolvedParams.sort as StorySortOption)
      : undefined;
  const page =
    typeof resolvedParams.page === "string"
      ? Math.max(1, parseInt(resolvedParams.page, 10) || 1)
      : 1;

  const appliedFilters: SearchFilters = {
    q,
    region,
    language,
    themes,
    timePeriod,
    topic,
    collection,
    sort,
    page,
    limit: 12,
  };

  const [facets, searchResult] = await Promise.all([
    getArchiveFacets(),
    searchStories(appliedFilters),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      <PageHeader
        eyebrow="Digital Repository"
        title="Oral History Archive"
        description="Search and listen to firsthand recollections, local traditions, and cultural heritage recorded across diverse languages and communities."
      />

      <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar (1 column) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <ArchiveSidebar facets={facets} appliedFilters={appliedFilters} />
        </div>

        {/* Results Area (3 columns) */}
        <div className="lg:col-span-3">
          <ArchiveResults
            facets={facets}
            stories={searchResult.stories}
            totalCount={searchResult.totalCount}
            currentPage={searchResult.currentPage}
            totalPages={searchResult.totalPages}
            appliedFilters={appliedFilters}
          />
        </div>
      </div>
    </div>
  );
}
