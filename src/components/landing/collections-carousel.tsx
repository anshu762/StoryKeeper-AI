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
    <section className="py-16 sm:py-24 border-b border-line bg-paper">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Curated Exhibits"
          title="Thematic Collections"
          description="Drag or scroll through exhibits grouping oral histories by vanishing craft, migration, and food lore."
          action={
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl"
                aria-label="Previous collections"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl"
                aria-label="Next collections"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="ghost" className="text-terracotta text-xs sm:text-sm ml-1 sm:ml-2">
                <Link href="/collections">View All ({collections.length})</Link>
              </Button>
            </div>
          }
        />

        {/* Scrollable container with scroll-snap */}
        <div
          ref={scrollRef}
          className="mt-6 sm:mt-8 flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {collections.map((c) => (
            <div
              key={c.slug}
              className="snap-start shrink-0 w-[84vw] sm:w-[320px] md:w-[360px] max-w-[360px]"
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
