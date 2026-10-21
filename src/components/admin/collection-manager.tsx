"use client";

import React, { useState } from "react";
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

interface CollectionItem extends Collection {
  _count: {
    stories: number;
  };
}

interface CollectionManagerProps {
  initialCollections: CollectionItem[];
}

const MOTIF_OPTIONS = [
  { id: "lotus", label: "Sacred Lotus" },
  { id: "waves", label: "River Waves" },
  { id: "tree-of-life", label: "Tree of Life" },
  { id: "sun", label: "Harvest Sun" },
  { id: "grain", label: "Golden Grain" },
  { id: "geometric", label: "Folk Geometry" },
];

const GRADIENT_OPTIONS = [
  { id: "from-[#E3A33B]/30 via-[#B5472B]/15 to-paper-2", label: "Saffron & Terracotta" },
  { id: "from-[#3F5B45]/30 via-[#E3A33B]/15 to-paper-2", label: "Moss & Saffron" },
  { id: "from-[#5A3550]/30 via-[#B5472B]/15 to-paper-2", label: "Plum & Terracotta" },
  { id: "from-[#B5472B]/30 via-[#5A3550]/15 to-paper-2", label: "Terracotta & Plum" },
  { id: "from-[#1F1A17]/20 via-[#3F5B45]/15 to-paper-2", label: "Ink & Moss Forest" },
];

export function CollectionManager({ initialCollections }: CollectionManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);

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
        await createCollection({
          name,
          slug,
          description,
          coverGradient,
          motif,
          coverImageUrl: coverImageUrl || undefined,
        });
        toast.success("New collection created successfully");
      }
      setShowModal(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save collection");
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

  const handleToggleStatus = async (col: CollectionItem) => {
    const nextStatus: CollectionStatus = col.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    try {
      await toggleCollectionStatus(col.id, nextStatus);
      toast.success(`Collection ${nextStatus === "ACTIVE" ? "restored" : "archived"}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error("Failed to update collection status");
    }
  };

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

    try {
      await deleteCollection(col.id);
      toast.success("Collection deleted");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete collection");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex justify-end">
        <Button onClick={openCreateModal} variant="moss" size="sm" className="text-xs h-9">
          <Plus className="h-4 w-4 mr-1.5" />
          <span>New Curated Collection</span>
        </Button>
      </div>

      {/* Collections List */}
      <div className="grid grid-cols-1 gap-4">
        {collections.map((col, index) => (
          <div
            key={col.id}
            className={`rounded-2xl border p-5 shadow-warm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              col.status === "ARCHIVED"
                ? "bg-gray-50/80 border-gray-200 opacity-70"
                : "bg-white border-line"
            }`}
          >
            {/* Left Preview & Motif */}
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${col.coverGradient} border border-line/60 flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Sparkles className="h-6 w-6 text-terracotta/70" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {col.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      col.status === "ACTIVE"
                        ? "bg-moss/10 text-moss"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {col.status}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-1 max-w-lg">
                  {col.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted font-medium pt-0.5">
                  <span>Slug: /{col.slug}</span>
                  <span>·</span>
                  <span>Motif: {col.motif}</span>
                  <span>·</span>
                  <span>{col._count.stories} oral stories</span>
                </div>
              </div>
            </div>

            {/* Actions: Reorder & Edit */}
            <div className="flex items-center gap-1.5 self-end md:self-center">
              {/* Move Buttons */}
              <Button
                variant="outline"
                size="icon"
                disabled={index === 0}
                onClick={() => handleMove(index, "up")}
                className="h-8 w-8 border-line bg-white"
                title="Move Up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={index === collections.length - 1}
                onClick={() => handleMove(index, "down")}
                className="h-8 w-8 border-line bg-white"
                title="Move Down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>

              {/* Edit */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(col)}
                className="h-8 text-xs border-line bg-white"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1 text-muted" />
                <span>Edit</span>
              </Button>

              {/* Archive / Restore */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(col)}
                className="h-8 text-xs border-line bg-white"
              >
                {col.status === "ACTIVE" ? (
                  <>
                    <Archive className="h-3.5 w-3.5 mr-1 text-amber-600" />
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
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="font-serif text-lg font-bold text-ink">
                {editingCollection ? "Edit Collection" : "Create New Collection"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Collection Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Songs of the Monsoon Rhythms"
                  className="text-xs bg-paper border-line"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  URL Slug
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="songs-of-the-monsoon"
                  className="text-xs bg-paper border-line"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1">
                  Curatorial Description *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Thematic premise and community context for this oral history series..."
                  className="text-xs bg-paper border-line"
                  required
                />
              </div>

              {/* Motif Selection */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                  Cover Motif SVG
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOTIF_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMotif(m.id)}
                      className={`text-xs p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        motif === m.id
                          ? "border-terracotta bg-terracotta/5 font-semibold text-terracotta"
                          : "border-line bg-white/60 text-ink hover:bg-white"
                      }`}
                    >
                      <span>{m.label}</span>
                      {motif === m.id && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Palette */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                  Gradient Palette
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GRADIENT_OPTIONS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCoverGradient(g.id)}
                      className={`text-xs p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                        coverGradient === g.id
                          ? "border-terracotta ring-1 ring-terracotta font-semibold"
                          : "border-line hover:border-muted"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g.id} border border-line/60 shrink-0`}
                      />
                      <span className="text-ink">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-1.5">
                  Live Preview:
                </span>
                <div
                  className={`rounded-2xl border border-line p-5 bg-gradient-to-br ${coverGradient} shadow-warm space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-saffron">
                      Curated Exhibition · {motif}
                    </span>
                    <Sparkles className="h-4 w-4 text-terracotta" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-ink">
                    {name || "Collection Title Preview"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {description || "Collection description will appear here..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="border-line text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="moss"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : null}
                  <span>{editingCollection ? "Save Changes" : "Create Collection"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
