import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { getStoryForModeration } from "@/server/actions/admin";
import { getSignedDownloadUrl } from "@/lib/storage";
import { StoryCurationStudio } from "@/components/admin/story-curation-studio";

export const dynamic = "force-dynamic";

interface StoryReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminStoryReviewPage(props: StoryReviewPageProps) {
  await requireAdmin();
  const { id } = await props.params;

  let story;
  try {
    story = await getStoryForModeration(id);
  } catch {
    notFound();
  }

  if (!story) {
    notFound();
  }

  // Get signed download URL if audioKey exists
  let audioUrl: string | null = null;
  if (story.audioKey) {
    try {
      audioUrl = await getSignedDownloadUrl(story.audioKey, 3600);
    } catch (e) {
      console.warn("Could not sign audio download URL for story:", e);
    }
  }

  // Fetch available collections and themes for assignment
  const [availableCollections, availableThemes] = await Promise.all([
    prisma.collection.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.theme.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <StoryCurationStudio
      story={story}
      audioUrl={audioUrl}
      availableCollections={availableCollections}
      availableThemes={availableThemes}
    />
  );
}
