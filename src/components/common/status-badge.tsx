import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StoryStatusType =
  | "DRAFT"
  | "PROCESSING"
  | "NEEDS_REVIEW"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";

interface StatusBadgeProps {
  status: StoryStatusType;
  className?: string;
}

const statusConfig: Record<
  StoryStatusType,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-paper-2 text-muted border-line",
  },
  PROCESSING: {
    label: "Processing AI",
    className: "bg-saffron-subtle text-[#8C5E0D] border-saffron/30 animate-pulse",
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    className: "bg-terracotta-subtle text-terracotta border-terracotta/30",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-plum-subtle text-plum border-plum/30",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-moss-subtle text-moss border-moss/30",
  },
  REJECTED: {
    label: "Changes Requested",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-moss text-white border-moss",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-paper-2 text-muted line-through border-line",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
