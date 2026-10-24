import { prisma } from "@/lib/db";
import { AiProvider, getAiProvider, isLikelyEnglish } from "@/lib/ai/openrouter";
import { fetchAudioBuffer } from "@/lib/storage";
import { splitTextIntoChunks } from "./chunking";
import { getFriendlyErrorMessage } from "@/lib/errors";
import slugify from "slugify";

export interface PipelineResult {
  success: boolean;
  storyId: string;
  error?: string;
}

/**
 * Runs the AI processing pipeline for a story.
 * Executes jobs: TRANSCRIPTION -> TRANSLATION -> SUMMARY -> KEYWORDS -> THEMES.
 * Fully idempotent: re-running only executes pending or failed jobs.
 */
export async function runAiPipeline(
  storyId: string,
  customProvider?: AiProvider
): Promise<PipelineResult> {
  const provider = customProvider || getAiProvider();

  // 1. Fetch story with existing jobs
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      aiJobs: true,
      themes: true,
      keywords: true,
    },
  });

  if (!story) {
    return { success: false, storyId, error: "Story not found" };
  }

  if (!story.audioKey) {
    return { success: false, storyId, error: "Story has no audio recording attached" };
  }

  // Update story status to PROCESSING
  await prisma.story.update({
    where: { id: storyId },
    data: { status: "PROCESSING" },
  });

  // Ensure all 5 job rows exist in DB
  const jobTypes = [
    "TRANSCRIPTION",
    "TRANSLATION",
    "SUMMARY",
    "KEYWORDS",
    "THEMES",
  ] as const;

  for (const type of jobTypes) {
    const existing = story.aiJobs.find((j) => j.type === type);
    if (!existing) {
      await prisma.aiJob.create({
        data: {
          storyId,
          type,
          status: "PENDING",
        },
      });
    }
  }

  // Helper to update job status
  const updateJob = async (
    type: (typeof jobTypes)[number],
    status: "PROCESSING" | "COMPLETED" | "FAILED",
    error?: string
  ) => {
    const job = await prisma.aiJob.findFirst({
      where: { storyId, type },
    });

    if (job) {
      const sanitizedError = error
        ? getFriendlyErrorMessage(
            error,
            "An automated preservation step encountered a brief delay. You can retry or proceed to review manually."
          )
        : null;

      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status,
          errorMessage: sanitizedError,
          retryCount: status === "FAILED" ? { increment: 1 } : undefined,
          startedAt: status === "PROCESSING" ? new Date() : undefined,
          completedAt: status === "COMPLETED" ? new Date() : undefined,
        },
      });
    }
  };

  try {
    // -------------------------------------------------------------
    // STEP 1: TRANSCRIPTION (Speech to Text)
    // -------------------------------------------------------------
    let transcript = story.originalTranscript || "";
    const transcriptionJob = await prisma.aiJob.findFirst({
      where: { storyId, type: "TRANSCRIPTION" },
    });

    if (transcriptionJob?.status !== "COMPLETED" || !transcript) {
      await updateJob("TRANSCRIPTION", "PROCESSING");
      try {
        const audioBuffer = await fetchAudioBuffer(story.audioKey);
        const base64Audio = audioBuffer.toString("base64");

        const result = await provider.transcribeAudio({
          audioBase64: base64Audio,
          mimeType: story.audioMimeType || "audio/wav",
          languageHint: story.originalLanguage,
        });

        transcript = result.transcript;

        await prisma.story.update({
          where: { id: storyId },
          data: {
            originalTranscript: transcript,
            transcriptAi: true,
          },
        });

        await updateJob("TRANSCRIPTION", "COMPLETED");
      } catch (err: any) {
        await updateJob("TRANSCRIPTION", "FAILED", err.message);
        throw err;
      }
    }

    // -------------------------------------------------------------
    // STEP 2: TRANSLATION (Original language -> English)
    // -------------------------------------------------------------
    let translation = story.englishTranslation || "";
    const translationJob = await prisma.aiJob.findFirst({
      where: { storyId, type: "TRANSLATION" },
    });

    if (translationJob?.status !== "COMPLETED" || !translation) {
      await updateJob("TRANSLATION", "PROCESSING");
      try {
        const isEnglish =
          story.originalLanguage.toLowerCase() === "english" ||
          story.originalLanguage.toLowerCase() === "en" ||
          isLikelyEnglish(transcript);

        if (isEnglish) {
          translation = transcript;
        } else {
          const chunks = splitTextIntoChunks(transcript);
          const translatedChunks: string[] = [];

          for (const chunk of chunks) {
            const res = await provider.translateText({
              text: chunk,
              sourceLanguage: story.originalLanguage,
            });
            translatedChunks.push(res.translation);
          }

          translation = translatedChunks.join("\n\n");
        }

        // Save translation without overwriting original transcript
        await prisma.story.update({
          where: { id: storyId },
          data: {
            englishTranslation: translation,
            translationAi: true,
          },
        });

        await updateJob("TRANSLATION", "COMPLETED");
      } catch (err: any) {
        await updateJob("TRANSLATION", "FAILED", err.message);
        throw err;
      }
    }

    // -------------------------------------------------------------
    // STEP 3: SUMMARY, KEYWORDS & THEMES (Structured Analysis)
    // -------------------------------------------------------------
    const summaryJob = await prisma.aiJob.findFirst({
      where: { storyId, type: "SUMMARY" },
    });
    const keywordsJob = await prisma.aiJob.findFirst({
      where: { storyId, type: "KEYWORDS" },
    });
    const themesJob = await prisma.aiJob.findFirst({
      where: { storyId, type: "THEMES" },
    });

    const needsAnalysis =
      summaryJob?.status !== "COMPLETED" ||
      keywordsJob?.status !== "COMPLETED" ||
      themesJob?.status !== "COMPLETED";

    if (needsAnalysis) {
      await updateJob("SUMMARY", "PROCESSING");
      await updateJob("KEYWORDS", "PROCESSING");
      await updateJob("THEMES", "PROCESSING");

      try {
        // Fetch existing themes from DB
        const allDbThemes = await prisma.theme.findMany({
          select: { id: true, slug: true, name: true },
        });
        const existingThemeSlugs = allDbThemes.map((t) => t.slug);

        const analysis = await provider.generateStoryAnalysis({
          transcript,
          translation,
          language: story.originalLanguage,
          existingThemes: existingThemeSlugs,
        });

        // 1. Update summary
        await prisma.story.update({
          where: { id: storyId },
          data: {
            summary: analysis.summary,
            summaryAi: true,
            // Non-binding metadata suggestions if currently empty
            region: story.region || analysis.suggestedMetadata?.region,
            topic: story.topic || analysis.suggestedMetadata?.topic,
            timePeriodLabel:
              story.timePeriodLabel || analysis.suggestedMetadata?.timePeriod,
          },
        });
        await updateJob("SUMMARY", "COMPLETED");

        // 2. Link themes idempotently
        const themeSlugs = Array.isArray(analysis.themeSlugs) ? analysis.themeSlugs : [];
        const matchedThemes = allDbThemes.filter((t) =>
          themeSlugs.includes(t.slug)
        );

        // If no matching themes found, attach at least the primary fallback theme
        const themesToAttach = matchedThemes.length > 0
          ? matchedThemes
          : allDbThemes.slice(0, 1);

        for (const t of themesToAttach) {
          await prisma.storyTheme.upsert({
            where: {
              storyId_themeId: {
                storyId,
                themeId: t.id,
              },
            },
            create: {
              storyId,
              themeId: t.id,
            },
            update: {},
          });
        }
        await updateJob("THEMES", "COMPLETED");

        // 3. Upsert keywords idempotently
        const rawKeywords =
          Array.isArray(analysis.keywords) && analysis.keywords.length > 0
            ? analysis.keywords
            : ["oral history", "community archive", "memory"];

        for (const rawKeyword of rawKeywords) {
          if (!rawKeyword || typeof rawKeyword !== "string") continue;
          const cleanName = rawKeyword.trim();
          const normalized = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

          if (normalized.length >= 2) {
            const keywordRecord = await prisma.keyword.upsert({
              where: { normalizedName: normalized },
              create: {
                name: cleanName,
                normalizedName: normalized,
              },
              update: {},
            });

            await prisma.storyKeyword.upsert({
              where: {
                storyId_keywordId: {
                  storyId,
                  keywordId: keywordRecord.id,
                },
              },
              create: {
                storyId,
                keywordId: keywordRecord.id,
              },
              update: {},
            });
          }
        }
        await updateJob("KEYWORDS", "COMPLETED");
      } catch (err: any) {
        await updateJob("SUMMARY", "FAILED", err.message);
        await updateJob("KEYWORDS", "FAILED", err.message);
        await updateJob("THEMES", "FAILED", err.message);
        throw err;
      }
    }

    // All jobs completed! Transition story to NEEDS_REVIEW
    await prisma.story.update({
      where: { id: storyId },
      data: { status: "NEEDS_REVIEW" },
    });

    return { success: true, storyId };
  } catch (error: any) {
    console.error("[PIPELINE EXECUTION ERROR]", error);
    // Story remains safe in database; keep original audio and partial work
    return {
      success: false,
      storyId,
      error: error.message || "Pipeline execution failed",
    };
  }
}
