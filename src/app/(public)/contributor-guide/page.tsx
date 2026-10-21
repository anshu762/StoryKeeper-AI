import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Mic,
  FileAudio,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Volume2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contributor & Interview Guide | StoryKeeper AI",
  description:
    "A practical guide for recording oral histories: sample interview questions, audio recording tips, technical requirements, and consent steps.",
};

const SAMPLE_QUESTIONS = [
  {
    category: "Childhood & Daily Life",
    questions: [
      "What is your earliest childhood memory in your ancestral village or neighborhood?",
      "What were the sounds, smells, and routines of morning when you were ten years old?",
      "What games did you play with siblings and neighborhood children that kids today might not know?",
    ],
  },
  {
    category: "Recipes & Food Traditions",
    questions: [
      "What special dish did your mother or grandmother make during the monsoon or harvest?",
      "Were there traditional spices, herbs, or earthenware pots used in your family kitchen?",
      "Can you describe how that dish was prepared from memory?",
    ],
  },
  {
    category: "Crafts, Work & Skill",
    questions: [
      "What trade, handcraft, or agricultural rhythm defined your working life?",
      "What tools did you hold every day, and how were you taught to handle them?",
      "What songs did people hum or sing while weaving, harvesting, or building?",
    ],
  },
  {
    category: "Migration & Big Changes",
    questions: [
      "Did your family ever move across rivers, borders, or from village to city? What was that journey like?",
      "What did you have to leave behind, and what single object did you carry with you?",
      "How did your community stay connected after moving?",
    ],
  },
];

export default function ContributorGuidePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-5xl space-y-16">
      <PageHeader
        eyebrow="Practical Toolkit"
        title="Oral History Contributor Guide"
        description="Preserving family and community memory is simple. You don’t need specialized microphones—just curiosity, care, and a quiet room."
      />

      {/* Step by Step Workflow */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
          The 4-Step Contribution Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-paper-2/40 border border-line rounded-2xl p-5 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-terracotta text-white flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <h3 className="font-serif font-medium text-ink text-base">
              Record or Upload
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use your phone or computer to record directly in the browser, or upload an existing audio file (MP3, M4A, WAV).
            </p>
          </div>

          <div className="bg-paper-2/40 border border-line rounded-2xl p-5 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-saffron text-ink flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <h3 className="font-serif font-medium text-ink text-base">
              AI Transcription
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our models transcribe the regional tongue in its native script and generate a fluent English translation and summary.
            </p>
          </div>

          <div className="bg-paper-2/40 border border-line rounded-2xl p-5 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-moss text-white flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <h3 className="font-serif font-medium text-ink text-base">
              Review & Refine
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You review the transcript. Correct any misheard dialect words, adjust the summary, and add context notes.
            </p>
          </div>

          <div className="bg-paper-2/40 border border-line rounded-2xl p-5 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-plum text-white flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <h3 className="font-serif font-medium text-ink text-base">
              Consent & Share
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose Public, Private, or Research Only. Decide whether to show your name or remain anonymous before submitting.
            </p>
          </div>
        </div>
      </section>

      {/* Recording Best Practices */}
      <section className="bg-paper border border-line rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
        <h2 className="font-serif text-2xl font-medium text-ink flex items-center gap-2.5">
          <Mic className="w-6 h-6 text-terracotta" />
          <span>Tips for a Meaningful Audio Recording</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-semibold text-ink">Choose a Quiet Setting</h4>
            <p className="leading-relaxed">
              Turn off televisions, air conditioners, and ceiling fans if possible. Soft furnishings like rugs and curtains help absorb echoes.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-ink">Microphone Placement</h4>
            <p className="leading-relaxed">
              Place the smartphone or microphone about 12 to 18 inches from the speaker, resting on a soft towel rather than a bare table.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-ink">Encourage Their Native Tongue</h4>
            <p className="leading-relaxed">
              People express warmth and memory best in their mother dialect. Don&apos;t worry if it&apos;s mixed with local colloquialisms—that is what makes it precious.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-ink">Keep Sessions Focused</h4>
            <p className="leading-relaxed">
              A 5 to 15 minute recording focusing on one memory or ritual is often far richer and easier to preserve than a 2-hour freeform talk.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Interview Questions */}
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
            Sample Interview Prompts
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Use these questions to spark conversation without sounding like an interrogation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_QUESTIONS.map((cat) => (
            <div
              key={cat.category}
              className="bg-paper-2/50 border border-line rounded-2xl p-6 space-y-3"
            >
              <h3 className="font-serif font-medium text-ink text-lg text-terracotta">
                {cat.category}
              </h3>
              <ul className="space-y-2.5">
                {cat.questions.map((q) => (
                  <li
                    key={q}
                    className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 shrink-0" />
                    <span>&ldquo;{q}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="bg-paper-2/30 border border-line rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-terracotta" />
          <span>Technical Specifications</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="bg-paper p-4 rounded-xl border border-line">
            <span className="font-semibold text-ink block mb-1">Supported Formats</span>
            <span>MP3, M4A, WAV, AAC, WebM, OGG</span>
          </div>
          <div className="bg-paper p-4 rounded-xl border border-line">
            <span className="font-semibold text-ink block mb-1">File Size Limit</span>
            <span>Up to 50 MB per recording</span>
          </div>
          <div className="bg-paper p-4 rounded-xl border border-line">
            <span className="font-semibold text-ink block mb-1">Recommended Duration</span>
            <span>3 minutes to 30 minutes</span>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-serif text-2xl font-medium text-ink">
          Ready to record a living memory?
        </h3>
        <div className="flex justify-center gap-3">
          <Link href="/register">
            <Button className="bg-terracotta hover:bg-terracotta/90 text-white px-6">
              Create Contributor Account
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
