import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { UserDirectory } from "@/components/admin/user-directory";
import { getAdminUsers } from "@/server/actions/admin";
import { requireAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
  const currentAdmin = await requireAdmin();
  const searchParams = await props.searchParams;

  const search = searchParams.q || "";
  const role = searchParams.role || "";
  const page = parseInt(searchParams.page || "1", 10);

  const { users, pagination } = await getAdminUsers({
    search,
    role,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="Community Governance"
        title="User & Contributor Directory"
        description="Manage contributor privileges, promote administrators with strict demotion safeguards, and review account retention status."
      />

      <UserDirectory
        initialUsers={users}
        pagination={pagination}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
