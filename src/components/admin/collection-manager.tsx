"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Archive,
  RotateCcw,
  Sparkles,
  Eye,
  Check,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createCollection,
  updateCollection,
  reorderCollections,
  toggleCollectionStatus,
  deleteCollection,
} from "@/server/actions/admin";
import { Collection, CollectionStatus } from "@prisma/client";
import { toast } from "sonner";
import slugify from "slugify";
import { getFriendlyErrorMessage } from "@/lib/errors";

interface CollectionItem extends Collection {
  _count: {
    stories: number;
  };
}

interface CollectionManagerProps {
  initialCollections: CollectionItem[];
}

export const MOTIF_OPTIONS = [
  { id: "wheat-spice", label: "Golden Wheat & Spice" },
  { id: "loom-tools", label: "Handloom & Craft" },
  { id: "railway-border", label: "Border & Migration" },
  { id: "diya-flame", label: "Sacred Flame & Ritual" },
  { id: "kite-river", label: "River & Festival" },
  { id: "weave-spiral", label: "Oral Memory & Weave" },
];

export const GRADIENT_OPTIONS = [
  {
    id: "saffron-terracotta",
    label: "Saffron & Terracotta",
    className: "from-[#E3A33B] via-[#C96931] to-[#B5472B]",
  },
  {
    id: "ink-moss",
    label: "Ink & Deep Moss",
    className: "from-[#1F1A17] via-[#2D3A2F] to-[#3F5B45]",
  },
  {
    id: "plum-terracotta",
    label: "Plum & Terracotta",
    className: "from-[#5A3550] via-[#853C3C] to-[#B5472B]",
  },
  {
    id: "saffron-plum",
    label: "Saffron & Royal Plum",
    className: "from-[#E3A33B] via-[#8F4E40] to-[#5A3550]",
  },
  {
    id: "moss-saffron",
    label: "Moss & Sunlit Saffron",
    className: "from-[#3F5B45] via-[#75773B] to-[#E3A33B]",
  },
  {
    id: "plum-ink",
    label: "Night Plum & Ink",
    className: "from-[#5A3550] via-[#352530] to-[#1F1A17]",
  },
];

const gradientStyles: Record<string, string> = {
  "saffron-terracotta": "from-[#E3A33B] via-[#C96931] to-[#B5472B]",
  "ink-moss": "from-[#1F1A17] via-[#2D3A2F] to-[#3F5B45]",
  "plum-terracotta": "from-[#5A3550] via-[#853C3C] to-[#B5472B]",
  "saffron-plum": "from-[#E3A33B] via-[#8F4E40] to-[#5A3550]",
  "moss-saffron": "from-[#3F5B45] via-[#75773B] to-[#E3A33B]",
  "plum-ink": "from-[#5A3550] via-[#352530] to-[#1F1A17]",
};

function MotifPattern({ motif }: { motif: string }) {
  switch (motif) {
    case "wheat-spice":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-wheat"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="3" fill="#FFF" />
              <path
                d="M18 4 Q24 14 18 24 Q12 14 18 4"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <path
                d="M4 18 Q14 24 24 18 Q14 12 4 18"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-wheat)" />
        </svg>
      );
    case "loom-tools":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-loom"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="20" x2="40" y2="20" stroke="#FFF" strokeWidth="1.5" />
              <line x1="20" y1="0" x2="20" y2="40" stroke="#FFF" strokeWidth="1.5" />
              <rect x="16" y="16" width="8" height="8" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-loom)" />
        </svg>
      );
    case "railway-border":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-border"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="12" x2="44" y2="12" stroke="#FFF" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="44" y2="32" stroke="#FFF" strokeWidth="1.5" />
              <line x1="12" y1="6" x2="12" y2="38" stroke="#FFF" strokeWidth="1.5" />
              <line x1="32" y1="6" x2="32" y2="38" stroke="#FFF" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-border)" />
        </svg>
      );
    case "diya-flame":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-diya"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 8 C24 16 28 22 28 26 C28 30 24 34 20 34 C16 34 12 30 12 26 C12 22 16 16 20 8 Z"
                fill="none"
                stroke="#FFF"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="24" r="2.5" fill="#FFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-diya)" />
        </svg>
      );
    case "kite-river":
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-kite"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <polygon points="24,6 40,24 24,42 8,24" fill="none" stroke="#FFF" strokeWidth="1.5" />
              <line x1="24" y1="6" x2="24" y2="42" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="8" y1="24" x2="40" y2="24" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-kite)" />
        </svg>
      );
    default:
      return (
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-pattern-spiral"
              width="36"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="18" cy="18" r="14" fill="none" stroke="#FFF" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="7" fill="none" stroke="#FFF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-pattern-spiral)" />
        </svg>
      );
  }
}

export function CollectionManager({ initialCollections }: CollectionManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);

  // Keep synced with incoming props from server
  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverGradient, setCoverGradient] = useState(GRADIENT_OPTIONS[0].id);
  const [motif, setMotif] = useState(MOTIF_OPTIONS[0].id);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName("");
    setSlug("");
    setDescription("");
    setCoverGradient(GRADIENT_OPTIONS[0].id);
    setMotif(MOTIF_OPTIONS[0].id);
    setCoverImageUrl("");
    setShowModal(true);
  };

  const openEditModal = (col: CollectionItem) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setDescription(col.description);
    setCoverGradient(col.coverGradient);
    setMotif(col.motif);
    setCoverImageUrl(col.coverImageUrl || "");
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCollection) {
      setSlug(slugify(val, { lower: true, strict: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Collection name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCollection) {
        // Optimistic update
        setCollections((prev) =>
          prev.map((c) =>
            c.id === editingCollection.id
              ? {
                  ...c,
                  name,
                  slug,
                  description,
                  coverGradient,
                  motif,
                  coverImageUrl: coverImageUrl || null,
                }
              : c
          )
        );

        await updateCollection(editingCollection.id, {
          name,
          slug,
          description,
          coverGradient,
          motif,
          coverImageUrl: coverImageUrl || undefined,
          status: editingCollection.status,
        });
        toast.success("Collection updated successfully");
      } else {
        const res = await createCollection({
          name,
          slug,
          description,
          coverGradient,
          motif,
          coverImageUrl: coverImageUrl || undefined,
        });

        // Add optimistic new collection to state
        setCollections((prev) => [
          ...prev,
          {
            ...res.collection,
            _count: { stories: 0 },
          },
        ]);
        toast.success("New collection created successfully");
      }
      setShowModal(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Failed to save collection"));
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const newCols = [...collections];
    const [moved] = newCols.splice(index, 1);
    newCols.splice(targetIndex, 0, moved);

    // Update displayOrder
    const payload = newCols.map((c, idx) => ({ id: c.id, displayOrder: idx + 1 }));
    setCollections(newCols);

    try {
      await reorderCollections(payload);
      toast.success("Collection order updated");
    } catch (err: unknown) {
      toast.error("Failed to reorder collections");
      router.refresh();
    }
  };

  // Immediate optimistic toggle archive status (Instant UI update!)
  const handleToggleStatus = async (col: CollectionItem) => {
    const nextStatus: CollectionStatus = col.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    // 1. Optimistic UI update immediately
    setCollections((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, status: nextStatus } : c))
    );

    try {
      await toggleCollectionStatus(col.id, nextStatus);
      toast.success(
        `Collection ${nextStatus === "ACTIVE" ? "restored to active" : "moved to archive"}`
      );
      router.refresh();
    } catch (err: unknown) {
      // Rollback on failure
      setCollections((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, status: col.status } : c))
      );
      toast.error("Failed to update collection status");
    }
  };

  // Immediate optimistic delete
  const handleDelete = async (col: CollectionItem) => {
    if (col._count.stories > 0) {
      toast.error(
        `Cannot delete collection with ${col._count.stories} stories. Please archive or reassign stories first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${col.name}"?`)) {
      return;
    }

    // Optimistic delete
    setCollections((prev) => prev.filter((c) => c.id !== col.id));

    try {
      await deleteCollection(col.id);
      toast.success("Collection permanently removed");
      router.refresh();
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Failed to delete collection"));
      router.refresh();
    }
  };

  const previewGradientClass =
    gradientStyles[coverGradient] || "from-[#E3A33B] via-[#C96931] to-[#B5472B]";

  return (
    <div className="space-y-6">
      {/* Top Header & New Button */}
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <div className="space-y-0.5">
          <p className="text-xs text-muted">
            Managing <strong>{collections.length}</strong> curated exhibitions
          </p>
        </div>
        <Button onClick={openCreateModal} variant="default" size="sm" className="text-xs h-9 bg-terracotta hover:bg-terracotta-hover text-white shadow-xs">
          <Plus className="h-4 w-4 mr-1.5" />
          <span>New Curated Collection</span>
        </Button>
      </div>

      {/* Collections List - Styled like Archive Cards */}
      <div className="grid grid-cols-1 gap-4">
        {collections.map((col, index) => {
          const cardGrad = gradientStyles[col.coverGradient] || "from-terracotta to-plum";
          const isArchived = col.status === "ARCHIVED";

          return (
            <div
              key={col.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col md:flex-row items-stretch justify-between gap-4 ${
                isArchived
                  ? "bg-paper-2/60 border-line/70 opacity-80"
                  : "bg-white border-line/80 hover:border-terracotta/40"
              }`}
            >
              {/* Left Visual Banner Preview */}
              <div
                className={`relative w-full md:w-56 h-32 md:h-auto bg-gradient-to-br ${cardGrad} p-4 text-white flex flex-col justify-between shrink-0 overflow-hidden`}
              >
                <MotifPattern motif={col.motif} />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs border border-white/20">
                    {col.motif}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                    {col._count.stories} stories
                  </span>
                </div>
                <div className="relative z-10">
                  <h4 className="font-serif text-lg font-bold leading-tight line-clamp-1">
                    {col.name}
                  </h4>
                  <p className="text-[10px] text-white/80 font-mono">/{col.slug}</p>
                </div>
              </div>

              {/* Middle Description & Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-center space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {col.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      col.status === "ACTIVE"
                        ? "bg-moss/10 text-moss border border-moss/20"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {col.status}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted pt-1">
                  <span>Slug: <strong className="text-ink">/{col.slug}</strong></span>
                  <span>·</span>
                  <span>Palette: <strong className="text-ink">{col.coverGradient}</strong></span>
                  <span>·</span>
                  <span>Stories: <strong className="text-ink">{col._count.stories}</strong></span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="p-4 flex flex-wrap md:flex-col items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-line/60 shrink-0">
                <div className="flex items-center gap-1.5">
                  {/* Move Up */}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="h-8 w-8 border-line bg-paper/50 hover:bg-paper-2"
                    title="Move Up in order"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  {/* Move Down */}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={index === collections.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="h-8 w-8 border-line bg-paper/50 hover:bg-paper-2"
                    title="Move Down in order"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>

                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(col)}
                    className="h-8 text-xs border-line bg-white hover:border-terracotta/40"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1 text-muted" />
                    <span>Edit</span>
                  </Button>

                  {/* Immediate Archive / Restore button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(col)}
                    className={`h-8 text-xs border ${
                      col.status === "ACTIVE"
                        ? "border-amber-200 text-amber-800 bg-amber-50/50 hover:bg-amber-100/60"
                        : "border-moss/30 text-moss bg-moss/10 hover:bg-moss/20"
                    }`}
                  >
                    {col.status === "ACTIVE" ? (
                      <>
                        <Archive className="h-3.5 w-3.5 mr-1 text-amber-700" />
                        <span>Archive</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 mr-1 text-moss" />
                        <span>Restore</span>
                      </>
                    )}
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(col)}
                    className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                    title="Delete collection"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal (Custom Warm Editorial Archive Theme) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-7 max-w-xl w-full space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-terracotta/10 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-terracotta" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">
                    {editingCollection ? "Edit Curated Collection" : "Create Curated Collection"}
                  </h3>
                  <p className="text-xs text-muted">
                    Exhibitions curate oral stories into cultural, regional, and thematic narratives.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink hover:bg-paper-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Collection Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                    Collection Title <span className="text-terracotta">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Songs of the Monsoon Rhythms"
                    className="text-xs bg-white border-line h-10"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                    URL Slug <span className="text-terracotta">*</span>
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="songs-of-the-monsoon"
                    className="text-xs bg-white border-line h-10"
                    required
                  />
                </div>
              </div>

              {/* Curatorial Description */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Curatorial Description <span className="text-terracotta">*</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the cultural premises, community memories, and historical context of this series..."
                  className="text-xs bg-white border-line leading-relaxed"
                  required
                />
              </div>

              {/* Visual Motif Selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                  Select Cultural Motif Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MOTIF_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMotif(m.id)}
                      className={`text-xs p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        motif === m.id
                          ? "border-terracotta bg-terracotta/10 font-semibold text-terracotta ring-1 ring-terracotta"
                          : "border-line bg-white hover:border-terracotta/40 text-ink"
                      }`}
                    >
                      <span className="truncate">{m.label}</span>
                      {motif === m.id && <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-terracotta" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Palette Selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                  Curatorial Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCoverGradient(g.id)}
                      className={`text-xs p-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                        coverGradient === g.id
                          ? "border-terracotta ring-1 ring-terracotta font-semibold bg-white"
                          : "border-line bg-white/70 hover:border-muted text-ink"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md bg-gradient-to-br ${g.className} border border-black/10 shrink-0`}
                      />
                      <span className="truncate text-[11px]">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card matching CollectionCard exact theme */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-2">
                  Live Archive Exhibition Preview:
                </span>
                <div className="relative rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
                  {/* Decorative Banner */}
                  <div
                    className={`relative h-36 w-full bg-gradient-to-br ${previewGradientClass} p-4 text-white overflow-hidden flex flex-col justify-between`}
                  >
                    <MotifPattern motif={motif} />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/30 backdrop-blur-xs border border-white/20">
                        <Layers className="h-3 w-3" />
                        <span>Curated Collection</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                        0 stories
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h4 className="font-serif text-xl font-medium tracking-tight text-white line-clamp-1">
                        {name || "Collection Title Preview"}
                      </h4>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {description || "Collection description will appear here..."}
                    </p>
                    <div className="flex items-center text-xs font-semibold text-terracotta pt-1">
                      <span>Explore collection</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="border-line text-xs h-9 bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs h-9 bg-terracotta hover:bg-terracotta-hover text-white px-5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : null}
                  <span>{editingCollection ? "Save Changes" : "Create Exhibition"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
