import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-terracotta text-white shadow hover:bg-terracotta-hover",
        secondary:
          "border-line bg-paper-2 text-ink hover:bg-[#ebdcc8]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-ink border-line",
        moss: "border-transparent bg-moss-subtle text-moss font-semibold",
        saffron: "border-transparent bg-saffron-subtle text-[#8C5E0D] font-semibold",
        plum: "border-transparent bg-plum-subtle text-plum font-semibold",
        terracotta: "border-transparent bg-terracotta-subtle text-terracotta font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
