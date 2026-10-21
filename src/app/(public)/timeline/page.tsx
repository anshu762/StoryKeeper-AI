import * as React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { PageHeader } from "@/components/common/page-header";
import { TimelineView, TimelineStory } from "@/components/timeline/timeline-view";
import { EmptyState } from "@/components/common/empty-state";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Chronological Decade Timeline | StoryKeeper AI",
  description:
    "Journey through community oral histories across decades from the 1940s to the 2000s, tracing migration, heritage crafts, and cultural memories.",
};

export default async function TimelinePage() {
  let stories: TimelineStory[] = [];
  let availableLanguages: string[] = [];
  let availableRegions: string[] = [];

  try {
    const rawStories = await prisma.story.findMany({
      where: publicStoryWhere(),
      orderBy: [
        { timePeriodStart: "asc" },
        { publishedAt: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        originalLanguage: true,
        region: true,
        timePeriodLabel: true,
        timePeriodStart: true,
        audioDurationSec: true,
        displayPreference: true,
        isSample: true,
        contributor: { select: { name: true } },
        themes: {
          select: {
            theme: { select: { name: true, slug: true } },
          },
        },
      },
    });

    stories = rawStories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      originalLanguage: s.originalLanguage,
      region: s.region,
      timePeriodLabel: s.timePeriodLabel,
      timePeriodStart: s.timePeriodStart,
      audioDurationSec: s.audioDurationSec,
      displayPreference: s.displayPreference,
      isSample: s.isSample,
      contributorName: s.contributor?.name,
      themes: s.themes.map((t) => t.theme),
    }));

    const langSet = new Set<string>();
    const regionSet = new Set<string>();

    stories.forEach((s) => {
      if (s.originalLanguage) langSet.add(s.originalLanguage);
      if (s.region) regionSet.add(s.region);
    });

    availableLanguages = Array.from(langSet).sort();
    availableRegions = Array.from(regionSet).sort();
  } catch (error) {
    console.warn("[TIMELINE PAGE DB ERROR]", error);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      <PageHeader
        eyebrow="Living History"
        title="Decade Timeline"
        description="Explore how oral traditions, regional languages, and community memories evolved from the 1940s through the modern era."
      />

      <div className="mt-10">
        {stories.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No timeline records found"
            description="Oral histories are being dated and cataloged. Check back soon or visit the full archive."
            actionLabel="Browse Full Archive"
            actionHref="/archive"
            className="bg-paper-2/40 border border-line rounded-2xl py-16"
          />
        ) : (
          <TimelineView
            stories={stories}
            availableLanguages={availableLanguages}
            availableRegions={availableRegions}
          />
        )}
      </div>
    </div>
  );
}
