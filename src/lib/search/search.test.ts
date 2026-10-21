import { describe, it, expect } from "vitest";
import { calculateStoryScore } from "./ranking";
import { extractSnippet } from "./snippet";
import { parseNaturalLanguageQuery } from "./natural-language";
import { publicStoryWhere } from "../permissions";

describe("Search Ranking & Scoring", () => {
  const storyWithTitleMatch = {
    title: "Harvest Festival Memories of Thanjavur",
    summary: "Reflections on village life and traditions.",
    englishTranslation: "We used to sing songs during the winter season.",
    originalTranscript: "நாற்று நடும் பெண்கள்...",
    keywords: [{ name: "thanjavur", normalizedName: "thanjavur" }],
  };

  const storyWithSummaryMatch = {
    title: "Village Life in Tamil Nadu",
    summary: "Reflections on the annual harvest festival and community feasts.",
    englishTranslation: "We celebrated together every year.",
    originalTranscript: "ஊர் திருவிழா...",
    keywords: [{ name: "community", normalizedName: "community" }],
  };

  const storyWithTranscriptMatch = {
    title: "Songs of the Kaveri Delta",
    summary: "Agricultural chants and delta customs.",
    englishTranslation: "The river brought abundance.",
    originalTranscript: "The harvest was plenty that year.",
    keywords: [],
  };

  it("calculates partial matching correctly for 'harvest'", () => {
    const score1 = calculateStoryScore(storyWithTitleMatch, "harvest");
    const score2 = calculateStoryScore(storyWithSummaryMatch, "harvest");

    expect(score1.score).toBeGreaterThan(0);
    expect(score2.score).toBeGreaterThan(0);
  });

  it("ranks title match higher than summary match (Title > Summary)", () => {
    const titleMatchResult = calculateStoryScore(storyWithTitleMatch, "harvest");
    const summaryMatchResult = calculateStoryScore(storyWithSummaryMatch, "harvest");

    expect(titleMatchResult.score).toBeGreaterThan(summaryMatchResult.score);
    expect(titleMatchResult.matchedField).toBe("title");
    expect(summaryMatchResult.matchedField).toBe("summary");
  });

  it("ranks summary match higher than transcript match (Summary > Transcript)", () => {
    const summaryMatchResult = calculateStoryScore(storyWithSummaryMatch, "harvest");
    const transcriptMatchResult = calculateStoryScore(storyWithTranscriptMatch, "harvest");

    expect(summaryMatchResult.score).toBeGreaterThan(transcriptMatchResult.score);
  });

  it("gives bonus points for exact keyword match", () => {
    const storyWithKeyword = {
      title: "Ancient Crafts",
      summary: "Memories of village artisans.",
      englishTranslation: "We worked with copper.",
      originalTranscript: "तांबा...",
      keywords: [{ name: "Handloom", normalizedName: "handloom" }],
    };

    const res = calculateStoryScore(storyWithKeyword, "handloom");
    expect(res.score).toBeGreaterThanOrEqual(11); // 7 base + 4 exact bonus
    expect(res.matchedField).toBe("keywords");
  });
});

describe("Snippet Extraction & Highlighting", () => {
  it("extracts and highlights the matched term with mark tags", () => {
    const text = "During the winter of 1965, the entire village celebrated the harvest festival with brass lamps and music.";
    const snippet = extractSnippet(text, "harvest");

    expect(snippet).toContain('<mark class="bg-saffron/30 text-ink font-semibold rounded px-0.5">harvest</mark>');
  });

  it("handles empty or unmatched query safely", () => {
    const text = "A peaceful morning in the village.";
    const snippet = extractSnippet(text, "mountain");

    expect(snippet).toBe(text);
  });
});

describe("Natural Language Query Parser ('Ask the Archive')", () => {
  it("extracts theme and region from natural phrases", () => {
    const parsed = parseNaturalLanguageQuery("stories about food in Bihar");

    expect(parsed.extractedThemes).toContain("food");
    expect(parsed.extractedRegion).toBe("Bihar");
  });

  it("extracts decade and language from natural phrases", () => {
    const parsed = parseNaturalLanguageQuery("show me stories from the 1960s in Punjabi");

    expect(parsed.extractedTimePeriod).toBe("1960s");
    expect(parsed.extractedLanguage).toBe("Punjabi");
  });

  it("extracts partition theme and cleans boilerplate phrases", () => {
    const parsed = parseNaturalLanguageQuery("tell me about partition and migration");

    expect(parsed.extractedThemes).toContain("partition");
    expect(parsed.extractedThemes).toContain("migration");
  });
});

describe("Search Privacy Filter Guarantee", () => {
  it("enforces AGENTS.md rule 2 publicStoryWhere conditions", () => {
    const where = publicStoryWhere();

    expect(where).toEqual({
      status: "PUBLISHED",
      permission: "PUBLIC",
      deletedAt: null,
    });
  });
});
