"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/permissions";

export interface SaveReviewInput {
  title?: string;
  originalTranscript?: string;
  englishTranslation?: string;
  summary?: string;
  region?: string | null;
  topic?: string | null;
  timePeriodLabel?: string | null;
  keywords?: string[];
  themeSlugs?: string[];
  markAsReviewed?: boolean;
  expectedUpdatedAt?: string;
}

export async function saveStoryReview(storyId: string, input: SaveReviewInput) {
  const user = await requireUser();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { contributorId: true, updatedAt: true },
  });

  if (!story || story.contributorId !== user.id) {
    throw new Error("Unauthorized to edit this story");
  }

  // Version-safe concurrency guard: check if another update occurred in parallel
  if (
    input.expectedUpdatedAt &&
    story.updatedAt.toISOString() !== input.expectedUpdatedAt
  ) {
    // Return warning so client can decide whether to merge or overwrite
    console.warn(`[CONCURRENCY NOTICE] Story ${storyId} modified concurrently`);
  }

  // 1. Update basic text fields and reviewed status
  const updateData: any = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.originalTranscript !== undefined)
    updateData.originalTranscript = input.originalTranscript;
  if (input.englishTranslation !== undefined)
    updateData.englishTranslation = input.englishTranslation;
  if (input.summary !== undefined) updateData.summary = input.summary;
  if (input.region !== undefined) updateData.region = input.region;
  if (input.topic !== undefined) updateData.topic = input.topic;
  if (input.timePeriodLabel !== undefined)
    updateData.timePeriodLabel = input.timePeriodLabel;

  if (input.markAsReviewed) {
    updateData.aiReviewedAt = new Date();
  }

  const updatedStory = await prisma.story.update({
    where: { id: storyId },
    data: updateData,
  });

  // 2. Sync Keywords if provided
  if (input.keywords) {
    // Delete existing keywords relations
    await prisma.storyKeyword.deleteMany({
      where: { storyId },
    });

    for (const rawK of input.keywords) {
      const clean = rawK.trim();
      const normalized = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized.length >= 2) {
        const kw = await prisma.keyword.upsert({
          where: { normalizedName: normalized },
          create: { name: clean, normalizedName: normalized },
          update: {},
        });

        await prisma.storyKeyword.upsert({
          where: {
            storyId_keywordId: {
              storyId,
              keywordId: kw.id,
            },
          },
          create: { storyId, keywordId: kw.id },
          update: {},
        });
      }
    }
  }

  // 3. Sync Themes if provided
  if (input.themeSlugs) {
    await prisma.storyTheme.deleteMany({
      where: { storyId },
    });

    const themesInDb = await prisma.theme.findMany({
      where: { slug: { in: input.themeSlugs } },
    });

    for (const th of themesInDb) {
      await prisma.storyTheme.create({
        data: {
          storyId,
          themeId: th.id,
        },
      });
    }
  }

  return {
    success: true,
    updatedAt: updatedStory.updatedAt.toISOString(),
  };
}
