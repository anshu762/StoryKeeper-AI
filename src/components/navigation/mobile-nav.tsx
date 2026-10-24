"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Mic,
  Compass,
  Search,
  Layers,
  Clock,
  Info,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const user = session?.user;
  const role = (user as unknown as { role?: string })?.role || "CONTRIBUTOR";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        className="rounded-xl h-9 w-9 p-0 hover:bg-paper-2"
      >
        {isOpen ? <X className="h-5 w-5 text-ink" /> : <Menu className="h-5 w-5 text-ink" />}
      </Button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-16 bg-ink/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Slide-down Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-line bg-paper/98 backdrop-blur-xl p-5 shadow-warm-lg animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-4">
            {/* User Profile or Auth Prompt */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-paper-2/70 border border-line flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white font-serif text-sm font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-line text-terracotta shrink-0">
                  {role}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-line/60">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-white justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="rounded-xl justify-center shadow-xs"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/register">Join Archive</Link>
                </Button>
              </div>
            )}

            {/* Primary Action Button */}
            <div>
              <Button
                asChild
                variant="default"
                className="w-full justify-center rounded-xl shadow-warm py-2.5"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/dashboard/stories/new">
                  <Mic className="h-4 w-4 mr-2" />
                  <span>Record & Share a Story</span>
                </Link>
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 pt-1">
              <Link
                href="/archive"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
              >
                <Compass className="h-4 w-4 text-terracotta" />
                <span>Explore Archive</span>
              </Link>
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
              >
                <Search className="h-4 w-4 text-terracotta" />
                <span>Search & Ask Archive</span>
              </Link>
              <Link
                href="/collections"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
              >
                <Layers className="h-4 w-4 text-saffron" />
                <span>Curated Collections</span>
              </Link>
              <Link
                href="/timeline"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
              >
                <Clock className="h-4 w-4 text-moss" />
                <span>Decade Timeline</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
              >
                <Info className="h-4 w-4 text-plum" />
                <span>About & Ethics</span>
              </Link>
            </div>

            {/* Logged in User Shortcuts */}
            {user && (
              <div className="pt-2 border-t border-line space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-terracotta" />
                  <span>My Preserved Stories</span>
                </Link>

                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-moss" />
                    <span>Admin Moderation Console</span>
                  </Link>
                )}

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-paper-2 transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted" />
                  <span>Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 text-sm font-medium text-destructive hover:bg-destructive/10 py-2.5 px-3 rounded-xl transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
