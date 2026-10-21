import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Search, BookOpen, Compass, ArrowRight } from "lucide-react";
import { searchStories } from "@/lib/search";
import { SearchFilters, StorySortOption } from "@/lib/search/types";
import { SearchInputBar } from "@/components/search/search-input-bar";
import { SearchResultCard } from "@/components/search/search-result-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Search the Archive | StoryKeeper AI",
  description:
    "Search oral histories by keywords, natural language questions, regions, and folk themes with contextual snippet highlighting.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SAMPLE_SEARCHES = [
  "Harvest festivals",
  "Partition memories",
  "Clay pottery tradition",
  "Spices and grandmother recipes",
  "Folk songs of monsoon",
  "Migration across rivers",
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
  const sort =
    typeof resolvedParams.sort === "string"
      ? (resolvedParams.sort as StorySortOption)
      : q
      ? "relevance"
      : "newest";
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
    sort,
    page,
    limit: 15,
  };

  const hasSearched = Boolean(q && q.trim().length > 0);
  const searchResult = hasSearched
    ? await searchStories(appliedFilters)
    : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
      <PageHeader
        eyebrow="Search Engine"
        title="Search the Oral Archive"
        description="Search across original recordings, verified transcripts, and English translations with weighted relevance."
      />

      {/* Prominent Search Bar */}
      <div className="mt-8 mb-6">
        <SearchInputBar initialQuery={q || ""} autoFocus={!hasSearched} />

        {/* Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            Try searching:
          </span>
          {SAMPLE_SEARCHES.map((sample) => (
            <Link
              key={sample}
              href={`/search?q=${encodeURIComponent(sample)}`}
              className="text-xs px-2.5 py-1 rounded-full bg-paper-2 hover:bg-paper-2/80 border border-line text-ink transition-colors hover:border-terracotta/40"
            >
              {sample}
            </Link>
          ))}
        </div>
      </div>

      {/* Natural Language Intent Banner */}
      {searchResult?.parsedQuery && (
        <div className="my-6 p-4 rounded-xl bg-saffron/10 border border-saffron/30 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <div className="text-xs text-ink/80 space-y-1">
            <span className="font-semibold text-ink">
              Archive Query Analysis:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {searchResult.parsedQuery.extractedThemes.length > 0 && (
                <span className="text-muted-foreground">
                  Themes:{" "}
                  <strong className="text-ink">
                    {searchResult.parsedQuery.extractedThemes.join(", ")}
                  </strong>
                </span>
              )}
              {searchResult.parsedQuery.extractedRegion && (
                <span className="text-muted-foreground">
                  Region:{" "}
                  <strong className="text-ink">
                    {searchResult.parsedQuery.extractedRegion}
                  </strong>
                </span>
              )}
              {searchResult.parsedQuery.extractedTimePeriod && (
                <span className="text-muted-foreground">
                  Era:{" "}
                  <strong className="text-ink">
                    {searchResult.parsedQuery.extractedTimePeriod}
                  </strong>
                </span>
              )}
              {searchResult.parsedQuery.cleanQuery && (
                <span className="text-muted-foreground">
                  Keywords: &ldquo;{searchResult.parsedQuery.cleanQuery}&rdquo;
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {hasSearched && searchResult && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="text-sm font-medium text-ink">
              Found{" "}
              <span className="font-bold text-terracotta">
                {searchResult.totalCount}
              </span>{" "}
              {searchResult.totalCount === 1 ? "story" : "stories"} matching &ldquo;
              {q}&rdquo;
            </p>
            <Link
              href={`/archive?q=${encodeURIComponent(q || "")}`}
              className="text-xs text-terracotta hover:underline inline-flex items-center gap-1 font-medium"
            >
              Filter in full archive
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {searchResult.stories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={`No stories found for "${q}"`}
              description="We couldn't find an exact match in our transcripts or metadata. Try searching for related cultural keywords, folk traditions, or broader region names."
              actionLabel="Explore All Stories"
              actionHref="/archive"
              className="bg-paper-2/40 border border-line rounded-2xl py-14"
            />
          ) : (
            <div className="space-y-4">
              {searchResult.stories.map((story) => (
                <SearchResultCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discovery guide when no search has been initiated */}
      {!hasSearched && (
        <div className="mt-12 pt-8 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-paper-2/40 border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center font-serif text-lg font-bold">
              1
            </div>
            <h3 className="font-serif font-medium text-ink text-lg">
              Trigram Weighted Search
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stories are indexed across titles, keywords, summaries, regional dialects, and full English translations for high relevance.
            </p>
          </div>

          <div className="bg-paper-2/40 border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-moss/10 text-moss flex items-center justify-center font-serif text-lg font-bold">
              2
            </div>
            <h3 className="font-serif font-medium text-ink text-lg">
              Ask The Archive
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use natural phrases like &ldquo;stories about migration in the 1970s&rdquo; to automatically detect matching eras, regions, and themes.
            </p>
          </div>

          <div className="bg-paper-2/40 border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center font-serif text-lg font-bold">
              3
            </div>
            <h3 className="font-serif font-medium text-ink text-lg">
              Strict Consent Guarantee
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All search results strictly adhere to contributor consent policies. Private and research-only records are never exposed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
