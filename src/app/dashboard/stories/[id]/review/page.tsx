import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/storage";
import { PageHeader } from "@/components/common/page-header";
import { StoryReviewEditor } from "@/components/studio/story-review-editor";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Review & Refine AI Output | StoryKeeper Studio",
  description:
    "Review and edit speech-to-text transcripts, English translations, and cultural tags before moderation.",
};

export default async function StoryReviewPage({ params }: ReviewPageProps) {
  const user = await requireUser();
  const { id: storyId } = await params;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      themes: { include: { theme: true } },
      keywords: { include: { keyword: true } },
    },
  });

  if (!story) {
    notFound();
  }

  // Enforce contributor ownership
  if (story.contributorId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get signed download URL for private audio stream
  const signedAudioUrl = story.audioKey
    ? await getSignedDownloadUrl(story.audioKey)
    : "/samples/sample.mp3";

  const availableThemes = await prisma.theme.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review Studio"
        title="Review & Polish Oral Memory"
        description="Every AI-generated transcript and translation is fully editable. Listen to the audio and adjust phrasing before submitting."
      />

      <StoryReviewEditor
        story={story}
        availableThemes={availableThemes}
        signedAudioUrl={signedAudioUrl}
      />
    </div>
  );
}
