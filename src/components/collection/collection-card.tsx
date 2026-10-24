import React from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollectionCardProps {
  slug: string;
  name: string;
  description: string;
  coverGradient: string;
  motif: string;
  storyCount?: number;
  className?: string;
}

// Visual motif SVG renderers
function MotifPattern({ motif }: { motif: string }) {
  switch (motif) {
    case "wheat-spice":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-wheat"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="3" fill="#FFF" />
              <path
                d="M18 4 Q24 14 18 24 Q12 14 18 4"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <path
                d="M4 18 Q14 24 24 18 Q14 12 4 18"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-wheat)" />
        </svg>
      );
    case "loom-tools":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-loom"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="20" x2="40" y2="20" stroke="#FFF" strokeWidth="1.5" />
              <line x1="20" y1="0" x2="20" y2="40" stroke="#FFF" strokeWidth="1.5" />
              <rect x="16" y="16" width="8" height="8" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-loom)" />
        </svg>
      );
    case "railway-border":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-border"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="12" x2="44" y2="12" stroke="#FFF" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="44" y2="32" stroke="#FFF" strokeWidth="1.5" />
              <line x1="12" y1="6" x2="12" y2="38" stroke="#FFF" strokeWidth="1.5" />
              <line x1="32" y1="6" x2="32" y2="38" stroke="#FFF" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-border)" />
        </svg>
      );
    case "diya-flame":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-diya"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 8 C24 16 28 22 28 26 C28 30 24 34 20 34 C16 34 12 30 12 26 C12 22 16 16 20 8 Z"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="24" r="2.5" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-diya)" />
        </svg>
      );
    case "kite-river":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-kite"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <polygon points="24,6 40,24 24,42 8,24" fill="none" stroke="#FFF" strokeWidth="1.5" />
              <line x1="24" y1="6" x2="24" y2="42" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="8" y1="24" x2="40" y2="24" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-kite)" />
        </svg>
      );
    default:
      // weave-spiral fallback
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern-spiral"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="14" fill="none" stroke="#FFF" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="7" fill="none" stroke="#FFF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-spiral)" />
        </svg>
      );
  }
}

const gradientStyles: Record<string, string> = {
  "saffron-terracotta": "from-[#E3A33B] via-[#C96931] to-[#B5472B]",
  "ink-moss": "from-[#1F1A17] via-[#2D3A2F] to-[#3F5B45]",
  "plum-terracotta": "from-[#5A3550] via-[#853C3C] to-[#B5472B]",
  "saffron-plum": "from-[#E3A33B] via-[#8F4E40] to-[#5A3550]",
  "moss-saffron": "from-[#3F5B45] via-[#75773B] to-[#E3A33B]",
  "plum-ink": "from-[#5A3550] via-[#352530] to-[#1F1A17]",
};

export function CollectionCard({
  slug,
  name,
  description,
  coverGradient,
  motif,
  storyCount = 0,
  className,
}: CollectionCardProps) {
  const gradientClass =
    gradientStyles[coverGradient] ||
    "from-terracotta via-[#8C4A33] to-[#5A3550]";

  return (
    <Link
      href={`/collections/${slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-warm transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg",
        className
      )}
    >
      {/* Decorative generated visual banner */}
      <div
        className={cn(
          "relative h-44 w-full bg-gradient-to-br p-6 text-white overflow-hidden flex flex-col justify-between",
          gradientClass
        )}
      >
        <MotifPattern motif={motif} />

        {/* Top badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/25 backdrop-blur-md border border-white/20">
            <Layers className="h-3.5 w-3.5" />
            <span>Curated Collection</span>
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
            {storyCount} {storyCount === 1 ? "story" : "stories"}
          </span>
        </div>

        {/* Big typography title on gradient */}
        <div className="relative z-10">
          <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-white group-hover:underline underline-offset-4 decoration-white/60">
            {name}
          </h3>
        </div>
      </div>

      {/* Description & Explore */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-3 sm:space-y-4">
        <p className="text-sm text-muted line-clamp-3 leading-relaxed">
          {description}
        </p>

        <div className="pt-2 flex items-center text-sm font-semibold text-terracotta group-hover:text-terracotta-hover transition-colors">
          <span>Explore collection</span>
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
