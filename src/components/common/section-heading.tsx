import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            {eyebrow}
          </span>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
