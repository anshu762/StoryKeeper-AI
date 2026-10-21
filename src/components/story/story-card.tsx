import React from "react";
import Link from "next/link";
import { Clock, MapPin, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { StatusBadge, StoryStatusType } from "@/components/common/status-badge";
import { formatDuration } from "@/lib/utils";

export interface StoryCardProps {
  id: string;
  slug: string;
  title: string;
  summary: string;
  originalTranscript?: string;
  originalLanguage: string;
  region?: string | null;
  timePeriodLabel?: string | null;
  audioDurationSec?: number | null;
  displayPreference?: "NAMED" | "ANONYMOUS";
  contributorName?: string;
  isSample?: boolean;
  status?: StoryStatusType;
  showStatus?: boolean;
  themes?: Array<{ name: string; slug: string }>;
}

export function StoryCard({
  slug,
  title,
  summary,
  originalTranscript,
  originalLanguage,
  region,
  timePeriodLabel,
  audioDurationSec,
  displayPreference = "NAMED",
  contributorName,
  isSample = false,
  status,
  showStatus = false,
  themes = [],
}: StoryCardProps) {
  const contributorDisplay =
    displayPreference === "ANONYMOUS" || !contributorName
      ? "Anonymous Contributor"
      : contributorName;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-line/80 bg-white/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/40 hover:shadow-warm-lg">
      <div className="space-y-3.5">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[11px] font-medium">
              {originalLanguage}
            </Badge>
            {timePeriodLabel && (
              <Badge variant="outline" className="text-[11px] text-muted">
                {timePeriodLabel}
              </Badge>
            )}
            {isSample && <SampleBadge />}
          </div>

          {showStatus && status && <StatusBadge status={status} />}
        </div>

        {/* Title */}
        <Link href={`/stories/${slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink transition-colors group-hover:text-terracotta leading-snug">
            {title}
          </h3>
        </Link>

        {/* Region & Contributor */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted">
          {region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-terracotta" />
              <span>{region}</span>
            </span>
          )}
          <span className="text-muted/60">•</span>
          <span>Told by {contributorDisplay}</span>
        </div>

        {/* Summary Excerpt */}
        <p className="text-sm text-muted font-sans line-clamp-3 leading-relaxed">
          {summary}
        </p>

        {/* Original Transcript snippet (if script available) */}
        {originalTranscript && (
          <div className="rounded-xl bg-paper p-3 border border-line/60">
            <p className="text-xs text-ink/80 italic font-devanagari-serif line-clamp-2">
              &ldquo;{originalTranscript}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Footer info: Themes and audio duration */}
      <div className="mt-5 pt-4 border-t border-line/60 flex items-center justify-between gap-2 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
          {themes.slice(0, 2).map((t) => (
            <span
              key={t.slug}
              className="inline-block px-2 py-0.5 rounded-full bg-paper-2 text-[11px] text-ink font-medium truncate"
            >
              #{t.name}
            </span>
          ))}
        </div>

        {audioDurationSec ? (
          <div className="flex items-center gap-1.5 font-medium text-ink bg-paper-2 px-2.5 py-1 rounded-full text-[11px]">
            <Volume2 className="h-3.5 w-3.5 text-terracotta" />
            <span>{formatDuration(audioDurationSec)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted text-[11px]">
            <Clock className="h-3 w-3" />
            <span>Audio Story</span>
          </div>
        )}
      </div>
    </Card>
  );
}
