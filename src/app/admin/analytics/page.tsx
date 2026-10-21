import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { getArchiveAnalytics } from "@/server/actions/analytics";

export const dynamic = "force-dynamic";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{
    period?: "7d" | "30d" | "all";
  }>;
}

export default async function AdminAnalyticsPage(props: AdminAnalyticsPageProps) {
  const searchParams = await props.searchParams;
  const period = searchParams.period || "30d";

  const data = await getArchiveAnalytics(period);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Intelligence & Archive Metrics"
        title="Oral History Archive Analytics"
        description="Monitor community listener activity, discover trending cultural queries, and analyze thematic and geographical coverage across the digital repository."
      />

      <AnalyticsCharts data={data} currentPeriod={period} />
    </div>
  );
}
