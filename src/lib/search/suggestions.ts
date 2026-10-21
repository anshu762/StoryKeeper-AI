import { prisma } from "@/lib/db";
import { SearchSuggestion } from "./types";

export async function getSearchSuggestions(
  query: string,
  limit = 8
): Promise<SearchSuggestion[]> {
  const term = query.trim().toLowerCase();
  if (!term || term.length < 2) return [];

  try {
    const [keywords, themes, collections, regions] = await Promise.all([
      prisma.keyword.findMany({
        where: {
          normalizedName: { contains: term },
        },
        select: { name: true, normalizedName: true },
        take: 4,
      }),
      prisma.theme.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term } },
          ],
        },
        select: { name: true, slug: true },
        take: 3,
      }),
      prisma.collection.findMany({
        where: {
          status: "ACTIVE",
          name: { contains: term, mode: "insensitive" },
        },
        select: { name: true, slug: true },
        take: 2,
      }),
      prisma.story.findMany({
        where: {
          status: "PUBLISHED",
          permission: "PUBLIC",
          deletedAt: null,
          region: { contains: term, mode: "insensitive" },
        },
        select: { region: true },
        distinct: ["region"],
        take: 3,
      }),
    ]);

    const suggestions: SearchSuggestion[] = [];

    for (const kw of keywords) {
      suggestions.push({
        text: kw.name,
        type: "keyword",
      });
    }

    for (const t of themes) {
      suggestions.push({
        text: t.name,
        type: "theme",
        slug: t.slug,
      });
    }

    for (const c of collections) {
      suggestions.push({
        text: c.name,
        type: "collection",
        slug: c.slug,
      });
    }

    for (const r of regions) {
      if (r.region) {
        suggestions.push({
          text: r.region,
          type: "region",
        });
      }
    }

    return suggestions.slice(0, limit);
  } catch (err) {
    console.warn("[SEARCH SUGGESTIONS ERROR]", err);
    return [];
  }
}
