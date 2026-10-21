import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import {
  SearchFilters,
  SearchResponse,
  SearchResultStory,
} from "./types";
import { calculateStoryScore } from "./ranking";
import { parseNaturalLanguageQuery } from "./natural-language";

export async function searchStories(
  filters: SearchFilters = {}
): Promise<SearchResponse> {
  const {
    q,
    region,
    language,
    themes = [],
    timePeriod,
    topic,
    collection,
    sort = q ? "relevance" : "newest",
    page = 1,
    limit = 12,
  } = filters;

  const skip = (page - 1) * limit;

  // 1. Build base WHERE clause with non-negotiable public filter
  const baseWhere = publicStoryWhere();

  const whereConditions: any = {
    ...baseWhere,
  };

  if (region) {
    whereConditions.region = { contains: region, mode: "insensitive" };
  }

  if (language) {
    whereConditions.originalLanguage = {
      equals: language,
      mode: "insensitive",
    };
  }

  if (themes && themes.length > 0) {
    whereConditions.themes = {
      some: {
        theme: {
          slug: { in: themes },
        },
      },
    };
  }

  if (timePeriod) {
    whereConditions.timePeriodLabel = {
      equals: timePeriod,
      mode: "insensitive",
    };
  }

  if (topic) {
    whereConditions.topic = { contains: topic, mode: "insensitive" };
  }

  if (collection) {
    whereConditions.collection = {
      slug: collection,
    };
  }

  // 2. Query processing
  let cleanTerm = q ? q.trim() : "";
  let parsedNL: ReturnType<typeof parseNaturalLanguageQuery> | undefined;

  if (cleanTerm.length > 0) {
    parsedNL = parseNaturalLanguageQuery(cleanTerm);
    cleanTerm = parsedNL.cleanQuery;

    const terms = cleanTerm.split(/\s+/).filter((t) => t.length > 0);

    // Multi-term ILIKE across title, summary, transcripts, and keywords
    if (terms.length > 0) {
      whereConditions.AND = terms.map((term) => ({
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { summary: { contains: term, mode: "insensitive" } },
          { englishTranslation: { contains: term, mode: "insensitive" } },
          { originalTranscript: { contains: term, mode: "insensitive" } },
          { region: { contains: term, mode: "insensitive" } },
          { topic: { contains: term, mode: "insensitive" } },
          {
            keywords: {
              some: {
                keyword: {
                  normalizedName: { contains: term.toLowerCase() },
                },
              },
            },
          },
        ],
      }));
    }
  }

  try {
    // 3. Query all candidate matching stories
    const candidateStories = await prisma.story.findMany({
      where: whereConditions,
      include: {
        contributor: {
          select: { name: true },
        },
        themes: {
          include: {
            theme: { select: { name: true, slug: true } },
          },
        },
        keywords: {
          include: {
            keyword: { select: { name: true, normalizedName: true } },
          },
        },
      },
      orderBy:
        sort === "newest"
          ? { publishedAt: "desc" }
          : sort === "oldest"
          ? { publishedAt: "asc" }
          : sort === "most_viewed"
          ? { viewCount: "desc" }
          : { publishedAt: "desc" },
    });

    // 4. Calculate weighted scores and extract snippets
    const scoredStories: SearchResultStory[] = candidateStories.map((story) => {
      const scoringInput = {
        title: story.title,
        summary: story.summary,
        englishTranslation: story.englishTranslation,
        originalTranscript: story.originalTranscript,
        region: story.region,
        topic: story.topic,
        keywords: story.keywords.map((k) => k.keyword),
      };

      const scoreResult = calculateStoryScore(scoringInput, cleanTerm || q || "");

      return {
        id: story.id,
        slug: story.slug,
        title: story.title,
        summary: story.summary,
        originalTranscript: story.originalTranscript,
        englishTranslation: story.englishTranslation,
        originalLanguage: story.originalLanguage,
        region: story.region,
        topic: story.topic,
        timePeriodLabel: story.timePeriodLabel,
        timePeriodStart: story.timePeriodStart,
        timePeriodEnd: story.timePeriodEnd,
        audioDurationSec: story.audioDurationSec,
        displayPreference: story.displayPreference,
        isSample: story.isSample,
        publishedAt: story.publishedAt,
        viewCount: story.viewCount,
        contributorName: story.contributor?.name,
        themes: story.themes.map((t) => t.theme),
        keywords: story.keywords.map((k) => k.keyword),
        relevanceScore: scoreResult.score,
        matchedField: scoreResult.matchedField,
        snippet: scoreResult.snippet,
      };
    });

    // 5. Rank by relevance if requested or if search query is present
    if (sort === "relevance" && (cleanTerm || q)) {
      scoredStories.sort(
        (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );
    }

    const totalCount = scoredStories.length;
    const paginatedStories = scoredStories.slice(skip, skip + limit);

    // 6. Log search query in background
    if (q && q.trim().length > 0) {
      prisma.searchLog
        .create({
          data: {
            query: q.trim(),
            filters: JSON.parse(JSON.stringify(filters)),
            resultCount: totalCount,
          },
        })
        .catch((err) => {
          console.warn("[SEARCH LOG ERROR]", err);
        });
    }

    return {
      stories: paginatedStories,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit) || 1,
      appliedFilters: filters,
      parsedQuery: parsedNL,
    };
  } catch (error) {
    console.warn("[SEARCH STORIES DB ERROR]", error);
    return {
      stories: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      appliedFilters: filters,
    };
  }
}
