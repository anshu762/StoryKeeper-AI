"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  Check,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StoryStatusType } from "@/components/common/status-badge";
import { AiBadge } from "@/components/common/ai-badge";
import { SampleBadge } from "@/components/common/sample-badge";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StoryCard } from "@/components/story/story-card";
import { CollectionCard } from "@/components/collection/collection-card";
import { toast } from "sonner";

export default function DesignSystemPage() {
  const [isMobilePreview, setIsMobilePreview] = useState(false);

  const colors = [
    { name: "paper", hex: "#FBF7F0", desc: "Background primary warm cream", bg: "bg-paper", text: "text-ink" },
    { name: "paper-2", hex: "#F3ECE0", desc: "Subtle card & surface background", bg: "bg-paper-2", text: "text-ink" },
    { name: "ink", hex: "#1F1A17", desc: "Primary text & typography", bg: "bg-ink", text: "text-white" },
    { name: "muted", hex: "#6B625A", desc: "Secondary text & descriptions", bg: "bg-muted", text: "text-white" },
    { name: "line", hex: "#E4DACB", desc: "Warm borders & dividers", bg: "bg-line", text: "text-ink" },
    { name: "terracotta", hex: "#B5472B", desc: "Brand primary action & accents", bg: "bg-terracotta", text: "text-white" },
    { name: "saffron", hex: "#E3A33B", desc: "Warm highlights & AI indicators", bg: "bg-saffron", text: "text-ink" },
    { name: "moss", hex: "#3F5B45", desc: "Published, verified & nature accents", bg: "bg-moss", text: "text-white" },
    { name: "plum", hex: "#5A3550", desc: "Curated collections & deep heritage", bg: "bg-plum", text: "text-white" },
  ];

  const statuses: StoryStatusType[] = [
    "DRAFT",
    "PROCESSING",
    "NEEDS_REVIEW",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "PUBLISHED",
    "ARCHIVED",
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header with Mobile Frame Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Living Design System
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
            StoryKeeper Visual Language
          </h1>
          <p className="text-sm text-muted mt-1">
            Editorial, human, calm, and trustworthy: museum catalog meets modern SaaS.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-paper-2 p-1.5 rounded-2xl border border-line">
          <Button
            size="sm"
            variant={!isMobilePreview ? "default" : "ghost"}
            onClick={() => setIsMobilePreview(false)}
            className="rounded-xl gap-1.5"
          >
            <Monitor className="h-4 w-4" />
            <span className="text-xs">Desktop View</span>
          </Button>
          <Button
            size="sm"
            variant={isMobilePreview ? "default" : "ghost"}
            onClick={() => setIsMobilePreview(true)}
            className="rounded-xl gap-1.5"
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-xs">375px Mobile Frame</span>
          </Button>
        </div>
      </div>

      <div
        className={
          isMobilePreview
            ? "mx-auto max-w-[375px] border-4 border-ink/40 rounded-3xl p-4 bg-paper shadow-2xl transition-all"
            : "space-y-12"
        }
      >
        {/* Section 1: Color Palette */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            1. Color Tokens & Palette
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {colors.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-line bg-white overflow-hidden shadow-sm flex flex-col"
              >
                <div
                  className={`h-20 w-full ${c.bg} flex items-end p-2.5 justify-between`}
                >
                  <span className={`text-xs font-mono font-bold ${c.text}`}>
                    {c.hex}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-ink capitalize">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted leading-tight mt-0.5">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            2. Typography Hierarchy
          </h2>
          <div className="space-y-4 rounded-2xl border border-line bg-white/70 p-6">
            <div>
              <p className="text-xs text-muted uppercase font-sans mb-1">
                Display Headline 1 (Fraunces Serif)
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink">
                Preserving Human Voices & Vanishing Tales
              </h1>
            </div>

            <div>
              <p className="text-xs text-muted uppercase font-sans mb-1">
                Section Heading 2 (Fraunces Serif)
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Grandmothers&apos; Clay Stoves & Ancient Spices
              </h2>
            </div>

            <div>
              <p className="text-xs text-muted uppercase font-sans mb-1">
                UI Body & Reading Text (Inter Sans)
              </p>
              <p className="text-base text-ink font-sans leading-relaxed max-w-2xl">
                Every story in this archive is recorded in the contributor’s mother tongue,
                transcribed with regional fidelity, translated into English for global discoverability,
                and safeguarded by community consent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl bg-paper p-4 border border-line">
                <span className="text-xs text-terracotta font-semibold uppercase block mb-1">
                  Noto Serif Devanagari (Original Transcript)
                </span>
                <p className="font-devanagari-serif text-base text-ink leading-relaxed">
                  &ldquo;हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं, तब पूरे आँगन में महुए के फूल की खुशबू फैल जाती थी।&rdquo;
                </p>
              </div>

              <div className="rounded-xl bg-paper p-4 border border-line">
                <span className="text-xs text-moss font-semibold uppercase block mb-1">
                  Noto Sans Devanagari (Modern Devanagari UI)
                </span>
                <p className="font-devanagari-sans text-base text-ink leading-relaxed">
                  &ldquo;सांस्कृतिक स्मृतियों का डिजिटल संकलन — मौखिक इतिहास को सुरक्षित रखने का सामूहिक प्रयास।&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Buttons & Actions */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            3. Buttons & Interactive Controls
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="default"
              onClick={() => toast.success("Terracotta Primary Triggered")}
            >
              Primary Terracotta
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info("Secondary Action")}
            >
              Secondary Paper
            </Button>
            <Button variant="outline">Outline Border</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="moss">Moss (Published)</Button>
            <Button variant="saffron">Saffron Highlight</Button>
            <Button variant="destructive">Destructive Action</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm">Small Size (sm)</Button>
            <Button size="default">Default Size</Button>
            <Button size="lg">Large Hero Size (lg)</Button>
            <Button size="icon" variant="outline" aria-label="Microphone">
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Section 4: Badges & Status Indicators */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            4. Status Badges & Labels
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AiBadge />
            <SampleBadge />
            <Badge variant="moss">Verified Speaker</Badge>
            <Badge variant="saffron">Audio Restored</Badge>
            <Badge variant="plum">1940s Oral Archive</Badge>
          </div>
        </section>

        {/* Section 5: Story Card Showcase */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            5. Story Card Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StoryCard
              id="sample-1"
              slug="grandmothers-clay-oven-recipe"
              title="The Scent of Mahua & My Grandmother’s Clay Oven"
              summary="Reflections on growing up in the late 1960s in Bhojpur, baking thick rotis on open mud stoves during harvest season and the songs women sang while threshing grain."
              originalTranscript="हमरे बचपन में जब दादी चूल्हे पर रोटी सेकती थीं..."
              originalLanguage="Bhojpuri"
              region="Bhojpur, Bihar"
              timePeriodLabel="1960s"
              audioDurationSec={245}
              displayPreference="NAMED"
              contributorName="Sunita Devi"
              isSample={true}
              status="PUBLISHED"
              showStatus={true}
              themes={[
                { name: "Food", slug: "food" },
                { name: "Family", slug: "family" },
              ]}
            />

            <StoryCard
              id="sample-2"
              slug="train-journey-1947"
              title="Crossing the Sutlej: The Final Night Train"
              summary="An eyewitness memory of the 1947 border crossing from Lahore to Amritsar, preserved by family descendants to ensure the human pain and resilience are remembered."
              originalTranscript="اس رات ستلج دا پاݨی بڑا خاموش سی..."
              originalLanguage="Punjabi"
              region="Amritsar, Punjab"
              timePeriodLabel="1940s"
              audioDurationSec={410}
              displayPreference="ANONYMOUS"
              isSample={true}
              status="PUBLISHED"
              showStatus={true}
              themes={[
                { name: "Partition", slug: "partition" },
                { name: "Resilience", slug: "resilience" },
              ]}
            />
          </div>
        </section>

        {/* Section 6: Collection Cards Showcase */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            6. Curated Collection Cards (Generated Visuals)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CollectionCard
              slug="grandmothers-kitchen"
              name="Grandmothers' Kitchen"
              description="Heirloom recipes, earthen stove memories, and food traditions passed down through spoken instruction."
              coverGradient="saffron-terracotta"
              motif="wheat-spice"
              storyCount={18}
            />

            <CollectionCard
              slug="vanishing-professions"
              name="Vanishing Professions"
              description="Blacksmiths, water carriers, handloom weavers, and folk singers whose work is disappearing into history."
              coverGradient="ink-moss"
              motif="loom-tools"
              storyCount={12}
            />

            <CollectionCard
              slug="partition-memories"
              name="Partition Memories"
              description="Personal recollections of displacement, shared neighborhoods, and cross-border nostalgia."
              coverGradient="plum-terracotta"
              motif="railway-border"
              storyCount={9}
            />
          </div>
        </section>

        {/* Section 7: Form Inputs & Dialog */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            7. Form Elements, Selects & Dialogs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Sample Input Field
              </label>
              <Input placeholder="Enter story title or theme..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Language Select
              </label>
              <Select defaultValue="hi">
                <SelectTrigger>
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                  <SelectItem value="bho">Bhojpuri (भोजपुरी)</SelectItem>
                  <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                  <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink font-sans">
                Story Excerpt / Transcript
              </label>
              <Textarea placeholder="Type or paste memory notes here..." />
            </div>

            <div className="sm:col-span-2 pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Test Modal Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ethical Consent Confirmation</DialogTitle>
                    <DialogDescription>
                      You are about to make this recording publicly searchable in the archive. Contributors retain copyright and may edit or request removal at any time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="default">Confirm Consent</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Section 8: Skeletons & Empty States */}
        <section className="space-y-4 pt-6 border-t border-line">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            8. Loading Skeletons & Empty States
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          <EmptyState
            title="No search records found"
            description="Try adjusting your time period filters or search in original dialect names."
            actionLabel="Reset Archive Filters"
            onAction={() => toast.info("Filters reset")}
          />
        </section>
      </div>
    </div>
  );
}
