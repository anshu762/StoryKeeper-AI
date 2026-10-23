import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectNativeProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

export const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, containerClassName, children, disabled, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl border border-line bg-white/90 px-4 py-2.5 pr-10 text-sm text-ink font-normal shadow-xs transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta",
            "hover:bg-white hover:border-terracotta/50",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-paper-2/40",
            "cursor-pointer",
            className
          )}
          style={{
            backgroundColor: "#FAF6EF",
            color: "#1F1A17",
          }}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/60 transition-transform",
            disabled && "opacity-40"
          )}
          aria-hidden="true"
        />
      </div>
    );
  }
);

SelectNative.displayName = "SelectNative";
