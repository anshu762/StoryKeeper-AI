import React from "react";
import { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { ContributorStoriesList } from "@/components/studio/contributor-stories-list";

export const metadata: Metadata = {
  title: "My Recorded Stories | StoryKeeper Studio",
  description: "Browse and manage your drafts, processing jobs, and submitted oral history recordings.",
};

export default async function ContributorStoriesPage() {
  const user = await requireUser();

  const rawStories = await prisma.story.findMany({
    where: {
      contributorId: user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      permission: true,
      originalLanguage: true,
      audioDurationSec: true,
      createdAt: true,
      updatedAt: true,
      themes: {
        select: {
          theme: { select: { name: true, slug: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Archives"
        title="Your Contributed Stories"
        description="Track the status of all your audio recordings, from raw audio drafts to public preservation."
      />

      <ContributorStoriesList stories={rawStories} />
    </div>
  );
}
