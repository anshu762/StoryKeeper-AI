"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[APPLICATION ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-6 shadow-sm">
        <AlertCircle className="h-8 w-8 stroke-[1.5]" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
        System Interruption
      </p>

      <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-ink mt-2 mb-3">
        An unexpected error occurred
      </h1>

      <p className="text-base text-muted max-w-md mx-auto leading-relaxed mb-8">
        We were unable to load the archive data. Your personal drafts and audio remain safely preserved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Try Again</span>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <span>Return to Home</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
