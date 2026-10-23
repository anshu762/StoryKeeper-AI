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
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  keywords: z.array(z.string()).min(1, "At least one keyword is required"),
  themeSlugs: z.array(z.string()),
  suggestedTheme: z
    .object({
      name: z.string(),
      description: z.string(),
    })
    .optional(),
  suggestedMetadata: z
    .object({
      region: z.string().optional(),
      topic: z.string().optional(),
      timePeriod: z.string().optional(),
    })
    .optional(),
});

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
    this.llmModel = llmModel || env.OPENROUTER_LLM_MODEL || "google/gemini-2.0-flash-001";
  }

  private checkApiKey() {
    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Please add your key to .env or use the test provider."
      );
    }
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

    const payload = {
      model: this.sttModel,
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
        throw new Error(
          `OpenRouter STT error (${response.status}): ${errorText.slice(0, 300)}`
        );
      }

      const data = await response.json();
      const transcript = data.text || data.transcript || "";

      if (!transcript || transcript.trim().length === 0) {
        throw new Error("Speech-to-text returned an empty transcript");
      }

      return { transcript: transcript.trim() };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * English Translation via OpenRouter /api/v1/chat/completions
   */
  async translateText(params: TranslateParams): Promise<{ translation: string }> {
    this.checkApiKey();

    const isAlreadyEnglish =
      params.sourceLanguage.toLowerCase() === "english" ||
      params.sourceLanguage.toLowerCase() === "en";

    if (isAlreadyEnglish) {
      return { translation: params.text };
    }

    const prompt = `You are a professional literary translator and cultural anthropologist specializing in oral histories.
Translate the following first-person oral memory from ${params.sourceLanguage} into evocative, accurate English.

Guidelines:
1. Preserve the speaker's emotional tone, cadence, and personal perspective.
2. Keep indigenous place names, personal names, flora, fauna, and distinct cultural terms intact (with brief natural context if needed).
3. Do NOT add fictional details, preachiness, or editorial commentary.
4. Output ONLY the English translation, with no conversational preamble or metadata.

Text to translate:
"""
${params.text}
"""`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

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
          model: this.llmModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter translation error (${response.status}): ${errorText.slice(0, 300)}`
        );
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim() || "";

      if (!translation) {
        throw new Error("Translation returned empty result");
      }

      return { translation };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Structured Story Analysis (Summary, Keywords, Themes, Metadata Suggestions)
   */
  async generateStoryAnalysis(params: AnalysisParams): Promise<StoryAnalysisResult> {
    this.checkApiKey();

    const prompt = `You are an expert archive curator cataloging an authentic oral history recording.
Analyze the following oral history transcript and its English translation.

Original Language: ${params.language}
Available Theme Slugs in Archive: ${JSON.stringify(params.existingThemes)}

Return a strict, valid JSON object with the following schema:
{
  "summary": "A warm, editorial 2-3 sentence summary of the memory (80-160 words).",
  "keywords": ["5-10 specific cultural keywords, food ingredients, crafts, rituals, or tools mentioned"],
  "themeSlugs": ["1-3 theme slugs selected ONLY from the available theme slugs list"],
  "suggestedTheme": { "name": "Optional new theme if the story doesn't fit existing ones", "description": "Short description" },
  "suggestedMetadata": {
    "region": "Inferred region, district or state if clearly mentioned (e.g. Mithila, Bihar, Punjab)",
    "topic": "Inferred topic (e.g. Traditional Cooking, Handloom Weaving, Migration)",
    "timePeriod": "Inferred decade if mentioned (e.g. 1950s, 1960s, 1970s)"
  }
}

Important:
- Return ONLY pure JSON. No markdown backticks, no markdown code fence, no commentary.
- Do NOT invent facts. Only suggest metadata if clearly grounded in the narrative.

Transcript:
"""
${params.transcript}
"""

English Translation:
"""
${params.translation}
"""`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

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
          model: this.llmModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter analysis error (${response.status}): ${errorText.slice(0, 300)}`
        );
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

      // Parse and validate with Zod
      let parsedJson: any;
      try {
        const cleanJson = rawContent
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```$/i, "")
          .trim();
        parsedJson = JSON.parse(cleanJson);
      } catch (jsonErr) {
        // Attempt 1x repair prompt
        return await this.repairJsonAnalysis(rawContent, params);
      }

      const validation = StoryAnalysisSchema.safeParse(parsedJson);
      if (!validation.success) {
        return await this.repairJsonAnalysis(rawContent, params);
      }

      return validation.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async repairJsonAnalysis(
    invalidContent: string,
    params: AnalysisParams
  ): Promise<StoryAnalysisResult> {
    const repairPrompt = `The following JSON response for oral history analysis was malformed or failed schema validation:
${invalidContent}

Fix it and return a valid JSON object matching:
{
  "summary": "2-3 sentence editorial summary (string)",
  "keywords": ["list of strings"],
  "themeSlugs": ["1-3 slugs chosen from: ${params.existingThemes.join(", ")}"],
  "suggestedTheme": { "name": "string", "description": "string" },
  "suggestedMetadata": { "region": "string", "topic": "string", "timePeriod": "string" }
}

Output ONLY valid JSON without backticks or markdown.`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.NEXT_PUBLIC_APP_URL || "https://storykeeper.ai",
      },
      body: JSON.stringify({
        model: this.llmModel,
        messages: [{ role: "user", content: repairPrompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("JSON repair failed on OpenRouter");
    }

    const data = await response.json();
    const repairedText = data.choices?.[0]?.message?.content?.trim() || "";
    const clean = repairedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return StoryAnalysisSchema.parse(JSON.parse(clean));
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
