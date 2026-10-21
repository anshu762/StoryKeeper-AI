"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, MapPin, Volume2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { formatDuration } from "@/lib/utils";

export interface TimelineStory {
  id: string;
  slug: string;
  title: string;
  summary: string;
  originalLanguage: string;
  region: string | null;
  timePeriodLabel: string | null;
  timePeriodStart: number | null;
  audioDurationSec: number | null;
  displayPreference: "NAMED" | "ANONYMOUS";
  isSample: boolean;
  contributorName?: string;
  themes: Array<{ name: string; slug: string }>;
}

interface TimelineViewProps {
  stories: TimelineStory[];
  availableLanguages: string[];
  availableRegions: string[];
}

const DECADES = [
  { key: "1940s", label: "1940s", description: "Independence, post-war upheavals, and ancestral migrations" },
  { key: "1950s", label: "1950s", description: "Rebuilding agrarian communities and founding modern settlements" },
  { key: "1960s", label: "1960s", description: "Green revolution, folk festivals, and cultural shifts" },
  { key: "1970s", label: "1970s", description: "Industrial expansion, regional movements, and community crafts" },
  { key: "1980s", label: "1980s", description: "Broadcasting, town marketplaces, and inter-state journeys" },
  { key: "1990s", label: "1990s", description: "Economic opening, changing village life, and emerging tech" },
  { key: "2000s+", label: "2000s & Later", description: "Contemporary traditions, diasporas, and living memory" },
];

function assignDecade(story: TimelineStory): string {
  if (story.timePeriodLabel) {
    const clean = story.timePeriodLabel.toLowerCase();
    if (clean.includes("1940")) return "1940s";
    if (clean.includes("1950")) return "1950s";
    if (clean.includes("1960")) return "1960s";
    if (clean.includes("1970")) return "1970s";
    if (clean.includes("1980")) return "1980s";
    if (clean.includes("1990")) return "1990s";
    if (clean.includes("2000") || clean.includes("2010") || clean.includes("2020")) return "2000s+";
  }

  if (story.timePeriodStart) {
    const yr = story.timePeriodStart;
    if (yr < 1950) return "1940s";
    if (yr < 1960) return "1950s";
    if (yr < 1970) return "1960s";
    if (yr < 1980) return "1970s";
    if (yr < 1990) return "1980s";
    if (yr < 2000) return "1990s";
    return "2000s+";
  }

  return "1970s"; // fallback grouping
}

export function TimelineView({
  stories,
  availableLanguages,
  availableRegions,
}: TimelineViewProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("all");
  const [selectedRegion, setSelectedRegion] = React.useState<string>("all");
  const [activeDecade, setActiveDecade] = React.useState<string>("1940s");

  // Filter stories
  const filteredStories = React.useMemo(() => {
    return stories.filter((story) => {
      if (
        selectedLanguage !== "all" &&
        story.originalLanguage.toLowerCase() !== selectedLanguage.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedRegion !== "all" &&
        story.region?.toLowerCase() !== selectedRegion.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [stories, selectedLanguage, selectedRegion]);

  // Group by decade
  const decadeGroups = React.useMemo(() => {
    const map = new Map<string, TimelineStory[]>();
    DECADES.forEach((d) => map.set(d.key, []));

    filteredStories.forEach((story) => {
      const dec = assignDecade(story);
      const list = map.get(dec) || [];
      list.push(story);
      map.set(dec, list);
    });

    return map;
  }, [filteredStories]);

  return (
    <div className="space-y-8">
      {/* Filter Controls Bar */}
      <div className="bg-paper-2/50 border border-line rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Language:
            </span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-paper border border-line rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <option value="all">All Languages</option>
              {availableLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Region:
            </span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs bg-paper border border-line rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <option value="all">All Regions</option>
              {availableRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-ink font-semibold">{filteredStories.length}</span> stories across decades
        </div>
      </div>

      {/* Main Layout: Sticky Decade Nav + Vertical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Decade Rail (3 cols on desktop) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 bg-paper-2/40 border border-line rounded-2xl p-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 px-2">
            Decade Index
          </span>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {DECADES.map((d) => {
              const count = decadeGroups.get(d.key)?.length || 0;
              return (
                <a
                  key={d.key}
                  href={`#decade-${d.key}`}
                  onClick={() => setActiveDecade(d.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    activeDecade === d.key
                      ? "bg-terracotta text-white shadow-xs"
                      : "text-muted-foreground hover:text-ink hover:bg-paper"
                  }`}
                >
                  <span>{d.label}</span>
                  <span
                    className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeDecade === d.key
                        ? "bg-white/20 text-white"
                        : "bg-paper-2 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Vertical Animated Timeline (9 cols) */}
        <div className="lg:col-span-9 relative pl-4 sm:pl-8 border-l-2 border-line space-y-16">
          {DECADES.map((decade) => {
            const storiesInDecade = decadeGroups.get(decade.key) || [];
            if (storiesInDecade.length === 0) return null;

            return (
              <section
                key={decade.key}
                id={`decade-${decade.key}`}
                className="relative space-y-6 scroll-mt-28"
              >
                {/* Timeline Node on Left Border */}
                <div className="absolute -left-[25px] sm:-left-[41px] top-1.5 w-6 h-6 rounded-full bg-paper border-4 border-terracotta flex items-center justify-center shadow-xs" />

                {/* Decade Heading Block */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                      {decade.label}
                    </h2>
                    <Badge variant="outline" className="text-xs bg-paper border-line text-muted-foreground">
                      {storiesInDecade.length} {storiesInDecade.length === 1 ? "story" : "stories"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                    {decade.description}
                  </p>
                </div>

                {/* Stories in this Decade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {storiesInDecade.map((story) => (
                    <motion.article
                      key={story.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.3 }}
                      className="group rounded-2xl border border-line bg-paper p-5 shadow-xs hover:shadow-warm transition-all duration-200 hover:border-terracotta/40 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-[11px]">
                            {story.originalLanguage}
                          </Badge>
                          {story.audioDurationSec && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5 text-terracotta" />
                              {formatDuration(story.audioDurationSec)}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/stories/${story.slug}`}
                          className="block focus:outline-none"
                        >
                          <h3 className="font-serif text-lg font-medium text-ink group-hover:text-terracotta transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                        </Link>

                        {story.region && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 text-terracotta" />
                            <span>{story.region}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {story.summary}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-line/60 mt-3">
                        {story.themes.map((t) => (
                          <span
                            key={t.slug}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-paper-2 text-ink font-medium"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
