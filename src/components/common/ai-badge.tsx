import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiBadgeProps {
  className?: string;
  label?: string;
}

export function AiBadge({
  className,
  label = "AI-generated · editable",
}: AiBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-saffron-subtle text-[#8C5E0D] border border-saffron/30 tracking-wide",
        className
      )}
    >
      <Sparkles className="h-3 w-3 text-saffron" />
      <span>{label}</span>
    </span>
  );
}
