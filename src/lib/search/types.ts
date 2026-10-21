export type StorySortOption =
  | "relevance"
  | "newest"
  | "oldest"
  | "most_viewed";

export interface SearchFilters {
  q?: string;
  region?: string;
  language?: string;
  themes?: string[];
  timePeriod?: string;
  topic?: string;
  collection?: string;
  sort?: StorySortOption;
  page?: number;
  limit?: number;
}

export type MatchedFieldType =
  | "title"
  | "keywords"
  | "summary"
  | "translation"
  | "transcript"
  | "region"
  | "topic";

export interface SearchResultStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  originalTranscript: string;
  englishTranslation: string;
  originalLanguage: string;
  region: string | null;
  topic: string | null;
  timePeriodLabel: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  audioDurationSec: number | null;
  displayPreference: "NAMED" | "ANONYMOUS";
  isSample: boolean;
  publishedAt: Date | null;
  viewCount: number;
  contributorName?: string;
  themes: Array<{ name: string; slug: string }>;
  keywords: Array<{ name: string; normalizedName: string }>;
  relevanceScore?: number;
  matchedField?: MatchedFieldType;
  snippet?: string;
}

export interface SearchResponse {
  stories: SearchResultStory[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  appliedFilters: SearchFilters;
  parsedQuery?: {
    originalQuery: string;
    extractedThemes: string[];
    extractedRegion?: string;
    extractedLanguage?: string;
    extractedTimePeriod?: string;
    cleanQuery: string;
  };
}

export interface SearchSuggestion {
  text: string;
  type: "keyword" | "theme" | "region" | "collection" | "story";
  count?: number;
  slug?: string;
}
