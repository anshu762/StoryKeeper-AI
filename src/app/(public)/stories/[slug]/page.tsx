import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Info,
  ChevronLeft,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { getSignedDownloadUrl } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { WavesurferPlayer } from "@/components/story/wavesurfer-player";
import { StoryTabs } from "@/components/story/story-tabs";
import { StoryActions } from "@/components/story/story-actions";
import { StoryViewTracker } from "@/components/story/view-tracker";
import { StoryCard } from "@/components/story/story-card";
import { formatDuration } from "@/lib/utils";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const story = await prisma.story.findFirst({
      where: {
        slug,
        ...publicStoryWhere(),
      },
      select: {
        title: true,
        summary: true,
        originalLanguage: true,
      },
    });

    if (!story) {
      return {
        title: "Story Not Found | StoryKeeper AI",
      };
    }

    return {
      title: `${story.title} | StoryKeeper AI`,
      description: story.summary,
      openGraph: {
        title: story.title,
        description: story.summary,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Oral History | StoryKeeper AI",
    };
  }
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { slug } = await params;

  // Strict non-negotiable public filter
  const story = await prisma.story.findFirst({
    where: {
      slug,
      ...publicStoryWhere(),
    },
    include: {
      contributor: {
        select: {
          id: true,
          name: true,
        },
      },
      collection: true,
      themes: {
        include: {
          theme: true,
        },
      },
      keywords: {
        include: {
          keyword: true,
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  // Related stories query (strict public filter, excluding current story)
  const themeIds = story.themes.map((t) => t.themeId);
  const relatedStories = await prisma.story.findMany({
    where: {
      id: { not: story.id },
      ...publicStoryWhere(),
      OR: [
        ...(themeIds.length > 0
          ? [
              {
                themes: {
                  some: {
                    themeId: { in: themeIds },
                  },
                },
              },
            ]
          : []),
        ...(story.region ? [{ region: story.region }] : []),
      ],
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: {
      contributor: { select: { name: true } },
      themes: { include: { theme: true } },
    },
  });

  const contributorName =
    story.displayPreference === "ANONYMOUS" || !story.contributor?.name
      ? "Anonymous Contributor"
      : story.contributor.name;

  // Audio source: resolve signed URL from storage key, with sample fallback
  let audioUrl = "/samples/sample.mp3";
  if (story.audioKey) {
    try {
      audioUrl = await getSignedDownloadUrl(story.audioKey, 3600);
    } catch {
      audioUrl = "/samples/sample.mp3";
    }
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* Deduplicated View Tracker */}
      <StoryViewTracker slug={story.slug} />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-line bg-paper-2/40">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-5xl flex items-center justify-between">
          <Link
            href="/archive"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Archive
          </Link>

          <StoryActions
            slug={story.slug}
            title={story.title}
            contributorId={story.contributorId}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 max-w-5xl space-y-10">
        {/* Story Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {story.originalLanguage}
            </Badge>
            {story.timePeriodLabel && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {story.timePeriodLabel}
              </Badge>
            )}
            {story.isSample && <SampleBadge />}
            {story.collection && (
              <Link
                href={`/collections/${story.collection.slug}`}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-saffron/15 text-ink hover:bg-saffron/25 transition-colors border border-saffron/30"
              >
                <Layers className="w-3 h-3 text-terracotta" />
                <span>{story.collection.name}</span>
              </Link>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-ink leading-tight">
            {story.title}
          </h1>

          {/* Metadata Meta-strip */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-muted-foreground pt-1">
            <span className="font-medium text-ink">
              Recorded by {contributorName}
            </span>
            {story.region && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  {story.region}
                </span>
              </>
            )}
            {story.publishedAt && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Preserved {format(new Date(story.publishedAt), "MMMM d, yyyy")}
                </span>
              </>
            )}
            {story.audioDurationSec && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDuration(story.audioDurationSec)} audio
                </span>
              </>
            )}
          </div>
        </header>

        {/* Accessible Waveform Audio Player */}
        <section aria-label="Audio Recording">
          <WavesurferPlayer
            audioUrl={audioUrl}
            title={story.title}
            durationSec={story.audioDurationSec}
            sticky={false}
          />
        </section>

        {/* Story Transcript & Translation Tabs */}
        <section aria-label="Story Transcripts">
          <StoryTabs
            originalTranscript={story.originalTranscript}
            englishTranslation={story.englishTranslation}
            summary={story.summary}
            originalLanguage={story.originalLanguage}
            transcriptAi={story.transcriptAi}
            translationAi={story.translationAi}
            summaryAi={story.summaryAi}
            aiReviewedAt={story.aiReviewedAt}
          />
        </section>

        {/* Ethics & Oral History Disclaimer */}
        <section className="rounded-2xl border border-line bg-paper-2/40 p-4 sm:p-5 flex items-start gap-3.5 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-ink">
              Oral History Preservation Notice
            </p>
            <p className="leading-relaxed">
              Stories represent personal memories and community histories, not verified historical facts. This recording was contributed under ethical community consent guidelines.
            </p>
          </div>
        </section>

        {/* Metadata, Themes & Keywords Block */}
        <section className="rounded-3xl border border-line bg-white/80 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-lg sm:text-xl font-medium text-ink">
            Archive Indexing & Tags
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Themes */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-moss" />
                Community Themes
              </span>
              <div className="flex flex-wrap gap-2">
                {story.themes.map((t) => (
                  <Link
                    key={t.theme.slug}
                    href={`/archive?theme=${t.theme.slug}`}
                    className="text-xs px-3 py-1 rounded-full bg-paper-2 hover:bg-moss/20 text-ink font-medium border border-line hover:border-moss/40 transition-colors"
                  >
                    #{t.theme.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-terracotta" />
                Indexed Keywords
              </span>
              <div className="flex flex-wrap gap-2">
                {story.keywords.map((k) => (
                  <Link
                    key={k.keyword.normalizedName}
                    href={`/search?q=${encodeURIComponent(k.keyword.name)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-paper hover:bg-paper-2 text-muted-foreground hover:text-ink border border-line transition-colors"
                  >
                    {k.keyword.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="pt-6 border-t border-line space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium text-ink">
                  Related Oral Histories
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stories sharing cultural themes, regional proximity, or eras.
                </p>
              </div>
              <Link
                href="/archive"
                className="text-xs text-terracotta hover:underline font-medium"
              >
                View all in archive →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedStories.map((rel) => (
                <StoryCard
                  key={rel.id}
                  id={rel.id}
                  slug={rel.slug}
                  title={rel.title}
                  summary={rel.summary}
                  originalTranscript={rel.originalTranscript}
                  originalLanguage={rel.originalLanguage}
                  region={rel.region}
                  timePeriodLabel={rel.timePeriodLabel}
                  audioDurationSec={rel.audioDurationSec}
                  displayPreference={rel.displayPreference}
                  contributorName={rel.contributor?.name}
                  isSample={rel.isSample}
                  themes={rel.themes.map((t) => t.theme)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
