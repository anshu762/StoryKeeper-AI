"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArchiveFacets } from "@/lib/search/facets";
import { SearchFilters, StorySortOption } from "@/lib/search/types";

interface ArchiveFiltersProps {
  facets: ArchiveFacets;
  appliedFilters: SearchFilters;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalCount: number;
}

export function ArchiveFilters({
  facets,
  appliedFilters,
  viewMode,
  onViewModeChange,
  totalCount,
}: ArchiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(appliedFilters.q || "");

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchQuery(appliedFilters.q || "");
  }, [appliedFilters.q]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // reset page on filter change
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleTheme = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const currentThemes = params.getAll("theme");
    params.delete("theme");

    const exists = currentThemes.includes(slug);
    const newThemes = exists
      ? currentThemes.filter((t) => t !== slug)
      : [...currentThemes, slug];

    newThemes.forEach((t) => params.append("theme", t));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchQuery.trim() || null);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    router.push(pathname, { scroll: false });
  };

  const activeThemes = appliedFilters.themes || [];
  const hasActiveFilters = Boolean(
    appliedFilters.q ||
      appliedFilters.language ||
      appliedFilters.region ||
      activeThemes.length > 0 ||
      appliedFilters.timePeriod ||
      appliedFilters.topic ||
      appliedFilters.collection
  );

  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (appliedFilters.q) {
    activeChips.push({
      key: `q-${appliedFilters.q}`,
      label: `"${appliedFilters.q}"`,
      onRemove: () => updateParam("q", null),
    });
  }
  if (appliedFilters.language) {
    activeChips.push({
      key: `lang-${appliedFilters.language}`,
      label: `Lang: ${appliedFilters.language}`,
      onRemove: () => updateParam("language", null),
    });
  }
  if (appliedFilters.region) {
    activeChips.push({
      key: `reg-${appliedFilters.region}`,
      label: `Region: ${appliedFilters.region}`,
      onRemove: () => updateParam("region", null),
    });
  }
  if (appliedFilters.timePeriod) {
    activeChips.push({
      key: `time-${appliedFilters.timePeriod}`,
      label: `Era: ${appliedFilters.timePeriod}`,
      onRemove: () => updateParam("timePeriod", null),
    });
  }
  if (appliedFilters.topic) {
    activeChips.push({
      key: `topic-${appliedFilters.topic}`,
      label: `Topic: ${appliedFilters.topic}`,
      onRemove: () => updateParam("topic", null),
    });
  }
  if (appliedFilters.collection) {
    const colName =
      facets.collections.find((c) => c.value === appliedFilters.collection)
        ?.label || appliedFilters.collection;
    activeChips.push({
      key: `col-${appliedFilters.collection}`,
      label: `Collection: ${colName}`,
      onRemove: () => updateParam("collection", null),
    });
  }
  activeThemes.forEach((slug) => {
    const themeName =
      facets.themes.find((t) => t.value === slug)?.label || slug;
    activeChips.push({
      key: `theme-${slug}`,
      label: `Theme: ${themeName}`,
      onRemove: () => toggleTheme(slug),
    });
  });

  const filterContent = (
    <div className="space-y-6">
      {/* Search Input within Filter */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Keyword Filter
        </label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by term..."
            className="pr-8 bg-paper border-line text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                updateParam("q", null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Languages */}
      {facets.languages.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Language
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("language", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.language
                  ? "bg-primary text-white border-primary"
                  : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.languages.map((lang) => {
              const isSelected = appliedFilters.language?.toLowerCase() === lang.value.toLowerCase();
              return (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() =>
                    updateParam("language", isSelected ? null : lang.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{lang.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {lang.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Themes (Multi-select) */}
      {facets.themes.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Themes
          </label>
          <div className="flex flex-wrap gap-1.5">
            {facets.themes.map((th) => {
              const isSelected = activeThemes.includes(th.value);
              return (
                <button
                  key={th.value}
                  type="button"
                  onClick={() => toggleTheme(th.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-moss text-white border-moss"
                      : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{th.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {th.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Regions */}
      {facets.regions.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Region
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("region", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.region
                  ? "bg-primary text-white border-primary"
                  : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.regions.map((reg) => {
              const isSelected = appliedFilters.region?.toLowerCase() === reg.value.toLowerCase();
              return (
                <button
                  key={reg.value}
                  type="button"
                  onClick={() =>
                    updateParam("region", isSelected ? null : reg.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{reg.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {reg.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Era / Time Period */}
      {facets.timePeriods.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Time Period
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("timePeriod", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.timePeriod
                  ? "bg-primary text-white border-primary"
                  : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.timePeriods.map((tp) => {
              const isSelected = appliedFilters.timePeriod?.toLowerCase() === tp.value.toLowerCase();
              return (
                <button
                  key={tp.value}
                  type="button"
                  onClick={() =>
                    updateParam("timePeriod", isSelected ? null : tp.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper-2/60 text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{tp.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {tp.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Collections */}
      {facets.collections.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Curated Collection
          </label>
          <div className="space-y-1">
            {facets.collections.map((col) => {
              const isSelected = appliedFilters.collection === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() =>
                    updateParam("collection", isSelected ? null : col.value)
                  }
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-saffron/20 border-saffron text-ink font-medium"
                      : "bg-paper-2/40 text-muted-foreground border-transparent hover:bg-paper-2"
                  }`}
                >
                  <span className="truncate">{col.label}</span>
                  <span className="text-[10px] text-muted-foreground/70 ml-2">
                    {col.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="border-t border-line/60 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full text-xs text-muted-foreground hover:text-ink border-line gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );

  const sortValue = appliedFilters.sort || "newest";

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Stats, Sort, View Toggle, Mobile Filter Trigger */}
      <div className="bg-paper-2/50 border border-line rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Story Count & Mobile Trigger */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <p className="text-sm font-medium text-ink">
            Showing <span className="font-semibold">{totalCount}</span> {totalCount === 1 ? "story" : "stories"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden border-line text-xs gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center justify-end gap-2.5">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <Select
              value={sortValue}
              onValueChange={(val) =>
                updateParam("sort", val as StorySortOption)
              }
            >
              <SelectTrigger className="h-9 py-1 px-3 text-xs bg-white/90 rounded-xl border-line min-w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="most_viewed">Most viewed</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-line rounded-lg bg-paper p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "grid"
                  ? "bg-ink text-paper shadow-sm"
                  : "text-muted-foreground hover:text-ink"
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "list"
                  ? "bg-ink text-paper shadow-sm"
                  : "text-muted-foreground hover:text-ink"
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="outline"
              className="bg-paper border-line text-ink text-xs pl-2.5 pr-1.5 py-0.5 gap-1.5 hover:border-primary transition-all"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-primary p-0.5 rounded-full"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-primary hover:underline ml-1"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* Mobile Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10 bg-paper border-t border-line rounded-t-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="font-serif font-semibold text-ink text-base">
                    Filter Archive
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-ink"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {filterContent}

              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Show {totalCount} Stories
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Component export is used in archive layout */}
    </div>
  );
}

export function ArchiveSidebar({
  facets,
  appliedFilters,
}: {
  facets: ArchiveFacets;
  appliedFilters: SearchFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState(appliedFilters.q || "");

  React.useEffect(() => {
    setSearchQuery(appliedFilters.q || "");
  }, [appliedFilters.q]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleTheme = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const currentThemes = params.getAll("theme");
    params.delete("theme");

    const exists = currentThemes.includes(slug);
    const newThemes = exists
      ? currentThemes.filter((t) => t !== slug)
      : [...currentThemes, slug];

    newThemes.forEach((t) => params.append("theme", t));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchQuery.trim() || null);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    router.push(pathname, { scroll: false });
  };

  const activeThemes = appliedFilters.themes || [];
  const hasActiveFilters = Boolean(
    appliedFilters.q ||
      appliedFilters.language ||
      appliedFilters.region ||
      activeThemes.length > 0 ||
      appliedFilters.timePeriod ||
      appliedFilters.topic ||
      appliedFilters.collection
  );

  return (
    <aside className="bg-paper-2/40 border border-line rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-1 border-b border-line/60">
        <h3 className="font-serif font-semibold text-ink text-base flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filter Archive
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Keyword Filter */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Keyword Search
        </label>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="pr-8 bg-paper border-line text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                updateParam("q", null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Languages */}
      {facets.languages.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Language
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("language", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.language
                  ? "bg-primary text-white border-primary"
                  : "bg-paper text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.languages.map((lang) => {
              const isSelected = appliedFilters.language?.toLowerCase() === lang.value.toLowerCase();
              return (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() =>
                    updateParam("language", isSelected ? null : lang.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{lang.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {lang.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Themes */}
      {facets.themes.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Themes
          </label>
          <div className="flex flex-wrap gap-1.5">
            {facets.themes.map((th) => {
              const isSelected = activeThemes.includes(th.value);
              return (
                <button
                  key={th.value}
                  type="button"
                  onClick={() => toggleTheme(th.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-moss text-white border-moss"
                      : "bg-paper text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{th.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {th.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Regions */}
      {facets.regions.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Region
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("region", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.region
                  ? "bg-primary text-white border-primary"
                  : "bg-paper text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.regions.map((reg) => {
              const isSelected = appliedFilters.region?.toLowerCase() === reg.value.toLowerCase();
              return (
                <button
                  key={reg.value}
                  type="button"
                  onClick={() =>
                    updateParam("region", isSelected ? null : reg.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{reg.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {reg.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Period */}
      {facets.timePeriods.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Era
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("timePeriod", null)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                !appliedFilters.timePeriod
                  ? "bg-primary text-white border-primary"
                  : "bg-paper text-muted-foreground border-line hover:border-ink/40"
              }`}
            >
              All
            </button>
            {facets.timePeriods.map((tp) => {
              const isSelected = appliedFilters.timePeriod?.toLowerCase() === tp.value.toLowerCase();
              return (
                <button
                  key={tp.value}
                  type="button"
                  onClick={() =>
                    updateParam("timePeriod", isSelected ? null : tp.value)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-paper text-muted-foreground border-line hover:border-ink/40"
                  }`}
                >
                  <span>{tp.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? "text-white/80" : "text-muted-foreground/60"
                    }`}
                  >
                    {tp.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Collections */}
      {facets.collections.length > 0 && (
        <div className="border-t border-line/60 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
            Curated Collection
          </label>
          <div className="space-y-1">
            {facets.collections.map((col) => {
              const isSelected = appliedFilters.collection === col.value;
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() =>
                    updateParam("collection", isSelected ? null : col.value)
                  }
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-saffron/20 border-saffron text-ink font-medium"
                      : "bg-paper text-muted-foreground border-transparent hover:bg-paper-2"
                  }`}
                >
                  <span className="truncate">{col.label}</span>
                  <span className="text-[10px] text-muted-foreground/70 ml-2">
                    {col.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
