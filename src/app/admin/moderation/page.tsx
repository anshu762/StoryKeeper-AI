import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { getModerationQueue } from "@/server/actions/admin";

export const dynamic = "force-dynamic";

interface ModerationPageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    lang?: string;
    page?: string;
  }>;
}

export default async function AdminModerationPage(props: ModerationPageProps) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || "submitted";
  const search = searchParams.q || "";
  const language = searchParams.lang || "";
  const page = parseInt(searchParams.page || "1", 10);

  const { stories, pagination } = await getModerationQueue({
    statusTab: currentTab,
    search,
    language,
    page,
    limit: 15,
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Editorial Moderation"
        title="Oral History Review Queue"
        description="Verify human review standards, check consent choices, validate bilingual transcripts, and approve stories into the public archive."
      />

      <ModerationQueue
        initialStories={stories}
        initialPagination={pagination}
        currentTab={currentTab}
      />
    </div>
  );
}
