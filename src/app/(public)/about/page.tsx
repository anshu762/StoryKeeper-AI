import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Shield, HeartHandshake, Mic, Users, BookOpen, ArrowRight, Download, Database } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About StoryKeeper AI | Ethical Oral History Archive",
  description:
    "StoryKeeper AI is a public digital archive preserving real oral histories, folk traditions, recipes, and community memories before they fade away.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-5xl space-y-16">
      <PageHeader
        eyebrow="Our Mission"
        title="Every elder is a library. Let’s not lose the books."
        description="StoryKeeper AI is an open, ethical digital repository created to record, transcribe, translate, and safeguard endangered oral memories and community heritage."
      />

      {/* Main Narrative */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-paper-2/40 border border-line rounded-3xl p-8 sm:p-12">
        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            The Imperative
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink leading-snug">
            Preserving Living Voices Before They Fade Into Silence
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Across villages, small towns, and diasporas, profound knowledge resides in memory: heirloom recipes without written measurements, folk melodies sung during harvest, firsthand recollections of partition and migration, and dialects spoken by fewer people each decade.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            When an elder passes away, that cultural memory vanishes with them. StoryKeeper AI exists to empower families and community organizers to record these voices, transcribe them in their native scripts, and make them discoverable for grandchildren and researchers alike.
          </p>
        </div>

        <div className="md:col-span-5 bg-paper rounded-2xl p-6 border border-line shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-terracotta font-serif text-lg font-medium">
            <Shield className="w-5 h-5" />
            <span>Ethical Commitment</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI does not invent stories here. It only transcribes, translates, and organizes authentic human recordings. Every AI field is labeled and human-reviewed.
          </p>
          <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
            <span className="text-ink font-semibold">Consent Guarantee</span>
            <span className="text-terracotta">100% Contributor Controlled</span>
          </div>
        </div>
      </section>

      {/* 3 Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl font-medium text-ink">
            How StoryKeeper Works
          </h2>
          <p className="text-sm text-muted-foreground">
            A technology bridge built with cultural humility and technical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-paper border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              1. Authentic Human Voice
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Family members and community volunteers record grandparents and neighbors using any phone or browser. The raw audio is safeguarded in secure object storage.
            </p>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-moss/10 text-moss flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              2. Multilingual AI Processing
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              State-of-the-art speech recognition transcribes the original regional language (e.g. Bhojpuri, Hindi, Bengali) while LLMs produce English translations, synopses, and themes.
            </p>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              3. Human Review & Consent
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Contributors review the transcript, correct phrasing, select anonymous or named display, and explicitly approve public publication before anything appears online.
            </p>
          </div>
        </div>
      </section>

      {/* Research Commons & Open Dataset */}
      <section className="bg-paper border border-line rounded-3xl p-8 sm:p-12 space-y-6 shadow-warm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-line pb-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-moss">
              Academic Commons
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Open Oral History Research Dataset
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              We make permitted, public oral narratives available to researchers, historians, and language preservationists as structured JSON. All data is sanitized to remove personal contact information while preserving regional vernaculars and verified cultural translations.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/api/public/dataset"
              download="storykeeper-public-dataset.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="moss" className="text-xs gap-2 h-11 px-6 shadow-warm">
                <Download className="w-4 h-4" />
                <span>Download Public Dataset (JSON)</span>
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-paper-2 border border-line/60 space-y-1">
            <span className="font-semibold text-ink block">Ethical Licensing</span>
            <span className="text-muted-foreground">
              CC BY-NC-ND 4.0 license. Non-commercial, educational, and cultural reuse.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-2 border border-line/60 space-y-1">
            <span className="font-semibold text-ink block">Strict Anonymity Guard</span>
            <span className="text-muted-foreground">
              Zero email addresses or phone numbers. Only approved public stories.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-paper-2 border border-line/60 space-y-1">
            <span className="font-semibold text-ink block">Multilingual Transcripts</span>
            <span className="text-muted-foreground">
              Includes original Devanagari/regional scripts, English translations, and cultural tags.
            </span>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-terracotta text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-warm-lg">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium">
            Have a story in your family to preserve?
          </h2>
          <p className="text-sm text-white/85 max-w-xl">
            You don&apos;t need professional recording gear. A heartfelt 5-minute conversation can become an heirloom for future generations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/contributor-guide">
            <Button variant="secondary" className="bg-paper text-ink hover:bg-paper-2 font-medium">
              Read Contributor Guide
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-ink hover:bg-ink/90 text-white font-medium">
              Start Recording
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
