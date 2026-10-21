import React from "react";
import Link from "next/link";
import {
  CheckSquare,
  BookOpen,
  FileEdit,
  Cpu,
  AlertCircle,
  Users,
  Layers,
  BarChart3,
  Download,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { getAdminOverviewMetrics } from "@/server/actions/admin";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const metrics = await getAdminOverviewMetrics();

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="System Administration"
        title="Curator & Admin Console"
        description="Oversee oral history moderation, monitor AI transcription & translation pipelines, steward community consent, and manage ethical dataset exports."
        action={
          <div className="flex flex-wrap gap-2.5">
            <Button asChild variant="moss">
              <Link href="/admin/moderation">
                <CheckSquare className="h-4 w-4 mr-2" />
                <span>Review Queue ({metrics.pendingCount})</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-line bg-white shadow-2xs">
              <Link href="/admin/analytics">
                <BarChart3 className="h-4 w-4 mr-2 text-moss" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Pending Review */}
        <Link
          href="/admin/moderation"
          className="group rounded-2xl border border-line bg-white p-5 shadow-warm hover:border-terracotta/40 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Pending Review
              </span>
              <CheckSquare className="h-4 w-4 text-terracotta" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {metrics.pendingCount}
            </p>
          </div>
          <span className="text-[11px] text-muted group-hover:text-terracotta transition-colors mt-2 block font-medium">
            Submitted stories &rarr;
          </span>
        </Link>

        {/* Public Archive */}
        <Link
          href="/admin/stories"
          className="group rounded-2xl border border-line bg-white p-5 shadow-warm hover:border-moss/40 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Published
              </span>
              <BookOpen className="h-4 w-4 text-moss" />
            </div>
            <p className="font-serif text-3xl font-bold text-moss mt-2">
              {metrics.publishedCount}
            </p>
          </div>
          <span className="text-[11px] text-muted group-hover:text-moss transition-colors mt-2 block font-medium">
            Public stories &rarr;
          </span>
        </Link>

        {/* Drafts in Progress */}
        <Link
          href="/admin/stories"
          className="group rounded-2xl border border-line bg-white p-5 shadow-warm hover:border-saffron/40 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Drafts
              </span>
              <FileEdit className="h-4 w-4 text-saffron" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {metrics.draftsCount}
            </p>
          </div>
          <span className="text-[11px] text-muted group-hover:text-saffron transition-colors mt-2 block font-medium">
            Active recordings &rarr;
          </span>
        </Link>

        {/* Failed AI Jobs */}
        <Link
          href="/admin/jobs"
          className={`group rounded-2xl border p-5 shadow-warm transition-all flex flex-col justify-between ${
            metrics.failedJobsCount > 0
              ? "bg-red-50/50 border-red-200 hover:border-red-400"
              : "bg-white border-line hover:border-purple-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Failed AI Jobs
              </span>
              <Cpu className={`h-4 w-4 ${metrics.failedJobsCount > 0 ? "text-red-500" : "text-purple-500"}`} />
            </div>
            <p className={`font-serif text-3xl font-bold mt-2 ${metrics.failedJobsCount > 0 ? "text-red-600" : "text-ink"}`}>
              {metrics.failedJobsCount}
            </p>
          </div>
          <span className={`text-[11px] mt-2 block font-medium ${metrics.failedJobsCount > 0 ? "text-red-600" : "text-muted"}`}>
            Pipeline inspector &rarr;
          </span>
        </Link>

        {/* Open Removal Requests */}
        <Link
          href="/admin/requests"
          className={`group rounded-2xl border p-5 shadow-warm transition-all flex flex-col justify-between ${
            metrics.openRequestsCount > 0
              ? "bg-amber-50/50 border-amber-200 hover:border-amber-400"
              : "bg-white border-line hover:border-amber-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Ethics Requests
              </span>
              <AlertCircle className={`h-4 w-4 ${metrics.openRequestsCount > 0 ? "text-amber-600" : "text-muted"}`} />
            </div>
            <p className={`font-serif text-3xl font-bold mt-2 ${metrics.openRequestsCount > 0 ? "text-amber-700" : "text-ink"}`}>
              {metrics.openRequestsCount}
            </p>
          </div>
          <span className={`text-[11px] mt-2 block font-medium ${metrics.openRequestsCount > 0 ? "text-amber-700" : "text-muted"}`}>
            Removal & reports &rarr;
          </span>
        </Link>

        {/* Total Contributors */}
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-line bg-white p-5 shadow-warm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-muted">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Community
              </span>
              <Users className="h-4 w-4 text-sky-500" />
            </div>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {metrics.totalUsersCount}
            </p>
          </div>
          <span className="text-[11px] text-muted group-hover:text-sky-600 transition-colors mt-2 block font-medium">
            User directory &rarr;
          </span>
        </Link>
      </div>

      {/* Quick Curator Tools Band */}
      <div className="bg-paper-2 border border-line rounded-2xl p-6 shadow-xs">
        <h3 className="font-serif text-base font-bold text-ink mb-3">
          Quick Administrative Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button asChild variant="outline" className="border-line bg-white justify-start text-xs h-10 shadow-2xs">
            <Link href="/admin/collections">
              <Layers className="h-3.5 w-3.5 mr-2 text-saffron shrink-0" />
              <span>Manage Collections</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-line bg-white justify-start text-xs h-10 shadow-2xs">
            <Link href="/admin/jobs">
              <Cpu className="h-3.5 w-3.5 mr-2 text-purple-500 shrink-0" />
              <span>Retry AI Jobs</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-line bg-white justify-start text-xs h-10 shadow-2xs">
            <Link href="/admin/requests">
              <ShieldAlert className="h-3.5 w-3.5 mr-2 text-red-500 shrink-0" />
              <span>Review Requests</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-line bg-white justify-start text-xs h-10 shadow-2xs">
            <Link href="/admin/analytics">
              <BarChart3 className="h-3.5 w-3.5 mr-2 text-moss shrink-0" />
              <span>Search Insights</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-line bg-white justify-start text-xs h-10 shadow-2xs">
            <Link href="/admin/export">
              <Download className="h-3.5 w-3.5 mr-2 text-terracotta shrink-0" />
              <span>Dataset Export</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Two Column Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moderation History */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-warm">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <h3 className="font-serif text-base font-bold text-ink">
              Recent Moderation Actions
            </h3>
            <Link
              href="/admin/moderation"
              className="text-xs text-moss hover:underline font-medium flex items-center gap-1"
            >
              <span>Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-line/60">
            {metrics.recentModerationLogs.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                No recent moderation actions recorded.
              </p>
            ) : (
              metrics.recentModerationLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-ink/80 truncate">
                    Story:{" "}
                    <Link
                      href={`/admin/stories/${log.story.id}`}
                      className="font-medium text-terracotta hover:underline"
                    >
                      {log.story.title}
                    </Link>
                  </p>
                  {log.note && (
                    <p className="text-[11px] text-muted italic bg-paper-2 px-2.5 py-1 rounded-md border border-line/60">
                      &ldquo;{log.note}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] text-muted">
                    Curator: {log.admin.name} ({log.admin.email})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consent & Ethics Stream */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-warm">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <h3 className="font-serif text-base font-bold text-ink">
              Recent Contributor Consent Changes
            </h3>
            <Link
              href="/admin/requests"
              className="text-xs text-moss hover:underline font-medium flex items-center gap-1"
            >
              <span>Ethics center</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-line/60">
            {metrics.recentConsentLogs.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                No recent consent adjustments recorded.
              </p>
            ) : (
              metrics.recentConsentLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">
                      Permission: {log.oldPermission} &rarr; {log.newPermission}
                    </span>
                    <span className="text-[11px] text-muted">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-ink/80 truncate">
                    Story:{" "}
                    <Link
                      href={`/admin/stories/${log.story.id}`}
                      className="font-medium text-terracotta hover:underline"
                    >
                      {log.story.title}
                    </Link>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Attribution: {log.newDisplay}</span>
                    <span>By: {log.user.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
