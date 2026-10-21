import React from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleBadgeProps {
  className?: string;
}

export function SampleBadge({ className }: SampleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-paper-2 text-muted border border-line",
        className
      )}
      title="This is an archival demo sample story"
    >
      <Bookmark className="h-2.5 w-2.5 text-muted" />
      <span>Sample</span>
    </span>
  );
}
