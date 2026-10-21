import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-line mb-8",
        className
      )}
    >
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-base sm:text-lg text-muted font-sans leading-relaxed pt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0 pt-2 md:pt-0">{action}</div>}
    </div>
  );
}
