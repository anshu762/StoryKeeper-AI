import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <FolderOpen className="h-6 w-6 stroke-[1.5]" />;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as React.ElementType;
    return <IconComp className="h-6 w-6 stroke-[1.5]" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-line bg-white/40 max-w-md mx-auto my-8",
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-paper-2 border border-line text-terracotta mb-4 shadow-sm">
        {renderIcon()}
      </div>
      <h3 className="font-serif text-xl font-medium text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-6 max-w-xs">
        {description}
      </p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Button asChild variant="default">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction} variant="default">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
