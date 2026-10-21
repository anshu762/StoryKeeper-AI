import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";

export interface FacetOption {
  label: string;
  value: string;
  count: number;
}

export interface ArchiveFacets {
  languages: FacetOption[];
  regions: FacetOption[];
  themes: FacetOption[];
  timePeriods: FacetOption[];
  topics: FacetOption[];
  collections: FacetOption[];
}

export async function getArchiveFacets(): Promise<ArchiveFacets> {
  const where = publicStoryWhere();

  try {
    const stories = await prisma.story.findMany({
      where,
      select: {
        originalLanguage: true,
        region: true,
        topic: true,
        timePeriodLabel: true,
        collection: {
          select: {
            name: true,
            slug: true,
          },
        },
        themes: {
          select: {
            theme: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const langMap = new Map<string, number>();
    const regionMap = new Map<string, number>();
    const topicMap = new Map<string, number>();
    const timePeriodMap = new Map<string, number>();
    const collectionMap = new Map<string, { label: string; count: number }>();
    const themeMap = new Map<string, { label: string; count: number }>();

    for (const story of stories) {
      if (story.originalLanguage) {
        langMap.set(
          story.originalLanguage,
          (langMap.get(story.originalLanguage) || 0) + 1
        );
      }
      if (story.region) {
        regionMap.set(story.region, (regionMap.get(story.region) || 0) + 1);
      }
      if (story.topic) {
        topicMap.set(story.topic, (topicMap.get(story.topic) || 0) + 1);
      }
      if (story.timePeriodLabel) {
        timePeriodMap.set(
          story.timePeriodLabel,
          (timePeriodMap.get(story.timePeriodLabel) || 0) + 1
        );
      }
      if (story.collection) {
        const curr = collectionMap.get(story.collection.slug) || {
          label: story.collection.name,
          count: 0,
        };
        curr.count += 1;
        collectionMap.set(story.collection.slug, curr);
      }
      if (story.themes) {
        for (const st of story.themes) {
          const curr = themeMap.get(st.theme.slug) || {
            label: st.theme.name,
            count: 0,
          };
          curr.count += 1;
          themeMap.set(st.theme.slug, curr);
        }
      }
    }

    const languages: FacetOption[] = Array.from(langMap.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const regions: FacetOption[] = Array.from(regionMap.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const topics: FacetOption[] = Array.from(topicMap.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const timePeriods: FacetOption[] = Array.from(timePeriodMap.entries())
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const collections: FacetOption[] = Array.from(collectionMap.entries())
      .map(([value, { label, count }]) => ({ label, value, count }))
      .sort((a, b) => b.count - a.count);

    const themes: FacetOption[] = Array.from(themeMap.entries())
      .map(([value, { label, count }]) => ({ label, value, count }))
      .sort((a, b) => b.count - a.count);

    return {
      languages,
      regions,
      themes,
      timePeriods,
      topics,
      collections,
    };
  } catch (error) {
    console.warn("[GET ARCHIVE FACETS ERROR]", error);
    return {
      languages: [],
      regions: [],
      themes: [],
      timePeriods: [],
      topics: [],
      collections: [],
    };
  }
}
