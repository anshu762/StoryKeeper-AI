"use server";

import { prisma } from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/permissions";
import { deleteAudioObject } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export type RetentionDisposition = "DELETE_ALL" | "KEEP_ANONYMOUS";

/**
 * Contributor requests account deletion with retention disposition.
 * Starts a 30-day grace period.
 */
export async function requestAccountDeletion(params: {
  disposition: RetentionDisposition;
  reason?: string;
  confirmEmail: string;
}) {
  const user = await requireUser();

  if (params.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("Confirmation email does not match your current account email.");
  }

  // Set deletedAt to start the 30-day grace period
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
    },
  });

  // Track the request in RemovalRequest
  const anyStory = await prisma.story.findFirst({
    where: { contributorId: user.id },
    select: { id: true },
  });

  if (anyStory) {
    await prisma.removalRequest.create({
      data: {
        userId: user.id,
        storyId: anyStory.id,
        type: "REMOVE",
        message: `Account Deletion Request (${params.disposition}): ${
          params.reason || "Contributor initiated account deletion"
        }`,
        status: "OPEN",
      },
    });
  }

  return {
    success: true,
    deletedAt: updatedUser.deletedAt,
    message:
      "Your deletion request has been scheduled. You have a 30-day grace period during which you can cancel by logging in. After 30 days, your account and audio will be permanently processed according to your chosen retention preference.",
  };
}

/**
 * Cancel pending account deletion during the 30-day grace period.
 */
export async function cancelAccountDeletion() {
  const user = await requireUser();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: null },
  });

  return {
    success: true,
    message: "Your account deletion request has been cancelled. Welcome back!",
  };
}

/**
 * Executes permanent purging for a single user according to their disposition.
 * Can be triggered immediately by Admin or after 30 days by cron worker.
 */
export async function executeUserPurge(
  userId: string,
  disposition: RetentionDisposition = "DELETE_ALL"
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stories: true,
    },
  });

  if (!targetUser) {
    return { success: false, message: "User not found" };
  }

  let purgedStoriesCount = 0;
  let anonymizedStoriesCount = 0;

  if (disposition === "DELETE_ALL") {
    // Delete all stories and their audio files permanently
    for (const story of targetUser.stories) {
      if (story.audioKey) {
        await deleteAudioObject(story.audioKey);
      }
      // Delete story record (cascading keyword/theme/log relations)
      await prisma.story.delete({
        where: { id: story.id },
      });
      purgedStoriesCount++;
    }
  } else {
    // KEEP_ANONYMOUS:
    // Only published stories are preserved anonymously; delete drafts and private stories
    for (const story of targetUser.stories) {
      if (story.status === "PUBLISHED" && story.permission === "PUBLIC") {
        // Anonymize the story
        await prisma.story.update({
          where: { id: story.id },
          data: {
            displayPreference: "ANONYMOUS",
          },
        });
        anonymizedStoriesCount++;
      } else {
        // Purge non-public drafts/research
        if (story.audioKey) {
          await deleteAudioObject(story.audioKey);
        }
        await prisma.story.delete({
          where: { id: story.id },
        });
        purgedStoriesCount++;
      }
    }
  }

  // Delete user sessions and accounts
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  // If keeping anonymous stories, we cannot hard-delete User if foreign keys require it
  // unless we either soft-delete permanently or reassign.
  if (anonymizedStoriesCount > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "Anonymous Contributor",
        email: `anonymized-${userId}@deleted.storykeeper.internal`,
        allowPublicEmail: false,
        deletedAt: new Date(0), // marked permanently purged epoch
      },
    });
  } else {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  try {
    revalidatePath("/archive");
    revalidatePath("/search");
  } catch (e) {
    console.warn("Revalidation warning during purge:", e);
  }

  return {
    success: true,
    purgedStoriesCount,
    anonymizedStoriesCount,
    message: `Account purged: ${purgedStoriesCount} stories deleted, ${anonymizedStoriesCount} stories anonymized.`,
  };
}

/**
 * Admin action: Purge a deactivated / requested account immediately (GDPR compliance).
 */
export async function adminPurgeUser(
  userId: string,
  disposition: RetentionDisposition = "DELETE_ALL"
) {
  await requireAdmin();
  return executeUserPurge(userId, disposition);
}

/**
 * Retention worker: Purges all users whose 30-day grace period has expired.
 */
export async function purgeExpiredDeletions() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Find users whose deletion grace period has expired (and who are not already permanently anonymized epoch)
  const expiredUsers = await prisma.user.findMany({
    where: {
      deletedAt: {
        lte: thirtyDaysAgo,
        gt: new Date(1000), // Exclude epoch marker
      },
    },
    select: { id: true, defaultDisplay: true },
  });

  const results = [];
  for (const u of expiredUsers) {
    const disposition: RetentionDisposition =
      u.defaultDisplay === "ANONYMOUS" ? "KEEP_ANONYMOUS" : "DELETE_ALL";
    const res = await executeUserPurge(u.id, disposition);
    results.push({ userId: u.id, ...res });
  }

  return {
    success: true,
    processedCount: expiredUsers.length,
    results,
  };
}
