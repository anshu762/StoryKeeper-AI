"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Radio,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
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

  const drawerElement =
    mounted && isOpen ? (
      <div className="fixed inset-0 z-[9999] md:hidden">
        {/* 1. Backdrop Overlay */}
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#1F1A17]/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />

        {/* 2. Slide-over Sheet (100% Solid Opaque Background: #FBF7F0) */}
        <div
          className="fixed inset-y-0 right-0 w-full max-w-[360px] sm:max-w-[400px] bg-[#FBF7F0] border-l border-[#E4DACB] shadow-2xl flex flex-col z-[10000] animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Header Bar */}
          <div className="h-16 px-5 border-b border-[#E4DACB] bg-[#FBF7F0] flex items-center justify-between shrink-0">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta text-white shadow-xs">
                <Radio className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-ink">
                  StoryKeeper<span className="text-terracotta">.ai</span>
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-muted -mt-0.5">
                  Oral History Archive
                </span>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full h-9 w-9 bg-[#F3ECE0] hover:bg-[#E4DACB] text-ink"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Body (Completely Solid & Opaque, No Bleed-through) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FBF7F0]">
            {/* User Profile or Join/Sign-In Card */}
            {user ? (
              <div className="p-4 rounded-2xl bg-[#F3ECE0] border border-[#E4DACB] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-white font-serif text-sm font-semibold shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#E4DACB] text-terracotta shrink-0">
                    {role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F3ECE0] border border-[#E4DACB] space-y-3">
                <div className="space-y-1">
                  <p className="font-serif text-base font-medium text-ink">
                    Preserve Living Stories
                  </p>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Join our ethical digital archive to preserve and protect your family&apos;s oral memories.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white border-[#E4DACB] hover:bg-[#FBF7F0] justify-center text-ink text-xs h-9"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="rounded-xl justify-center bg-terracotta hover:bg-terracotta/90 text-white text-xs h-9 shadow-xs"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/register">Join Archive</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div>
              <Button
                asChild
                variant="default"
                size="lg"
                className="w-full justify-center rounded-2xl bg-terracotta hover:bg-terracotta/90 text-white shadow-warm py-3 gap-2 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/dashboard/stories/new">
                  <Mic className="h-4 w-4" />
                  <span>Record & Share a Story</span>
                </Link>
              </Button>
            </div>

            {/* Navigation Links Group */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted px-3 block mb-2 font-sans">
                Archive Catalog
              </span>
              <Link
                href="/archive"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#F3ECE0] text-terracotta group-hover:bg-white transition-colors">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-medium">Explore Archive</span>
                    <span className="text-[11px] text-muted font-normal">Browse oral memories & recordings</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted/40 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#F3ECE0] text-terracotta group-hover:bg-white transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-medium">Search & Ask Archive</span>
                    <span className="text-[11px] text-muted font-normal">Search by theme, dialect, or query</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted/40 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/collections"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#F3ECE0] text-saffron group-hover:bg-white transition-colors">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-medium">Curated Collections</span>
                    <span className="text-[11px] text-muted font-normal">Thematic exhibits & traditions</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted/40 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/timeline"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#F3ECE0] text-moss group-hover:bg-white transition-colors">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-medium">Decade Timeline</span>
                    <span className="text-[11px] text-muted font-normal">Chronological oral memories</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted/40 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#F3ECE0] text-plum group-hover:bg-white transition-colors">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-medium">About & Ethics Charter</span>
                    <span className="text-[11px] text-muted font-normal">Our consent & preservation pledge</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted/40 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Account & Management Links (If logged in) */}
            {user && (
              <div className="pt-4 border-t border-[#E4DACB] space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted px-3 block mb-2 font-sans">
                  Contributor Account
                </span>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-terracotta" />
                  <span>My Preserved Stories</span>
                </Link>

                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-moss hover:bg-moss/10 py-2.5 px-3 rounded-xl transition-colors"
                  >
                    <Shield className="h-4 w-4 text-moss" />
                    <span>Admin Moderation Console</span>
                  </Link>
                )}

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-ink hover:text-terracotta py-2.5 px-3 rounded-xl hover:bg-[#F3ECE0] transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted" />
                  <span>Account & Consent Settings</span>
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
          </div>

          {/* Drawer Footer Bar */}
          <div className="px-5 py-3.5 border-t border-[#E4DACB] bg-[#F3ECE0] shrink-0 text-xs text-[#6B625A] flex items-center justify-between">
            <span className="font-serif font-medium text-ink">StoryKeeper AI</span>
            <span className="text-[11px] text-muted">Ethical Community Archive</span>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="rounded-xl h-9 w-9 p-0 hover:bg-paper-2 focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <Menu className="h-5 w-5 text-ink" />
      </Button>

      {/* Portal Mount */}
      {mounted && drawerElement && createPortal(drawerElement, document.body)}
    </div>
  );
}
