import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Layers, BookOpen, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { StoryCard } from "@/components/story/story-card";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const col = await prisma.collection.findUnique({
      where: { slug, status: "ACTIVE" },
      select: { name: true, description: true },
    });

    if (!col) return { title: "Collection Not Found | StoryKeeper AI" };

    return {
      title: `${col.name} | Curated Collection | StoryKeeper AI`,
      description: col.description,
    };
  } catch {
    return { title: "Curated Collection | StoryKeeper AI" };
  }
}

// Background motif helper
function CollectionHeroPattern({ motif }: { motif: string }) {
  switch (motif) {
    case "wheat-spice":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-wheat"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="24" cy="24" r="4" fill="#FFF" />
              <path
                d="M24 6 Q32 20 24 34 Q16 20 24 6"
                fill="none"
                stroke="#FFF"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-wheat)" />
        </svg>
      );
    case "loom-tools":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-loom"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 24 L48 24 M24 0 L24 48"
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <circle cx="24" cy="24" r="3" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-loom)" />
        </svg>
      );
    default:
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-default"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-default)" />
        </svg>
      );
  }
}

const GRADIENT_MAP: Record<string, string> = {
  terracotta_saffron: "from-terracotta via-[#D47148] to-saffron",
  moss_sand: "from-moss via-[#5C7D64] to-[#B39356]",
  plum_terracotta: "from-plum via-[#8E445F] to-terracotta",
  saffron_moss: "from-saffron via-[#A29A46] to-moss",
  ink_plum: "from-ink via-[#45283C] to-plum",
};

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;

  const collection = await prisma.collection.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      stories: {
        where: publicStoryWhere(),
        orderBy: { publishedAt: "desc" },
        include: {
          contributor: { select: { name: true } },
          themes: { include: { theme: true } },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const gradientClass =
    GRADIENT_MAP[collection.coverGradient] ||
    "from-terracotta via-[#D47148] to-saffron";

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-line bg-paper-2/40">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl flex items-center justify-between">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Collections
          </Link>
          <Link
            href={`/archive?collection=${collection.slug}`}
            className="text-xs text-terracotta hover:underline font-medium"
          >
            Open in Archive Explorer →
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 max-w-7xl space-y-12">
        {/* Curated Collection Hero Banner */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-white bg-gradient-to-br ${gradientClass} shadow-warm-lg`}
        >
          <CollectionHeroPattern motif={collection.motif} />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Curated Exhibition • {collection.stories.length} {collection.stories.length === 1 ? "Story" : "Stories"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-tight">
              {collection.name}
            </h1>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans max-w-2xl">
              {collection.description}
            </p>

            <div className="pt-2 text-xs text-white/75 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-saffron" />
              <span>
                Curated by community archivists to preserve intergenerational memory.
              </span>
            </div>
          </div>
        </div>

        {/* Stories in this Collection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-serif text-2xl font-medium text-ink">
                Stories in this Collection
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                All recordings have been verified and published with contributor permission.
              </p>
            </div>
          </div>

          {collection.stories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No stories added yet"
              description="New stories are currently in review for this exhibition. Explore our other collections in the meantime."
              actionLabel="Browse Other Collections"
              actionHref="/collections"
              className="bg-paper-2/40 border border-line rounded-2xl py-14"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.stories.map((story) => (
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
                  themes={story.themes.map((t) => t.theme)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
