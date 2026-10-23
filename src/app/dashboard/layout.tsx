import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Mic,
  Settings,
  Radio,
  ArrowLeft,
  Shield,
  Layers,
} from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { UserMenu } from "@/components/navigation/user-menu";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar (Sticky) */}
      <aside className="hidden md:flex md:w-64 flex-col justify-between border-r border-line bg-paper-2/60 p-6 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto scrollbar-none z-20">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta text-white shadow-sm">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-ink">
                StoryKeeper<span className="text-terracotta">.ai</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                Contributor Studio
              </span>
            </div>
          </Link>

          {/* Quick Action: New Story */}
          <Button asChild variant="default" className="w-full justify-start rounded-xl">
            <Link href="/dashboard/stories/new">
              <Mic className="h-4 w-4 mr-2" />
              <span>Record a Story</span>
            </Link>
          </Button>

          {/* Nav Links */}
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-white/80 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-terracotta" />
              <span>My Stories</span>
            </Link>
            <Link
              href="/dashboard/stories/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-white/80 transition-colors"
            >
              <Mic className="h-4 w-4 text-saffron" />
              <span>New Recording</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-white/80 transition-colors"
            >
              <Settings className="h-4 w-4 text-muted" />
              <span>Consent & Settings</span>
            </Link>

            {user.role === "ADMIN" && (
              <div className="pt-4 mt-4 border-t border-line">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-moss hover:bg-moss-subtle transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Return to Public Archive */}
        <div className="pt-6 border-t border-line">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Archive</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-line bg-paper/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta text-white">
                <Radio className="h-3.5 w-3.5" />
              </div>
              <span className="font-serif font-bold text-ink">StoryKeeper</span>
            </div>
            <span className="hidden md:inline-block text-xs font-semibold uppercase tracking-wider text-muted">
              Contributor Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-line flex items-center justify-around h-16 px-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-1 text-ink py-1 px-3 text-xs font-medium"
        >
          <BookOpen className="h-4 w-4 text-terracotta" />
          <span>Stories</span>
        </Link>
        <Link
          href="/dashboard/stories/new"
          className="flex flex-col items-center justify-center gap-1 text-ink py-1 px-3 text-xs font-medium"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-white">
            <Mic className="h-3.5 w-3.5" />
          </div>
          <span>Record</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex flex-col items-center justify-center gap-1 text-ink py-1 px-3 text-xs font-medium"
        >
          <Settings className="h-4 w-4 text-muted" />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
