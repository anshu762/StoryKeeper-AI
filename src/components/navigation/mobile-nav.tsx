"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Mic, Compass, Search, Layers, Clock, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="rounded-xl"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-line bg-paper/95 backdrop-blur-xl p-6 shadow-warm-lg animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/archive"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-ink hover:text-terracotta py-2 border-b border-line/40"
            >
              <Compass className="h-4 w-4 text-terracotta" />
              <span>Explore Archive</span>
            </Link>
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-ink hover:text-terracotta py-2 border-b border-line/40"
            >
              <Search className="h-4 w-4 text-terracotta" />
              <span>Search & Ask Archive</span>
            </Link>
            <Link
              href="/collections"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-ink hover:text-terracotta py-2 border-b border-line/40"
            >
              <Layers className="h-4 w-4 text-saffron" />
              <span>Curated Collections</span>
            </Link>
            <Link
              href="/timeline"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-ink hover:text-terracotta py-2 border-b border-line/40"
            >
              <Clock className="h-4 w-4 text-moss" />
              <span>Timeline</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-ink hover:text-terracotta py-2 border-b border-line/40"
            >
              <Info className="h-4 w-4 text-plum" />
              <span>About & Ethics</span>
            </Link>

            <div className="pt-2">
              <Button
                asChild
                variant="default"
                className="w-full justify-center"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/dashboard/stories/new">
                  <Mic className="h-4 w-4 mr-2" />
                  <span>Share a story</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
