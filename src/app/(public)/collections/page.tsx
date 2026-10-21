import * as React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { PageHeader } from "@/components/common/page-header";
import { CollectionCard } from "@/components/collection/collection-card";
import { EmptyState } from "@/components/common/empty-state";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Curated Collections | StoryKeeper AI",
  description:
    "Explore thematic collections of oral histories, traditional crafts, seasonal recipes, and community memories preserved across generations.",
};

export default async function CollectionsPage() {
  let collectionsWithCounts: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    coverGradient: string;
    motif: string;
    storyCount: number;
  }> = [];

  try {
    const activeCollections = await prisma.collection.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        stories: {
          where: publicStoryWhere(),
          select: { id: true },
        },
      },
    });

    collectionsWithCounts = activeCollections.map((col) => ({
      id: col.id,
      slug: col.slug,
      name: col.name,
      description: col.description,
      coverGradient: col.coverGradient,
      motif: col.motif,
      storyCount: col.stories.length,
    }));
  } catch (error) {
    console.warn("[COLLECTIONS PAGE DB ERROR]", error);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      <PageHeader
        eyebrow="Curated Archives"
        title="Thematic Collections"
        description="Thoughtfully organized exhibitions uniting oral histories around enduring community traditions, culinary heritages, seasonal rites, and migrations."
      />

      {collectionsWithCounts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No collections published yet"
          description="Curated collections are being assembled by our community organizers. Check back soon or browse the full archive."
          actionLabel="Explore All Stories"
          actionHref="/archive"
          className="mt-12 bg-paper-2/40 border border-line rounded-2xl py-16"
        />
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {collectionsWithCounts.map((col) => (
            <CollectionCard
              key={col.id}
              slug={col.slug}
              name={col.name}
              description={col.description}
              coverGradient={col.coverGradient}
              motif={col.motif}
              storyCount={col.storyCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
