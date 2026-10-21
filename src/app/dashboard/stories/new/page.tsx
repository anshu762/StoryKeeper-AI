import React from "react";
import { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { StoryCreationWizard } from "@/components/studio/story-creation-wizard";

export const metadata: Metadata = {
  title: "Record or Add Story | StoryKeeper Studio",
  description:
    "Record oral histories in browser or upload audio files to preserve community memories.",
};

export default async function NewStoryPage() {
  const user = await requireUser();

  const [collections, userProfile] = await Promise.all([
    prisma.collection.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, slug: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        preferredLanguage: true,
        defaultPermission: true,
        defaultDisplay: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Oral History Studio"
        title="Contribute a Living Memory"
        description="Preserve a first-person oral recollection. Record audio, provide regional context, and choose explicit consent."
      />

      <StoryCreationWizard
        collections={collections}
        userPreferredLanguage={userProfile?.preferredLanguage || "Hindi"}
        userDefaultPermission={userProfile?.defaultPermission || "PUBLIC"}
        userDefaultDisplay={userProfile?.defaultDisplay || "NAMED"}
      />
    </div>
  );
}
