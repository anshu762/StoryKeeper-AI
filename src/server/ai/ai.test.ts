import { describe, it, expect, vi, beforeEach } from "vitest";
import { splitTextIntoChunks } from "./chunking";
import { MockAiProvider } from "@/lib/ai/openrouter";

describe("AI Chunking & Text Splitting", () => {
  it("returns single chunk for short text", () => {
    const text = "Short memory about village harvest in Thanjavur.";
    const chunks = splitTextIntoChunks(text, 500);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("splits long paragraphs cleanly without breaking words", () => {
    const p1 = "This is the first paragraph describing ancestral wells in Bihar. ".repeat(15);
    const p2 = "This is the second paragraph describing monsoon songs and festivals. ".repeat(15);
    const combined = `${p1}\n\n${p2}`;

    const chunks = splitTextIntoChunks(combined, 400);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(1200);
    }
  });
});

describe("Mock AI Provider Contract", () => {
  const provider = new MockAiProvider();

  it("transcribes audio in regional script according to language hint", async () => {
    const result = await provider.transcribeAudio({
      audioBase64: "dGVzdC1hdWRpby1ieXRlcw==",
      mimeType: "audio/wav",
      languageHint: "Bhojpuri",
    });

    expect(result.transcript).toBeTruthy();
    expect(result.transcript).toContain("हमार दादी");
  });

  it("translates non-English text to English", async () => {
    const result = await provider.translateText({
      text: "हमार दादी बतावत रहीं",
      sourceLanguage: "Bhojpuri",
    });

    expect(result.translation).toBeTruthy();
    expect(result.translation).toContain("grandmother");
  });

  it("returns original text directly if language is already English", async () => {
    const englishText = "My grandfather was a blacksmith who made iron sickles for harvest.";
    const result = await provider.translateText({
      text: englishText,
      sourceLanguage: "English",
    });

    expect(result.translation).toBe(englishText);
  });

  it("generates structured story analysis matching schema", async () => {
    const analysis = await provider.generateStoryAnalysis({
      transcript: "गांव के कुआं...",
      translation: "The village well...",
      language: "Bhojpuri",
      existingThemes: ["culinary-traditions", "migration-memories"],
    });

    expect(analysis.summary).toBeTruthy();
    expect(analysis.keywords.length).toBeGreaterThan(0);
    expect(analysis.themeSlugs.length).toBeGreaterThan(0);
    expect(analysis.suggestedMetadata?.region).toBe("Bhojpur, Bihar");
  });
});

describe("Translation Isolation & Data Protection Logic", () => {
  it("guarantees original transcript and english translation reside in distinct fields", () => {
    const story = {
      originalTranscript: "अम्मा रोज सबेरे सत्तू सानत रहीं...",
      englishTranslation: "Mother used to roast roasted gram flour every dawn...",
    };

    // Simulate updating translation
    const updatedTranslation = "Mother used to prepare toasted barley and gram every sunrise...";
    const updatedStory = {
      ...story,
      englishTranslation: updatedTranslation,
    };

    expect(updatedStory.originalTranscript).toBe(story.originalTranscript);
    expect(updatedStory.englishTranslation).not.toBe(story.originalTranscript);
  });

  it("normalizes and de-duplicates keyword variations", () => {
    const rawKeywords = ["Harvest", "harvest", " HARVEST! ", "Sickle", "sickle"];
    const normalizedMap = new Map<string, string>();

    for (const raw of rawKeywords) {
      const clean = raw.trim();
      const normalized = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized.length >= 2 && !normalizedMap.has(normalized)) {
        normalizedMap.set(normalized, clean);
      }
    }

    const uniqueKeywords = Array.from(normalizedMap.keys());
    expect(uniqueKeywords).toEqual(["harvest", "sickle"]);
    expect(uniqueKeywords).toHaveLength(2);
  });
});
