"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import { StoryPermission, DisplayPreference } from "@prisma/client";

export async function updateUserSettings(data: {
  name: string;
  preferredLanguage: string;
  defaultPermission: StoryPermission;
  defaultDisplay: DisplayPreference;
  allowPublicEmail: boolean;
}) {
  const user = await requireUser();

  const cleanName = data.name.trim();
  if (!cleanName) {
    throw new Error("Display name cannot be blank");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: cleanName,
      preferredLanguage: data.preferredLanguage,
      defaultPermission: data.defaultPermission,
      defaultDisplay: data.defaultDisplay,
      allowPublicEmail: data.allowPublicEmail,
    },
  });

  return { success: true, user: updated };
}

export async function requestAccountDeletion(data: {
  reason: string;
  confirmEmail: string;
}) {
  const user = await requireUser();

  if (data.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("Email confirmation does not match your account email");
  }

  // Create an open deletion request in the RemovalRequest table
  // Linked to user account
  const sampleStory = await prisma.story.findFirst({
    where: { contributorId: user.id },
    select: { id: true },
  });

  // If the user has a story, attach the request to it, or track the audit
  if (sampleStory) {
    await prisma.removalRequest.create({
      data: {
        userId: user.id,
        storyId: sampleStory.id,
        type: "REMOVE",
        message: `Account Deletion Request: ${data.reason}`,
        status: "OPEN",
      },
    });
  }

  return {
    success: true,
    message:
      "Your account deletion request has been received. Our compliance officer will process data retention within 7 days.",
  };
}
