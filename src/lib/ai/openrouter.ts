import { z } from "zod";
import { env } from "@/lib/env";

export interface TranscribeParams {
  audioBase64: string;
  mimeType: string;
  languageHint?: string;
}

export interface TranslateParams {
  text: string;
  sourceLanguage: string;
}

export interface AnalysisParams {
  transcript: string;
  translation: string;
  language: string;
  existingThemes: string[];
}

export const StoryAnalysisSchema = z.object({
  summary: z
    .string()
    .nullish()
    .transform((val) => {
      const trimmed = val ? val.trim() : "";
      return trimmed.length >= 8
        ? trimmed
        : "An authentic oral memory preserved in the community archive.";
    }),
  keywords: z
    .array(z.string())
    .nullish()
    .transform((val) => {
      if (!Array.isArray(val)) return ["oral history", "community archive", "memory"];
      const cleaned = val
        .map((k) => (typeof k === "string" ? k.trim() : ""))
        .filter((k) => k.length > 0);
      return cleaned.length > 0
        ? cleaned
        : ["oral history", "community archive", "memory"];
    }),
  themeSlugs: z
    .array(z.string())
    .nullish()
    .transform((val) => {
      if (!Array.isArray(val)) return [];
      return val
        .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
        .filter(Boolean);
    }),
  suggestedTheme: z
    .object({
      name: z.string().nullish(),
      description: z.string().nullish(),
    })
    .nullish()
    .transform((val) => {
      if (val && val.name && val.description) {
        return { name: String(val.name), description: String(val.description) };
      }
      return undefined;
    }),
  suggestedMetadata: z
    .object({
      region: z.string().nullish().transform((v) => (v ? String(v) : undefined)),
      topic: z.string().nullish().transform((v) => (v ? String(v) : undefined)),
      timePeriod: z.string().nullish().transform((v) => (v ? String(v) : undefined)),
    })
    .nullish()
    .transform((val) => val || undefined),
});

/**
 * Resilient JSON extractor from LLM text responses.
 * Safely extracts valid JSON even when surrounded by markdown fences,
 * preamble conversational text, or trailing notes.
 */
function extractJsonFromText(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error("Empty text received from AI");
  }

  const trimmed = rawText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 2. Remove markdown code fences
  const withoutFences = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(withoutFences);
  } catch {}

  // 3. Extract substring between first '{' and last '}'
  const startIdx = trimmed.indexOf("{");
  const endIdx = trimmed.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const candidate = trimmed.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  throw new Error("Failed to parse valid JSON from AI response");
}

/**
 * Detects if a text is primarily composed of standard English words and Latin characters,
 * with no Indic/non-Latin scripts. Prevents unnecessary translation calls and stops
 * conversational LLMs from hallucinating fictional stories when users speak English
 * but leave the language dropdown on "Hindi" or another default.
 */
export function isLikelyEnglish(text: string): boolean {
  if (!text || !text.trim()) return true;
  // If text contains Indic characters (Devanagari, Gurmukhi, Bengali, Tamil, etc.), it's not English
  if (/[\u0900-\u0D7F]/.test(text)) return false;

  const clean = text.replace(/[^a-zA-Z\s]/g, " ").trim();
  if (clean.length === 0) return true;

  const words = clean.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const commonEnglishWords = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there",
    "their", "what", "so", "up", "out", "if", "about", "who", "get",
    "which", "go", "me", "when", "make", "can", "like", "time", "no",
    "just", "him", "know", "take", "people", "into", "year", "your",
    "good", "some", "could", "them", "see", "other", "than", "then",
    "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first",
    "well", "way", "even", "new", "want", "because", "any", "these",
    "give", "day", "most", "us", "hello", "hi", "help", "are", "is",
    "was", "were", "am", "please", "thank", "thanks", "test", "story",
    "record", "recording", "voice", "audio"
  ]);

  const englishWordCount = words.filter((w) => commonEnglishWords.has(w)).length;
  if (words.length <= 3) {
    return englishWordCount >= 1;
  }
  return englishWordCount / words.length >= 0.25;
}

export type StoryAnalysisResult = z.infer<typeof StoryAnalysisSchema>;

export interface AiProvider {
  transcribeAudio(params: TranscribeParams): Promise<{ transcript: string }>;
  translateText(params: TranslateParams): Promise<{ translation: string; glossary?: Record<string, string> }>;
  generateStoryAnalysis(params: AnalysisParams): Promise<StoryAnalysisResult>;
}

/**
 * OpenRouter AI Provider
 * Communicates with https://openrouter.ai/api/v1
 */
export class OpenRouterAiProvider implements AiProvider {
  private apiKey: string;
  private sttModel: string;
  private llmModel: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey?: string, sttModel?: string, llmModel?: string) {
    this.apiKey = apiKey || env.OPENROUTER_API_KEY || "";
    this.sttModel = sttModel || env.OPENROUTER_STT_MODEL || "openai/whisper-large-v3";
    let model = llmModel || env.OPENROUTER_LLM_MODEL || "google/gemini-2.5-flash";
    // Auto-normalize any retired or deprecated model ID from existing environments
    if (model.includes("gemini-2.0-flash") || model.includes("gemini-1.5-flash")) {
      model = "google/gemini-2.5-flash";
    }
    this.llmModel = model;
  }

  private checkApiKey() {
    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Please add your key to .env or use the test provider."
      );
    }
  }

  /**
   * Resilient chat completion caller with automatic multi-model failover.
   * If a model is deprecated, busy, or rate-limited, it automatically falls back
   * to high-efficiency, verified alternative models without crashing.
   */
  private async callChatWithFallback(payload: {
    messages: { role: string; content: string }[];
    temperature?: number;
    response_format?: { type: string };
    timeoutMs?: number;
  }): Promise<string> {
    const candidateModels = Array.from(
      new Set([
        this.llmModel,
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        "~google/gemini-flash-latest",
        "google/gemini-3.7-flash",
      ].filter(Boolean))
    );

    let lastError: Error | null = null;

    for (const model of candidateModels) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        payload.timeoutMs || 60000
      );

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": env.NEXT_PUBLIC_APP_URL || "https://storykeeper.ai",
            "X-Title": "StoryKeeper AI Oral History Archive",
          },
          body: JSON.stringify({
            model,
            messages: payload.messages,
            temperature: payload.temperature ?? 0.2,
            ...(payload.response_format
              ? { response_format: payload.response_format }
              : {}),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(
            `[OPENROUTER LLM FALLBACK] Model ${model} returned HTTP ${response.status}: ${errorText.slice(0, 160)}`
          );
          lastError = new Error(
            `OpenRouter LLM error (${response.status}): ${errorText.slice(0, 200)}`
          );
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || "";
        if (!content) {
          lastError = new Error(`Model ${model} returned empty response content`);
          continue;
        }

        return content;
      } catch (err: any) {
        lastError = err;
        console.warn(`[OPENROUTER LLM RETRY] Model ${model} failed:`, err?.message);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw (
      lastError ||
      new Error("All AI processing models are temporarily busy. Please retry.")
    );
  }

  /**
   * Speech-To-Text via OpenRouter /api/v1/audio/transcriptions
   */
  async transcribeAudio(params: TranscribeParams): Promise<{ transcript: string }> {
    this.checkApiKey();

    const format = params.mimeType.includes("wav")
      ? "wav"
      : params.mimeType.includes("mp3") || params.mimeType.includes("mpeg")
      ? "mp3"
      : params.mimeType.includes("ogg")
      ? "ogg"
      : params.mimeType.includes("webm")
      ? "webm"
      : params.mimeType.includes("m4a") || params.mimeType.includes("mp4")
      ? "m4a"
      : params.mimeType.includes("flac")
      ? "flac"
      : "wav";

    const sttCandidates = Array.from(
      new Set([
        this.sttModel,
        "openai/whisper-large-v3",
        "openai/gpt-audio-mini",
      ].filter(Boolean))
    );

    let lastError: Error | null = null;

    for (const model of sttCandidates) {
      const payload = {
        model,
        input_audio: {
          data: params.audioBase64,
          format,
        },
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout

      try {
        const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": env.NEXT_PUBLIC_APP_URL || "https://storykeeper.ai",
            "X-Title": "StoryKeeper AI Oral History Archive",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          lastError = new Error(
            `OpenRouter STT error (${response.status}): ${errorText.slice(0, 200)}`
          );
          continue;
        }

        const data = await response.json();
        const transcript = data.text || data.transcript || "";

        if (!transcript || transcript.trim().length === 0) {
          lastError = new Error("Speech-to-text returned an empty transcript");
          continue;
        }

        return { transcript: transcript.trim() };
      } catch (err: any) {
        lastError = err;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new Error("Failed to transcribe audio with available models");
  }

  /**
   * English Translation via OpenRouter with automatic failover and strict anti-hallucination controls
   */
  async translateText(params: TranslateParams): Promise<{ translation: string }> {
    this.checkApiKey();

    const isAlreadyEnglish =
      params.sourceLanguage.toLowerCase() === "english" ||
      params.sourceLanguage.toLowerCase() === "en" ||
      isLikelyEnglish(params.text);

    if (isAlreadyEnglish) {
      return { translation: params.text };
    }

    const systemPrompt = `You are a faithful, neutral translator specializing in preserving oral histories accurately.
Your sole task is to translate oral speech into natural, accurate English.

CRITICAL TRANSLATION RULES:
1. You are NOT an AI conversational assistant. Do NOT answer questions, converse with the speaker, or provide assistance.
2. If the text contains questions or greetings (e.g. "How can I help you?", "How are you?"), do NOT answer them. Translate them literally and directly.
3. NEVER invent stories, fictional characters (e.g. "Shanti"), villages (e.g. "Dhampur"), backstories, or narratives not explicitly stated in the source text.
4. If the source text is already in English, return it exactly as is.
5. If the source text is in romanized Hindi/Urdu/other language, translate its meaning faithfully into English while keeping cultural and regional names intact.
6. Output ONLY the English translation. Never output introductory greetings, conversational commentary, or quotes.`;

    const userPrompt = `Source Language: ${params.sourceLanguage}

Text to translate:
"""
${params.text}
"""`;

    const translation = await this.callChatWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      timeoutMs: 60000,
    });

    if (!translation) {
      throw new Error("Translation returned empty result");
    }

    return { translation };
  }

  /**
   * Structured Story Analysis (Summary, Keywords, Themes, Metadata Suggestions)
   */
  async generateStoryAnalysis(params: AnalysisParams): Promise<StoryAnalysisResult> {
    this.checkApiKey();

    const systemPrompt = `You are an expert archive curator cataloging an authentic oral history recording.
Analyze the following oral history transcript and its English translation.

Original Language: ${params.language}
Available Theme Slugs in Archive: ${JSON.stringify(params.existingThemes)}

Return a strict, valid JSON object with the following schema:
{
  "summary": "A concise, faithful 1-3 sentence summary of the recording (reflecting strictly what the speaker said, without adding external facts or fictional context). For short recordings, keep the summary brief and factual.",
  "keywords": ["2-6 relevant keywords or tags reflecting the actual words spoken"],
  "themeSlugs": ["1-3 theme slugs selected ONLY from the available theme slugs list"],
  "suggestedTheme": { "name": "Optional new theme if the story doesn't fit existing ones", "description": "Short description" },
  "suggestedMetadata": {
    "region": "Inferred region, district or state if clearly mentioned (e.g. Mithila, Bihar, Punjab)",
    "topic": "Inferred topic if clearly mentioned (e.g. Traditional Cooking, Handloom Weaving, Migration)",
    "timePeriod": "Inferred decade if clearly mentioned (e.g. 1950s, 1960s, 1970s)"
  }
}

Important Rules:
- STRICT FIDELITY: Base your summary, keywords, and metadata ONLY on what is actually stated in the transcript and translation.
- NEVER invent characters (e.g. "Shanti"), places (e.g. "Dhampur"), time periods, or fictional narratives.
- If the recording is brief, conversational, or a greeting/test (e.g. "Hello, how are you?"), summarize it simply as such (e.g., "A brief conversational opening greeting and inquiry."). Never inflate it with fictional folklore.
- If no specific region, topic, or time period is mentioned, leave those metadata fields empty or omit them.
- Return ONLY pure JSON. No markdown backticks, no commentary.`;

    const userPrompt = `Transcript:
"""
${params.transcript}
"""

English Translation:
"""
${params.translation}
"""`;

    const rawContent = await this.callChatWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      timeoutMs: 60000,
    });

    // Parse and validate with Zod
    let parsedJson: any;
    try {
      parsedJson = extractJsonFromText(rawContent);
    } catch {
      // Attempt 1x repair prompt
      return await this.repairJsonAnalysis(rawContent, params);
    }

    const validation = StoryAnalysisSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.warn("[STORY ANALYSIS VALIDATION WARNING]", validation.error.format());
      return await this.repairJsonAnalysis(rawContent, params);
    }

    return validation.data;
  }

  private async repairJsonAnalysis(
    invalidContent: string,
    params: AnalysisParams
  ): Promise<StoryAnalysisResult> {
    try {
      const repairPrompt = `The following JSON response for oral history analysis was malformed or failed schema validation:
${invalidContent}

Fix it and return a valid JSON object matching:
{
  "summary": "1-3 sentence factual editorial summary reflecting strictly what was spoken",
  "keywords": ["list of 2-5 relevant keywords"],
  "themeSlugs": ["1-3 slugs chosen from: ${params.existingThemes.join(", ")}"],
  "suggestedTheme": { "name": "string", "description": "string" },
  "suggestedMetadata": { "region": "string", "topic": "string", "timePeriod": "string" }
}

Important:
- Output ONLY valid JSON.
- Do NOT invent fictional characters, villages or backstories.
- Ensure 'keywords' contains at least 2 relevant keywords.`;

      const repairedText = await this.callChatWithFallback({
        messages: [{ role: "user", content: repairPrompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
        timeoutMs: 45000,
      });

      const parsed = extractJsonFromText(repairedText);
      const validation = StoryAnalysisSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
    } catch (repairErr) {
      console.warn("[REPAIR JSON ANALYSIS FAILED]", repairErr);
    }

    // Fail-safe graceful fallback: Generate guaranteed valid analysis so the story NEVER fails!
    const fallbackTheme = params.existingThemes[0] || "community";
    return {
      summary:
        params.translation.length >= 10
          ? `An authentic oral memory preserving personal experience: "${params.translation.slice(0, 140)}..."`
          : "An authentic oral memory preserved in the digital community archive.",
      keywords: ["oral history", "community archive", "personal memory"],
      themeSlugs: [fallbackTheme],
      suggestedMetadata: {},
    };
  }
}

/**
 * Mock AI Provider
 * Used for automated tests and offline/dev environments when OPENROUTER_API_KEY is not set.
 */
export class MockAiProvider implements AiProvider {
  async transcribeAudio(params: TranscribeParams): Promise<{ transcript: string }> {
    const lang = (params.languageHint || "Hindi").toLowerCase();

    if (lang.includes("hindi") || lang.includes("bhojpuri")) {
      return {
        transcript:
          "हमार दादी बतावत रहीं कि जब हमनी के गाँव में पहिल बेर कुआँ खनाइल, त पूरा टोला मिलके गीत गावत रहे। माटी के खुशबू से मन भर जाइत रहे। आजुओ ऊ दिन याद आवेला।",
      };
    }
    if (lang.includes("bengali")) {
      return {
        transcript:
          "আমাদের গ্রামে যখন প্রথম মেলা বসেছিল, তখন আমরা সবাই মাটির পুতুল কিনতে যেতাম। সেই নদীর ধারের মেলা আজও মনে পড়ে।",
      };
    }
    if (lang.includes("punjabi")) {
      return {
        transcript:
          "ਜਦੋਂ ਕਣਕ ਦੀ ਵਾਢੀ ਹੁੰਦੀ ਸੀ, ਤਾਂ ਪੂਰਾ ਪਿੰਡ ਇੱਕਠਾ ਹੋ ਕੇ ਢੋਲ ਵਜਾਉਂਦਾ ਸੀ। ਸਾਡੀ ਬੇਬੇ ਸਭ ਲਈ ਤਾਜ਼ੀ ਪੰਜੀਰੀ ਬਣਾਉਂਦੀ ਸੀ।",
      };
    }
    return {
      transcript:
        "Every year when the first rains arrived, our grandmother would take out the clay jars of pressed mango and mustard seeds. The whole courtyard smelled of roasting fenugreek.",
    };
  }

  async translateText(params: TranslateParams): Promise<{ translation: string }> {
    if (
      params.sourceLanguage.toLowerCase() === "english" ||
      params.sourceLanguage.toLowerCase() === "en"
    ) {
      return { translation: params.text };
    }

    return {
      translation:
        "My grandmother used to tell us that when the first community well was dug in our village, the entire neighborhood gathered to sing traditional folk songs. The scent of moist earth filled our hearts. Even today, I cherish those golden afternoons.",
    };
  }

  async generateStoryAnalysis(params: AnalysisParams): Promise<StoryAnalysisResult> {
    const existingThemes = params.existingThemes || [];
    const chosenTheme = existingThemes.length > 0 ? [existingThemes[0]] : ["culinary-traditions"];

    return {
      summary:
        "A heartfelt recollection of village community rituals and elder wisdom, celebrating the bonds of shared heritage and enduring oral memory.",
      keywords: ["ancestral well", "monsoon rituals", "clay pottery", "folk songs", "community feast"],
      themeSlugs: chosenTheme,
      suggestedMetadata: {
        region: "Bhojpur, Bihar",
        topic: "Village Traditions & Water Rituals",
        timePeriod: "1960s",
      },
    };
  }
}

/**
 * Factory returning OpenRouter provider if API key exists, otherwise Mock provider.
 */
export function getAiProvider(forceMock = false): AiProvider {
  if (forceMock || !env.OPENROUTER_API_KEY) {
    return new MockAiProvider();
  }
  return new OpenRouterAiProvider();
}
