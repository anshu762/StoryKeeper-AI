import * as React from "react";
import Link from "next/link";
import { MapPin, Volume2, Sparkles, Tag, FileText, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { formatDuration } from "@/lib/utils";
import { SearchResultStory, MatchedFieldType } from "@/lib/search/types";

interface SearchResultCardProps {
  story: SearchResultStory;
}

export function SearchResultCard({ story }: SearchResultCardProps) {
  const contributorDisplay =
    story.displayPreference === "ANONYMOUS" || !story.contributorName
      ? "Anonymous Contributor"
      : story.contributorName;

  const renderMatchedBadge = (field?: MatchedFieldType) => {
    if (!field) return null;

    const config: Record<
      MatchedFieldType,
      { label: string; icon: React.ElementType; className: string }
    > = {
      title: {
        label: "Matched in Title",
        icon: FileText,
        className: "bg-terracotta/10 text-terracotta border-terracotta/20",
      },
      keywords: {
        label: "Matched in Keywords",
        icon: Tag,
        className: "bg-moss/10 text-moss border-moss/20",
      },
      summary: {
        label: "Matched in Summary",
        icon: FileText,
        className: "bg-saffron/20 text-ink border-saffron/30",
      },
      translation: {
        label: "Matched in Translation",
        icon: Globe,
        className: "bg-plum/10 text-plum border-plum/20",
      },
      transcript: {
        label: "Matched in Transcript",
        icon: Volume2,
        className: "bg-terracotta/10 text-terracotta border-terracotta/20",
      },
      region: {
        label: "Matched in Region",
        icon: MapPin,
        className: "bg-moss/10 text-moss border-moss/20",
      },
      topic: {
        label: "Matched in Topic",
        icon: Tag,
        className: "bg-saffron/20 text-ink border-saffron/30",
      },
    };

    const item = config[field];
    if (!item) return null;
    const Icon = item.icon;

    return (
      <Badge
        variant="outline"
        className={`text-[11px] font-medium inline-flex items-center gap-1 px-2 py-0.5 border ${item.className}`}
      >
        <Icon className="w-3 h-3" />
        <span>{item.label}</span>
      </Badge>
    );
  };

  return (
    <article className="group rounded-2xl border border-line bg-paper p-5 sm:p-6 shadow-xs hover:shadow-warm transition-all duration-200 hover:border-terracotta/40">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {story.originalLanguage}
            </Badge>
            {story.timePeriodLabel && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {story.timePeriodLabel}
              </Badge>
            )}
            {story.isSample && <SampleBadge />}
            {renderMatchedBadge(story.matchedField)}
          </div>

          {story.audioDurationSec && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-paper-2 px-2.5 py-1 rounded-full border border-line/60">
              <Volume2 className="h-3.5 w-3.5 text-terracotta" />
              <span>{formatDuration(story.audioDurationSec)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/stories/${story.slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink transition-colors group-hover:text-terracotta leading-snug">
            {story.title}
          </h3>
        </Link>

        {/* Region & Author */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {story.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-terracotta" />
              <span>{story.region}</span>
            </span>
          )}
          <span>•</span>
          <span>Preserved by {contributorDisplay}</span>
        </div>

        {/* Highlighted Snippet or Summary */}
        {story.snippet ? (
          <div className="text-sm text-ink/90 leading-relaxed bg-paper-2/60 p-3.5 rounded-xl border border-line/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
              Excerpt Match
            </span>
            <div
              className="line-clamp-3 text-sm"
              dangerouslySetInnerHTML={{ __html: story.snippet }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {story.summary}
          </p>
        )}

        {/* Themes & Keywords */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {story.themes.map((t) => (
            <Link
              key={t.slug}
              href={`/archive?theme=${t.slug}`}
              className="px-2 py-0.5 rounded-full bg-paper-2 text-[11px] text-ink font-medium hover:bg-moss/20 hover:text-moss transition-colors"
            >
              #{t.name}
            </Link>
          ))}
          {story.keywords.slice(0, 3).map((k) => (
            <Link
              key={k.normalizedName}
              href={`/search?q=${encodeURIComponent(k.name)}`}
              className="px-2 py-0.5 rounded-full bg-paper-2/50 text-[11px] text-muted-foreground border border-line/60 hover:text-ink transition-colors"
            >
              {k.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
