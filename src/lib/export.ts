import { StoryPermission, DisplayPreference } from "@prisma/client";

export interface StoryExportInput {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  originalLanguage: string;
  originalTranscript: string;
  englishTranslation: string;
  summary: string;
  region: string | null;
  topic: string | null;
  timePeriodLabel: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  permission: StoryPermission;
  displayPreference: DisplayPreference;
  publishedAt: Date | string | null;
  contributor: {
    name: string;
    email?: string; // Must NEVER be included in output
  };
  collection?: {
    name: string;
  } | null;
  keywords?: { keyword: { name: string } }[];
  themes?: { theme: { name: string } }[];
}

export interface SanitizedStoryExport {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  originalLanguage: string;
  originalTranscript: string;
  englishTranslation: string;
  summary: string;
  region: string | null;
  topic: string | null;
  timePeriodLabel: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  collection: string | null;
  keywords: string[];
  themes: string[];
  contributorAttribution: string;
  publishedAt: string | null;
  archiveNotice: string;
}

/**
 * Sanitizes a database story record for public or academic researcher export.
 * STRICTLY filters out contributor email, internal session identifiers, and private fields.
 */
export function sanitizeStoryForExport(story: StoryExportInput): SanitizedStoryExport {
  // Attribution logic: Named vs Anonymous
  const contributorAttribution =
    story.displayPreference === "NAMED"
      ? story.contributor.name
      : "Anonymous Community Elder";

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    description: story.description || null,
    originalLanguage: story.originalLanguage,
    originalTranscript: story.originalTranscript,
    englishTranslation: story.englishTranslation,
    summary: story.summary,
    region: story.region || null,
    topic: story.topic || null,
    timePeriodLabel: story.timePeriodLabel || null,
    timePeriodStart: story.timePeriodStart || null,
    timePeriodEnd: story.timePeriodEnd || null,
    collection: story.collection?.name || null,
    keywords: story.keywords?.map((k) => k.keyword.name) || [],
    themes: story.themes?.map((t) => t.theme.name) || [],
    contributorAttribution,
    publishedAt: story.publishedAt
      ? new Date(story.publishedAt).toISOString()
      : null,
    archiveNotice:
      "Stories represent personal memories and community histories, not verified historical facts. Shared under StoryKeeper Ethical Oral History License.",
  };
}

/**
 * Encodes an array of sanitized records into RFC-4180 compliant CSV.
 */
export function formatStoriesAsCsv(records: SanitizedStoryExport[]): string {
  const headers = [
    "id",
    "slug",
    "title",
    "language",
    "summary",
    "originalTranscript",
    "englishTranslation",
    "region",
    "topic",
    "timePeriod",
    "collection",
    "keywords",
    "themes",
    "attribution",
    "publishedAt",
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = Array.isArray(val) ? val.join("; ") : String(val);
    return `"${str.replace(/"/g, '""').replace(/\r\n/g, "\n").replace(/\r/g, "\n")}"`;
  };

  const rows = records.map((r) =>
    [
      escapeCsv(r.id),
      escapeCsv(r.slug),
      escapeCsv(r.title),
      escapeCsv(r.originalLanguage),
      escapeCsv(r.summary),
      escapeCsv(r.originalTranscript),
      escapeCsv(r.englishTranslation),
      escapeCsv(r.region),
      escapeCsv(r.topic),
      escapeCsv(r.timePeriodLabel),
      escapeCsv(r.collection),
      escapeCsv(r.keywords),
      escapeCsv(r.themes),
      escapeCsv(r.contributorAttribution),
      escapeCsv(r.publishedAt),
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
