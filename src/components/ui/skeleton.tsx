import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-paper-2 border border-line/40",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
