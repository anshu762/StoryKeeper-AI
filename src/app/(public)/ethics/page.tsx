import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  EyeOff,
  Sparkles,
  FileText,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ethics & Consent Charter | StoryKeeper AI",
  description:
    "Our non-negotiable principles on community consent, AI transparency, contributor privacy, and respectful preservation of oral memories.",
};

const ETHICAL_PILLARS = [
  {
    icon: ShieldCheck,
    title: "1. Explicit, Granular Contributor Consent",
    summary: "No recording is ever made public without affirmative permission.",
    details: [
      "Contributors explicitly choose between Public, Research Only, or Private visibility upon submission.",
      "Display preferences allow contributors to be recognized by name or remain completely anonymous.",
      "Drafts and processing recordings are strictly quarantined from public indexes and web crawlers.",
      "Permission can be changed or revoked at any time from the contributor dashboard.",
    ],
  },
  {
    icon: EyeOff,
    title: "2. Absolute Privacy of Personal Identifiers",
    summary: "Personal identity and exact geography are permanently safeguarded.",
    details: [
      "Public pages never display contributor email addresses, phone numbers, or exact residential addresses.",
      "Geographic attribution is intentionally coarse (district, province, or broad region) to protect community safety.",
      "Audio files for private stories are served exclusively through short-lived signed URLs with cryptographic authorization.",
      "Account deletion permanently severs contributor identity according to transparent data retention policies.",
    ],
  },
  {
    icon: Sparkles,
    title: "3. Transparent & Subservient AI",
    summary: "AI assists with transcription and translation, but never invents stories.",
    details: [
      "Every machine-generated element is clearly badged in the interface as 'AI-generated · editable'.",
      "Original language transcripts and English translations exist in separate immutable columns; AI never overwrites native speech.",
      "Every transcript, summary, and theme tag can be edited and refined by humans before and after publication.",
      "If AI processing fails, raw audio recordings and drafts are preserved safely without loss.",
    ],
  },
  {
    icon: RotateCcw,
    title: "4. The Unconditional Right to Edit or Remove",
    summary: "Contributors retain moral rights and sovereignty over their stories.",
    details: [
      "Every public story includes an integrated 'Request Edit or Removal' modal for the original contributor or family.",
      "Community members can submit a 'Report a Concern' notice for rapid moderation review if sensitive cultural knowledge is contested.",
      "Every administrative moderation action and consent alteration is permanently logged for auditability.",
      "We honor cultural embargoes and sacred traditions that should not remain open to public inspection.",
    ],
  },
];

export default function EthicsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-5xl space-y-16">
      <PageHeader
        eyebrow="Community Governance"
        title="Our Ethics & Consent Charter"
        description="Oral histories are intimate human gifts. We treat every recorded voice with the dignity, privacy, and sovereignty it deserves."
      />

      {/* Philosophy Banner */}
      <div className="bg-paper-2/60 border border-line rounded-3xl p-8 sm:p-10 space-y-4">
        <h2 className="font-serif text-2xl font-medium text-ink">
          The Moral Foundation of StoryKeeper AI
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Traditional web archives often harvest cultural data without ongoing accountability to the storytellers. StoryKeeper AI is designed from the ground up around contributor sovereignty. Digital technology must serve community memory, not exploit it.
        </p>
        <div className="pt-2 text-xs text-ink/80 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-moss" />
          <span>Formally embedded into our database schema, access controls, and software architecture.</span>
        </div>
      </div>

      {/* The 4 Core Pillars */}
      <div className="space-y-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink text-center">
          The Four Ethical Pillars
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {ETHICAL_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink">
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-medium text-terracotta">
                      {pillar.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-2 pl-0 sm:pl-16">
                  <ul className="space-y-2.5">
                    {pillar.details.map((point) => (
                      <li
                        key={point}
                        className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Fact Disclaimer Section */}
      <section className="bg-paper-2/40 border border-line rounded-3xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2.5 text-ink font-serif text-xl font-medium">
          <FileText className="w-5 h-5 text-terracotta" />
          <span>Understanding Oral Histories vs. Historical Records</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Every story in this repository is presented with the explicit notice: <em>&ldquo;Stories represent personal memories and community histories, not verified historical facts.&rdquo;</em> Oral history celebrates personal lived experience, folklore, emotional truth, and regional narratives. We do not edit memories to fit official textbooks.
        </p>
      </section>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-ink text-paper">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-lg font-medium">
            Have questions about your story or data rights?
          </h3>
          <p className="text-xs text-paper/70">
            Our archive curators and moderators are here to assist with any consent inquiries.
          </p>
        </div>
        <Link href="/contributor-guide">
          <Button variant="secondary" className="bg-paper text-ink hover:bg-paper-2 text-xs font-medium">
            Contributor Guide
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
