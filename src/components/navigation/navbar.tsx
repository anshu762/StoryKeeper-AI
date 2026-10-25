import React from "react";
import Link from "next/link";
import { Mic, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/80 bg-[#FBF7F0]/90 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-terracotta text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-ink group-hover:text-terracotta transition-colors truncate">
                StoryKeeper<span className="text-terracotta">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted -mt-1 hidden sm:block">
                Oral History Archive
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/80">
            <Link
              href="/archive"
              className="hover:text-terracotta transition-colors py-1"
            >
              Archive
            </Link>
            <Link
              href="/search"
              className="hover:text-terracotta transition-colors py-1"
            >
              Search
            </Link>
            <Link
              href="/collections"
              className="hover:text-terracotta transition-colors py-1"
            >
              Collections
            </Link>
            <Link
              href="/timeline"
              className="hover:text-terracotta transition-colors py-1"
            >
              Timeline
            </Link>
            <Link
              href="/about"
              className="hover:text-terracotta transition-colors py-1"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden sm:inline-flex rounded-xl"
          >
            <Link href="/dashboard/stories/new">
              <Mic className="h-3.5 w-3.5 mr-1.5" />
              <span>Share a story</span>
            </Link>
          </Button>

          <UserMenu />

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
