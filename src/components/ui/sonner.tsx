"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-warm-lg group-[.toaster]:rounded-2xl font-sans",
          description: "group-[.toast]:text-muted",
          actionButton:
            "group-[.toast]:bg-terracotta group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-paper-2 group-[.toast]:text-ink",
          error: "group-[.toast]:border-red-200 group-[.toast]:bg-red-50/50",
          success: "group-[.toast]:border-moss/30 group-[.toast]:bg-moss-subtle/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
