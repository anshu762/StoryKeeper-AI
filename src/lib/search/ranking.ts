import { MatchedFieldType } from "./types";
import { extractSnippet } from "./snippet";

export interface ScoredStoryData {
  title: string;
  summary: string;
  englishTranslation: string;
  originalTranscript: string;
  region?: string | null;
  topic?: string | null;
  keywords: Array<{ name: string; normalizedName: string }>;
}

export interface StoryScoreResult {
  score: number;
  matchedField: MatchedFieldType;
  snippet: string;
}

/**
 * Calculates weighted relevance score and extracts matching field + snippet.
 * Weights: title (10) > keywords (7) > summary (5) > translation (3) > transcript (2) > region/topic (2)
 */
export function calculateStoryScore(
  story: ScoredStoryData,
  query: string
): StoryScoreResult {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return {
      score: 1.0,
      matchedField: "summary",
      snippet: story.summary ? story.summary.slice(0, 140) + "..." : "",
    };
  }

  let titleScore = 0;
  let keywordScore = 0;
  let summaryScore = 0;
  let translationScore = 0;
  let transcriptScore = 0;
  let regionTopicScore = 0;

  const lowerTitle = story.title.toLowerCase();
  const lowerSummary = story.summary.toLowerCase();
  const lowerTranslation = story.englishTranslation.toLowerCase();
  const lowerTranscript = story.originalTranscript.toLowerCase();
  const lowerRegion = (story.region || "").toLowerCase();
  const lowerTopic = (story.topic || "").toLowerCase();

  for (const term of terms) {
    // Title matching (Weight 10)
    if (lowerTitle.includes(term)) {
      titleScore += 10;
      if (new RegExp(`\\b${term}\\b`, "i").test(lowerTitle)) {
        titleScore += 5; // exact whole word bonus
      }
    }

    // Keyword matching (Weight 7)
    for (const kw of story.keywords) {
      if (kw.normalizedName.includes(term)) {
        keywordScore += 7;
        if (kw.normalizedName === term) {
          keywordScore += 4; // exact keyword bonus
        }
      }
    }

    // Summary matching (Weight 5)
    if (lowerSummary.includes(term)) {
      summaryScore += 5;
    }

    // English translation matching (Weight 3)
    if (lowerTranslation.includes(term)) {
      translationScore += 3;
    }

    // Original transcript matching (Weight 2)
    if (lowerTranscript.includes(term)) {
      transcriptScore += 2;
    }

    // Region & Topic matching (Weight 2)
    if (lowerRegion.includes(term) || lowerTopic.includes(term)) {
      regionTopicScore += 2;
    }
  }

  const totalScore =
    titleScore +
    keywordScore +
    summaryScore +
    translationScore +
    transcriptScore +
    regionTopicScore;

  // Determine which field was the primary match
  let matchedField: MatchedFieldType = "summary";
  let snippet = "";

  const fieldScores: Array<{ field: MatchedFieldType; score: number }> = [
    { field: "title", score: titleScore },
    { field: "keywords", score: keywordScore },
    { field: "summary", score: summaryScore },
    { field: "translation", score: translationScore },
    { field: "transcript", score: transcriptScore },
    { field: "region", score: regionTopicScore },
  ];

  fieldScores.sort((a, b) => b.score - a.score);

  if (fieldScores[0].score > 0) {
    matchedField = fieldScores[0].field;
  }

  switch (matchedField) {
    case "title":
      snippet = extractSnippet(story.title, query, 120);
      break;
    case "keywords":
      const matchedKws = story.keywords
        .filter((k) => terms.some((t) => k.normalizedName.includes(t)))
        .map((k) => k.name);
      snippet = `Matched keywords: ${matchedKws.join(", ")}`;
      break;
    case "translation":
      snippet = extractSnippet(story.englishTranslation, query, 140);
      break;
    case "transcript":
      snippet = extractSnippet(story.originalTranscript, query, 140);
      break;
    case "region":
      snippet = `Location match: ${story.region || ""} ${story.topic ? `• Topic: ${story.topic}` : ""}`;
      break;
    case "summary":
    default:
      snippet = extractSnippet(story.summary, query, 140);
      break;
  }

  return {
    score: totalScore,
    matchedField,
    snippet,
  };
}
