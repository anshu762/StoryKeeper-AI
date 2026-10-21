import React from "react";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { getSignedDownloadUrl } from "@/lib/storage";
import { StoryDetailManager } from "@/components/studio/story-detail-manager";

interface StoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Story Status & Submission | StoryKeeper Studio",
  description: "Track oral history submission, review admin notes, and manage story consent.",
};

export default async function StoryStatusPage({ params }: StoryDetailPageProps) {
  const user = await requireUser();
  const { id: storyId } = await params;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      themes: { include: { theme: true } },
      keywords: { include: { keyword: true } },
      moderationLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!story) {
    notFound();
  }

  // Contributor authorization guard
  if (story.contributorId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const signedAudioUrl = story.audioKey
    ? await getSignedDownloadUrl(story.audioKey)
    : "/samples/sample.mp3";

  return (
    <div className="space-y-6">
      <StoryDetailManager story={story} signedAudioUrl={signedAudioUrl} />
    </div>
  );
}
