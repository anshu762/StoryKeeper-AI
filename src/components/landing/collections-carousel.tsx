"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionCard, CollectionCardProps } from "@/components/collection/collection-card";
import { SectionHeading } from "@/components/common/section-heading";

interface CollectionsCarouselProps {
  collections: CollectionCardProps[];
}

export function CollectionsCarousel({ collections }: CollectionsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 sm:py-28 border-b border-line bg-paper">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Curated Exhibits"
          title="Thematic Collections"
          description="Drag or scroll through exhibits grouping oral histories by vanishing craft, migration, and food lore."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="h-10 w-10 rounded-xl"
                aria-label="Previous collections"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="h-10 w-10 rounded-xl"
                aria-label="Next collections"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" className="text-terracotta ml-2">
                <Link href="/collections">View All ({collections.length})</Link>
              </Button>
            </div>
          }
        />

        {/* Scrollable container with scroll-snap */}
        <div
          ref={scrollRef}
          className="mt-8 flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {collections.map((c) => (
            <div
              key={c.slug}
              className="snap-start shrink-0 w-[300px] sm:w-[360px]"
            >
              <CollectionCard
                slug={c.slug}
                name={c.name}
                description={c.description}
                coverGradient={c.coverGradient}
                motif={c.motif}
                storyCount={c.storyCount || 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
