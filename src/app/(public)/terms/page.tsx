import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = {
  title: "Terms of Service | StoryKeeper AI",
  description:
    "Terms of service, community guidelines, non-exclusive preservation license, and data usage rules for StoryKeeper AI.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-4xl space-y-12">
      <PageHeader
        eyebrow="Legal & Terms"
        title="Terms of Service & Archive Charter"
        description="Guidelines governing contributions, respectful listening, copyright, and preservation in the StoryKeeper public digital repository."
      />

      <div className="space-y-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {/* Section 1 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-terracotta" />
            <span>1. Contributor Copyright and Licensing</span>
          </h2>
          <p>
            When you record or upload an oral history to StoryKeeper AI, <strong>you retain moral ownership and original copyright</strong> of your recording.
          </p>
          <p>
            By choosing the &ldquo;Public&rdquo; or &ldquo;Research Only&rdquo; visibility setting, you grant StoryKeeper AI a non-exclusive, royalty-free, worldwide license to host, transcribe, translate, index, and display your recording in accordance with your specified permissions. You may revoke or modify this permission at any time.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <FileText className="w-5 h-5 text-moss" />
            <span>2. Nature of Oral Histories</span>
          </h2>
          <p className="bg-paper-2/60 p-4 rounded-xl border border-line text-ink italic">
            &ldquo;Stories represent personal memories and community histories, not verified historical facts.&rdquo;
          </p>
          <p>
            Oral traditions embody personal perspectives, familial recollections, and cultural impressions. StoryKeeper AI is an archive of living human testimony, not an encyclopedia of audited historical consensus.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-terracotta" />
            <span>3. Prohibition of Bulk AI Model Scraping</span>
          </h2>
          <p>
            The recordings and transcripts housed in this repository are human gifts shared for educational discovery, family legacy, and cultural memory.
          </p>
          <p className="text-ink font-medium">
            Automated scraping, bulk harvesting, or ingestion of recordings or transcripts for training commercial third-party generative artificial intelligence models without explicit written permission from the archive and contributors is strictly prohibited.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink">
            4. Community Standards & Moderation
          </h2>
          <p>
            We reserve the right to unpublish, edit, or remove recordings that contain defamation, harassment, commercial advertisements, hate speech, or content that breaches sacred indigenous cultural embargoes.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-paper-2/40 border border-line rounded-2xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-medium text-ink">
            Contact & Concerns
          </h3>
          <p>
            If you believe your intellectual property or personal likeness has been included without authorization, or wish to report a moderation issue, please submit a notice via the &ldquo;Report a Concern&rdquo; link on any story page or email terms@storykeeper.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
