import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { AiJobsInspector } from "@/components/admin/ai-jobs-inspector";
import { getAdminAiJobs } from "@/server/actions/admin";

export const dynamic = "force-dynamic";

interface AdminJobsPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminJobsPage(props: AdminJobsPageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status || "";
  const type = searchParams.type || "";
  const page = parseInt(searchParams.page || "1", 10);

  const { jobs, pagination } = await getAdminAiJobs({
    status,
    type,
    page,
    limit: 25,
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Pipeline Observability"
        title="AI Processing Jobs & Recovery"
        description="Inspect speech-to-text, translation, and metadata extraction jobs, debug stack traces, and recover failed or stuck pipeline tasks."
      />

      <AiJobsInspector
        initialJobs={jobs}
        pagination={pagination}
        currentStatus={status}
        currentType={type}
      />
    </div>
  );
}
