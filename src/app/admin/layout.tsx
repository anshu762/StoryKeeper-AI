import React from "react";
import Link from "next/link";
import {
  Shield,
  CheckSquare,
  BookOpen,
  Layers,
  Users,
  Cpu,
  AlertCircle,
  BarChart3,
  Download,
  ArrowLeft,
} from "lucide-react";
import { requireAdmin } from "@/lib/permissions";
import { UserMenu } from "@/components/navigation/user-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Admin Desktop Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-line bg-[#1E1916] text-[#FBF7F0] p-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-white">
                StoryKeeper
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-saffron uppercase">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Shield className="h-4 w-4 text-saffron shrink-0" />
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/moderation"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <CheckSquare className="h-4 w-4 text-moss shrink-0" />
              <span>Moderation Queue</span>
            </Link>
            <Link
              href="/admin/stories"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-terracotta shrink-0" />
              <span>All Stories</span>
            </Link>
            <Link
              href="/admin/collections"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Layers className="h-4 w-4 text-saffron shrink-0" />
              <span>Collections</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Users className="h-4 w-4 text-sky-400 shrink-0" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/jobs"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Cpu className="h-4 w-4 text-purple-400 shrink-0" />
              <span>AI Pipeline Jobs</span>
            </Link>
            <Link
              href="/admin/requests"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>Requests & Reports</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/admin/export"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Download className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Researcher Export</span>
            </Link>
          </nav>
        </div>

        {/* Return to Dashboard */}
        <div className="pt-6 border-t border-white/10 mt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Contributor Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-line bg-white/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-moss">
              ● Administrative Control
            </span>
          </div>

          <UserMenu />
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
