import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Noto_Serif_Devanagari,
  Noto_Sans_Devanagari,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-serif-devanagari",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://storykeeper.ai"),
  title: {
    default: "StoryKeeper AI — Oral History & Cultural Memory Archive",
    template: "%s | StoryKeeper AI",
  },
  description:
    "A public digital archive preserving real oral histories, folk songs, heirloom recipes, and community memories before they disappear. AI-transcribed, human-verified.",
  keywords: [
    "oral history",
    "cultural archive",
    "folk memories",
    "indigenous stories",
    "voice preservation",
    "transcription",
    "translation",
  ],
  authors: [{ name: "StoryKeeper Archive Initiative" }],
  openGraph: {
    title: "StoryKeeper AI — Oral History & Cultural Archive",
    description:
      "Preserving real human voices and ancestral community memories with ethical AI transcription and human review.",
    siteName: "StoryKeeper AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoryKeeper AI",
    description: "Preserving real human voices and ancestral community memories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${notoSerifDevanagari.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="paper-grain font-sans antialiased bg-paper text-ink selection:bg-terracotta-subtle selection:text-terracotta min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
