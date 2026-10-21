import React from "react";
import Link from "next/link";
import { Clock, MapPin, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { formatDuration } from "@/lib/utils";
import { SearchResultStory } from "@/lib/search/types";

export function StoryListItem({ story }: { story: SearchResultStory }) {
  const contributorDisplay =
    story.displayPreference === "ANONYMOUS" || !story.contributorName
      ? "Anonymous Contributor"
      : story.contributorName;

  return (
    <article className="group rounded-2xl border border-line bg-white/90 p-5 sm:p-6 shadow-xs hover:shadow-warm transition-all duration-200 hover:border-terracotta/40">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {story.originalLanguage}
            </Badge>
            {story.timePeriodLabel && (
              <Badge variant="outline" className="text-xs text-muted">
                {story.timePeriodLabel}
              </Badge>
            )}
            {story.isSample && <SampleBadge />}
          </div>

          {/* Title */}
          <Link href={`/stories/${story.slug}`} className="block focus:outline-none">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink transition-colors group-hover:text-terracotta leading-snug">
              {story.title}
            </h3>
          </Link>

          {/* Region & Author */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {story.region && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-terracotta" />
                <span>{story.region}</span>
              </span>
            )}
            <span>•</span>
            <span>Recorded by {contributorDisplay}</span>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-muted leading-relaxed line-clamp-2 max-w-3xl">
            {story.summary}
          </p>

          {/* Themes */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {story.themes.map((t) => (
              <span
                key={t.slug}
                className="px-2 py-0.5 rounded-full bg-paper-2 text-[11px] text-ink font-medium"
              >
                #{t.name}
              </span>
            ))}
          </div>
        </div>

        {/* Right audio & play indicator */}
        <div className="sm:self-center shrink-0 flex items-center gap-2 bg-paper-2 px-3 py-1.5 rounded-xl border border-line/60">
          <Volume2 className="h-4 w-4 text-terracotta" />
          <span className="text-xs font-semibold text-ink">
            {formatDuration(story.audioDurationSec)}
          </span>
        </div>
      </div>
    </article>
  );
}
