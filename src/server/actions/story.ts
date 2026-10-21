"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import slugify from "slugify";
import { StoryPermission, DisplayPreference, StoryStatus } from "@prisma/client";

export async function createStoryDraft(input: {
  audioKey: string;
  audioMimeType: string;
  audioSizeBytes?: number;
  audioDurationSec?: number;
  originalLanguage?: string;
}) {
  const user = await requireUser();

  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      preferredLanguage: true,
      defaultPermission: true,
      defaultDisplay: true,
    },
  });

  const timestamp = Date.now().toString(36);
  const baseSlug = `story-${timestamp}`;

  const story = await prisma.story.create({
    data: {
      contributorId: user.id,
      title: "Untitled Oral Memory",
      slug: baseSlug,
      originalLanguage:
        input.originalLanguage || userProfile?.preferredLanguage || "Hindi",
      originalTranscript: "",
      englishTranslation: "",
      summary: "",
      audioKey: input.audioKey,
      audioMimeType: input.audioMimeType,
      audioSizeBytes: input.audioSizeBytes || null,
      audioDurationSec: input.audioDurationSec || null,
      status: "DRAFT",
      permission: userProfile?.defaultPermission || "PUBLIC",
      displayPreference: userProfile?.defaultDisplay || "NAMED",
    },
  });

  return { success: true, storyId: story.id, slug: story.slug };
}

export async function updateStoryDraft(
  storyId: string,
  data: {
    title?: string;
    originalLanguage?: string;
    region?: string | null;
    topic?: string | null;
    timePeriodLabel?: string | null;
    timePeriodStart?: number | null;
    timePeriodEnd?: number | null;
    collectionId?: string | null;
    description?: string | null;
    displayPreference?: DisplayPreference;
  }
) {
  const user = await requireUser();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { contributorId: true, title: true, slug: true },
  });

  if (!story || story.contributorId !== user.id) {
    throw new Error("Unauthorized to edit this story");
  }

  // Update slug if title changed meaningfully
  let newSlug = story.slug;
  if (data.title && data.title !== story.title && data.title !== "Untitled Oral Memory") {
    const candidate = slugify(data.title, { lower: true, strict: true }).slice(0, 50);
    if (candidate) {
      const exists = await prisma.story.findFirst({
        where: { slug: candidate, id: { not: storyId } },
      });
      newSlug = exists ? `${candidate}-${Date.now().toString(36)}` : candidate;
    }
  }

  const updated = await prisma.story.update({
    where: { id: storyId },
    data: {
      ...data,
      slug: newSlug,
    },
  });

  return { success: true, story: updated };
}

export async function updateStoryConsent(
  storyId: string,
  data: {
    permission: StoryPermission;
    displayPreference: DisplayPreference;
  }
) {
  const user = await requireUser();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { contributorId: true, permission: true, displayPreference: true },
  });

  if (!story || story.contributorId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Record consent change in audit log
  await prisma.consentLog.create({
    data: {
      storyId,
      userId: user.id,
      oldPermission: story.permission,
      newPermission: data.permission,
      oldDisplay: story.displayPreference,
      newDisplay: data.displayPreference,
    },
  });

  await prisma.story.update({
    where: { id: storyId },
    data: {
      permission: data.permission,
      displayPreference: data.displayPreference,
    },
  });

  return { success: true };
}

export async function submitStoryForModeration(storyId: string) {
  const user = await requireUser();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.contributorId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (!story.title || story.title === "Untitled Oral Memory") {
    throw new Error("Please enter a meaningful title for your story");
  }

  if (!story.audioKey) {
    throw new Error("Audio recording is required to submit");
  }

  await prisma.story.update({
    where: { id: storyId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await prisma.moderationLog.create({
    data: {
      storyId,
      adminId: user.id,
      action: "STATUS_CHANGE",
      note: "Submitted by contributor for archival review",
    },
  });

  return { success: true };
}

export async function deleteStoryDraft(storyId: string) {
  const user = await requireUser();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.contributorId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (story.status !== "DRAFT" && story.status !== "REJECTED") {
    throw new Error("Only draft or rejected stories can be directly deleted");
  }

  await prisma.story.delete({
    where: { id: storyId },
  });

  return { success: true };
}
