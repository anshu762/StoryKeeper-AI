import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper-2 border border-line text-terracotta mb-6 shadow-sm">
        <Compass className="h-8 w-8 stroke-[1.5]" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
        404 — Story Not Found
      </p>

      <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-ink mt-2 mb-3">
        A chapter lost to time
      </h1>

      <p className="text-base text-muted max-w-md mx-auto leading-relaxed mb-8">
        The recording or page you are seeking does not exist or has been relocated within the community archive.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Return to Archive Home</span>
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/archive">
            <span>Browse Public Stories</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
