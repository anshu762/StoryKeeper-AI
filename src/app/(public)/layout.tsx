import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { DemoRibbon } from "@/components/navigation/demo-ribbon";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoRibbon />
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
