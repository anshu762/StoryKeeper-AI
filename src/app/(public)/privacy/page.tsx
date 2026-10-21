import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = {
  title: "Privacy Policy | StoryKeeper AI",
  description:
    "How StoryKeeper AI protects contributor personal data, safeguards private audio, and enforces strict consent controls.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-4xl space-y-12">
      <PageHeader
        eyebrow="Data Protection"
        title="Privacy & Data Governance Policy"
        description="We believe oral histories and personal narratives belong to their storytellers. Our privacy architecture guarantees transparency and contributor control."
      />

      <div className="space-y-10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {/* Section 1 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <Shield className="w-5 h-5 text-terracotta" />
            <span>1. Information We Collect and Segregate</span>
          </h2>
          <p>
            StoryKeeper AI strictly separates <strong>account credentials</strong> from <strong>public story metadata</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
            <li>
              <strong>Account Data:</strong> Your name, email address, password hash, and default consent preferences. Your email and password are never displayed publicly.
            </li>
            <li>
              <strong>Story Content:</strong> Audio recordings, original transcriptions, machine translations, summaries, keywords, coarse geographic regions (state/district), and cultural themes.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <Eye className="w-5 h-5 text-moss" />
            <span>2. Public Visibility and Anonymity</span>
          </h2>
          <p>
            No story or recording is ever accessible to the public without explicit, affirmative contributor consent.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
            <li>
              <strong>Public:</strong> Discoverable on the website and accessible to visitors worldwide.
            </li>
            <li>
              <strong>Research Only:</strong> Excluded from public pages and web crawlers; included solely in permitted academic exports.
            </li>
            <li>
              <strong>Private:</strong> Strictly accessible only to the contributor who recorded it and platform administrators for system maintenance.
            </li>
            <li>
              <strong>Anonymous Display:</strong> If you select anonymous display, your name will never be associated with the story on public pages.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <Lock className="w-5 h-5 text-plum" />
            <span>3. Audio Security & Cryptographic Access</span>
          </h2>
          <p>
            Audio files uploaded to StoryKeeper AI are hosted on secure, encrypted cloud object storage (Cloudflare R2). Audio files for non-public recordings are never publicly reachable via direct links. They are served exclusively via short-lived signed URLs generated only after real-time authorization checks.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-paper border border-line rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-medium text-ink flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-terracotta" />
            <span>4. Your Right to Edit, Revoke, or Delete</span>
          </h2>
          <p>
            You retain sovereign ownership of your memories. You may at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-ink/80">
            <li>Request removal or editing of any story you contributed using the built-in story action buttons.</li>
            <li>Change a story from Public to Private with immediate effect across the repository.</li>
            <li>Request complete account deletion, which soft-deletes and disassociates personal records in accordance with our data retention rules.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-paper-2/40 border border-line rounded-2xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-medium text-ink">
            Cookies and Analytics
          </h3>
          <p>
            We do not use invasive third-party advertising cookies or cross-site tracking trackers. We use strictly necessary session cookies for authentication and basic 24-hour deduplication tokens to prevent bot inflation of audio view counts.
          </p>
          <p className="pt-2 text-xs text-muted-foreground">
            For further privacy inquiries or questions regarding community records, please contact our curators at privacy@storykeeper.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
