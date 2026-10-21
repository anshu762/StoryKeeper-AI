import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDistanceToNow, format } from "date-fns";
import { StoryStatus, StoryPermission } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AdminStoriesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    permission?: string;
    page?: string;
  }>;
}

export default async function AdminStoriesPage(props: AdminStoriesPageProps) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const search = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status || "";
  const permissionFilter = searchParams.permission || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (statusFilter && Object.values(StoryStatus).includes(statusFilter as StoryStatus)) {
    where.status = statusFilter as StoryStatus;
  }

  if (permissionFilter && Object.values(StoryPermission).includes(permissionFilter as StoryPermission)) {
    where.permission = permissionFilter as StoryPermission;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { contributor: { name: { contains: search, mode: "insensitive" } } },
      { contributor: { email: { contains: search, mode: "insensitive" } } },
      { originalLanguage: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, stories] = await Promise.all([
    prisma.story.count({ where }),
    prisma.story.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        contributor: {
          select: { id: true, name: true, email: true },
        },
        collection: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Oral History Archive"
        title="All System Stories"
        description="Comprehensive repository of all stories in the database across drafts, pending reviews, active publications, and archived recordings."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search stories, contributors, or languages..."
            className="pl-9 text-xs bg-white border-line h-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 text-xs border-line bg-white">
            <Link href="/admin/stories">Clear Filters</Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white shadow-warm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-paper-2 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
              <th className="py-3.5 px-4">Title</th>
              <th className="py-3.5 px-4">Contributor</th>
              <th className="py-3.5 px-4">Language</th>
              <th className="py-3.5 px-4">Permission</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 text-xs">
            {stories.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted">
                  No stories found matching your filter criteria.
                </td>
              </tr>
            ) : (
              stories.map((story) => (
                <tr key={story.id} className="hover:bg-paper/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-ink max-w-xs truncate">
                    <Link
                      href={`/admin/stories/${story.id}`}
                      className="hover:text-terracotta transition-colors"
                    >
                      {story.title}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-ink block">
                      {story.contributor.name}
                    </span>
                    <span className="text-[10px] text-muted">
                      {story.contributor.email}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-paper-2 px-2 py-0.5 rounded text-[11px] border border-line text-ink">
                      {story.originalLanguage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {story.permission}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={story.status} />
                  </td>

                  <td className="py-3.5 px-4 text-muted text-[11px]">
                    {format(new Date(story.createdAt), "MMM d, yyyy")}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button asChild size="sm" variant="outline" className="text-xs h-7 border-line bg-white">
                      <Link href={`/admin/stories/${story.id}`}>
                        <span>Edit / Review</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted pt-2">
          <span>
            Page {page} of {totalPages} ({total} stories)
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs border-line bg-white">
                <Link href={`/admin/stories?page=${page - 1}&q=${encodeURIComponent(search)}`}>
                  Previous
                </Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild variant="outline" size="sm" className="h-8 text-xs border-line bg-white">
                <Link href={`/admin/stories?page=${page + 1}&q=${encodeURIComponent(search)}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
