"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  Loader2,
  Mail,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserRole, toggleUserStatus } from "@/server/actions/admin";
import { adminPurgeUser } from "@/server/actions/retention";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredLanguage: string;
  defaultPermission: string;
  defaultDisplay: string;
  deletedAt: Date | string | null;
  createdAt: Date | string;
  _count: {
    stories: number;
  };
}

interface UserDirectoryProps {
  initialUsers: UserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentAdminId: string;
}

export function UserDirectory({
  initialUsers,
  pagination,
  currentAdminId,
}: UserDirectoryProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Immediate purge dialog state
  const [purgeUserTarget, setPurgeUserTarget] = useState<UserItem | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const handleRoleToggle = async (user: UserItem) => {
    const nextRole: UserRole = user.role === "ADMIN" ? "CONTRIBUTOR" : "ADMIN";
    setLoadingUserId(user.id);
    try {
      await updateUserRole(user.id, nextRole);
      toast.success(
        `Role updated: ${user.name} is now a ${nextRole.toLowerCase()}`
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleStatusToggle = async (user: UserItem) => {
    const willActivate = user.deletedAt !== null;
    setLoadingUserId(user.id);
    try {
      await toggleUserStatus(user.id, willActivate);
      toast.success(
        willActivate
          ? `User ${user.name} reactivated`
          : `User ${user.name} deactivated`
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handlePurgeNow = async (disposition: "DELETE_ALL" | "KEEP_ANONYMOUS") => {
    if (!purgeUserTarget) return;
    setIsPurging(true);
    try {
      const res = await adminPurgeUser(purgeUserTarget.id, disposition);
      toast.success(res.message);
      setPurgeUserTarget(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to purge user");
    } finally {
      setIsPurging(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (roleFilter && u.role !== roleFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-9 text-xs bg-white border-line h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-white border border-line rounded-xl px-3 py-2 text-ink h-9"
          >
            <option value="">All Roles</option>
            <option value="CONTRIBUTOR">Contributors</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white shadow-warm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-paper-2 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Stories</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 text-xs">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentAdminId;
                const isDeactivated = u.deletedAt !== null;
                const isLoading = loadingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink flex items-center gap-1.5">
                          {u.name}
                          {isSelf && (
                            <span className="text-[10px] bg-terracotta/10 text-terracotta font-bold px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-muted">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-ink font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-muted" />
                        <span>{u._count.stories}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isDeactivated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                          <UserX className="h-3.5 w-3.5" />
                          <span>Deactivated / Pending Purge</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-moss font-medium">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted text-[11px]">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Role Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading || (isSelf && u.role === "ADMIN")}
                          onClick={() => handleRoleToggle(u)}
                          className="h-7 text-[11px] border-line bg-white"
                          title={
                            isSelf
                              ? "You cannot demote yourself"
                              : u.role === "ADMIN"
                              ? "Demote to Contributor"
                              : "Promote to Admin"
                          }
                        >
                          {u.role === "ADMIN" ? "Demote" : "Make Admin"}
                        </Button>

                        {/* Toggle Deactivation Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading || isSelf}
                          onClick={() => handleStatusToggle(u)}
                          className="h-7 text-[11px] border-line bg-white"
                        >
                          {isDeactivated ? "Reactivate" : "Deactivate"}
                        </Button>

                        {/* GDPR Immediate Purge Button (Available for deactivated accounts) */}
                        {isDeactivated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPurgeUserTarget(u)}
                            className="h-7 text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span>Purge</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* GDPR Purge Dialog */}
      {purgeUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Immediate GDPR / Data Purge</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are about to permanently purge the account of <strong>{purgeUserTarget.name}</strong> ({purgeUserTarget.email}). Choose how their stories should be handled:
            </p>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs text-red-700 border-red-200 hover:bg-red-50 h-auto py-2.5"
                disabled={isPurging}
                onClick={() => handlePurgeNow("DELETE_ALL")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Purge Account & All Audio Recordings
                  </span>
                  <span className="text-[10px] text-red-600/80 block text-left">
                    Permanently deletes all recordings from Cloudflare R2 and removes all story records.
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs text-moss border-moss/30 hover:bg-moss/5 h-auto py-2.5"
                disabled={isPurging}
                onClick={() => handlePurgeNow("KEEP_ANONYMOUS")}
              >
                <div>
                  <span className="font-semibold block text-left">
                    Purge Account & Preserve Public Stories Anonymously
                  </span>
                  <span className="text-[10px] text-muted-foreground block text-left">
                    Deletes user identity, preserves published stories anonymously. Drafts and private stories are deleted.
                  </span>
                </div>
              </Button>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPurgeUserTarget(null)}
                className="border-line text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
