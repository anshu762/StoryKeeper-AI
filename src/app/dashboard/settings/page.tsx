import React from "react";
import { Metadata } from "next";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { SettingsManager } from "@/components/studio/settings-manager";

export const metadata: Metadata = {
  title: "Consent & Account Settings | StoryKeeper Studio",
  description: "Configure your contributor display name, default consent tier, and privacy preferences.",
};

export default async function SettingsPage() {
  const sessionUser = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      preferredLanguage: true,
      defaultPermission: true,
      defaultDisplay: true,
      allowPublicEmail: true,
    },
  });

  if (!user) {
    throw new Error("User record not found");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Consent & Account Settings"
        description="Set your default archive visibility, attribution preferences, and manage personal data rights."
      />

      <SettingsManager user={user} />
    </div>
  );
}
