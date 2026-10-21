"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestion } from "@/lib/search/types";

interface SearchInputBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function SearchInputBar({
  initialQuery = "",
  onSearch,
  autoFocus = false,
}: SearchInputBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync state if initialQuery changes
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounce suggestion fetching
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn("[AUTOCOMPLETE ERROR]", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    if (suggestion.type === "story" && suggestion.slug) {
      router.push(`/stories/${suggestion.slug}`);
    } else if (suggestion.type === "theme" && suggestion.slug) {
      router.push(`/archive?theme=${suggestion.slug}`);
    } else {
      executeSearch(suggestion.text);
    }
  };

  const executeSearch = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;
    setIsOpen(false);
    if (onSearch) {
      onSearch(clean);
    } else {
      router.push(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else {
      executeSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder='Search stories, keywords, or "Ask the archive"...'
            autoFocus={autoFocus}
            className="w-full pl-12 pr-12 py-3.5 sm:py-4 text-base sm:text-lg bg-paper border-2 border-line focus-visible:border-terracotta rounded-2xl shadow-sm text-ink placeholder:text-muted-foreground"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
            </div>
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-ink rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          className="ml-2 sm:ml-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 shrink-0 shadow-sm"
        >
          <span className="hidden sm:inline font-medium">Search</span>
          <ArrowRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-paper border border-line rounded-2xl shadow-warm-lg overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-line/60 px-3">
            Matching Archives & Terms
          </div>
          <ul className="py-1 max-h-72 overflow-y-auto">
            {suggestions.map((suggestion, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={`${suggestion.type}-${suggestion.text}-${idx}`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? "bg-paper-2 text-terracotta" : "text-ink hover:bg-paper-2/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {suggestion.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {suggestion.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.count} {suggestion.count === 1 ? "story" : "stories"}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase bg-paper-2 px-2 py-0.5 rounded border border-line text-muted-foreground">
                      {suggestion.type}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
