import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { RequestsQueue } from "@/components/admin/requests-queue";
import { getAdminRequests } from "@/server/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { removalRequests, storyReports } = await getAdminRequests();

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Ethics & Compliance"
        title="Removal Requests & Community Reports"
        description="Review contributor requests to withdraw oral histories and investigate visitor concern reports in accordance with our community ethics charter."
      />

      <RequestsQueue
        removalRequests={removalRequests}
        storyReports={storyReports}
      />
    </div>
  );
}
