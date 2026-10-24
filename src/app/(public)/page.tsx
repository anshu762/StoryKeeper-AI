import React from "react";
import Link from "next/link";
import { Mic, Search, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { HeroSection } from "@/components/landing/hero-section";
import { LanguageMarquee } from "@/components/landing/language-marquee";
import { StatsStrip } from "@/components/landing/stats-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MagicDemo } from "@/components/landing/magic-demo";
import { CollectionsCarousel } from "@/components/landing/collections-carousel";
import { EthicsPromise } from "@/components/landing/ethics-promise";
import { VoicesQuoteBand } from "@/components/landing/voices-quote-band";
import { SectionHeading } from "@/components/common/section-heading";
import { StoryCard } from "@/components/story/story-card";

export default async function HomePage() {
  let publicStories: any[] = [];
  let collections: any[] = [];
  let storyCount = 14;
  let languageCount = 7;
  let regionCount = 12;
  let totalHours = 8;

  try {
    const [storiesData, collectionsData, statsData] = await Promise.all([
      prisma.story.findMany({
        where: publicStoryWhere(),
        include: {
          contributor: { select: { name: true } },
          themes: { include: { theme: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),
      prisma.collection.findMany({
        where: { status: "ACTIVE" },
        include: {
          _count: {
            select: { stories: { where: publicStoryWhere() } },
          },
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.story.findMany({
        where: publicStoryWhere(),
        select: {
          originalLanguage: true,
          region: true,
          audioDurationSec: true,
        },
      }),
    ]);

    publicStories = storiesData;
    collections = collectionsData;

    if (statsData.length > 0) {
      storyCount = statsData.length;
      languageCount = new Set(statsData.map((s) => s.originalLanguage)).size;
      regionCount = new Set(statsData.map((s) => s.region).filter(Boolean)).size;
      const totalSeconds = statsData.reduce(
        (acc, s) => acc + (s.audioDurationSec || 0),
        0
      );
      totalHours = Math.max(1, Math.round(totalSeconds / 3600));
    }
  } catch (error) {
    console.warn("[HOMEPAGE DB WARNING] Using fallback data:", error);
  }

  // Fallback collections if DB not populated yet
  const displayCollections =
    collections.length > 0
      ? collections.map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
          coverGradient: c.coverGradient,
          motif: c.motif,
          storyCount: c._count?.stories || 0,
        }))
      : [
          {
            slug: "grandmothers-kitchen",
            name: "Grandmothers' Kitchen",
            description: "Heirloom recipes, earthen stove memories, and food traditions passed down through spoken instruction.",
            coverGradient: "saffron-terracotta",
            motif: "wheat-spice",
            storyCount: 4,
          },
          {
            slug: "vanishing-professions",
            name: "Vanishing Professions",
            description: "Blacksmiths, water carriers, handloom weavers, and folk singers whose work is disappearing into history.",
            coverGradient: "ink-moss",
            motif: "loom-tools",
            storyCount: 3,
          },
          {
            slug: "partition-memories",
            name: "Partition Memories",
            description: "Personal recollections of displacement, shared neighborhoods, and cross-border nostalgia.",
            coverGradient: "plum-terracotta",
            motif: "railway-border",
            storyCount: 3,
          },
          {
            slug: "festival-stories",
            name: "Festival Stories",
            description: "Oral accounts of village carnivals, monsoon fairs, and forgotten regional celebrations.",
            coverGradient: "saffron-plum",
            motif: "diya-flame",
            storyCount: 2,
          },
        ];

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Language Marquee */}
      <LanguageMarquee />

      {/* 3. Animated Stats Strip */}
      <StatsStrip
        storyCount={storyCount}
        languageCount={languageCount}
        regionCount={regionCount}
        hoursCount={totalHours}
      />

      {/* 4. How It Works Timeline */}
      <HowItWorks />

      {/* 5. Interactive "See the Magic" Demo */}
      <MagicDemo />

      {/* 6. Featured Collections Carousel */}
      <CollectionsCarousel collections={displayCollections} />

      {/* 7. Featured Stories Grid */}
      <section className="py-20 sm:py-28 border-b border-line bg-paper">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Archival Voices"
            title="Recently Preserved Stories"
            description="Listen to verified oral narratives transcribed in original scripts and translated with cultural context."
            action={
              <Button asChild variant="ghost" className="text-terracotta gap-1.5">
                <Link href="/archive">
                  <span>Browse All Stories</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicStories.length > 0 ? (
              publicStories.map((story) => (
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
                  contributorName={story.contributor?.name}
                  isSample={story.isSample}
                  status={story.status}
                  themes={story.themes.map((t: any) => ({
                    name: t.theme.name,
                    slug: t.theme.slug,
                  }))}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 rounded-3xl border border-dashed border-line bg-white/40">
                <p className="font-serif text-lg text-ink">
                  Stories will appear here once the database is populated via seed.
                </p>
                <div className="pt-4">
                  <Button asChild variant="default">
                    <Link href="/archive">Open Archive Explorer</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. Ethics Promise */}
      <EthicsPromise />

      {/* 9. Voices & Quotes Rotating Band */}
      <VoicesQuoteBand />

      {/* 10. Final Call to Action Band */}
      <section className="py-20 sm:py-28 bg-paper text-center">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Join the Community Preservation Trust
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-ink leading-tight">
            Whose voice will disappear <br className="hidden sm:inline" />
            if you don’t record it today?
          </h2>

          <p className="text-sm sm:text-lg text-muted max-w-xl mx-auto leading-relaxed font-sans">
            It takes just 5 minutes to record a grandmother’s recipe, a village song,
            or a memory of migration. Free, ethical, and protected forever.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Button asChild size="lg" className="rounded-2xl gap-2 shadow-warm justify-center">
              <Link href="/dashboard/stories/new">
                <Mic className="h-4 w-4" />
                <span>Start Recording Now</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl gap-2 bg-white/70 justify-center">
              <Link href="/archive">
                <Search className="h-4 w-4" />
                <span>Explore the Catalog</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
