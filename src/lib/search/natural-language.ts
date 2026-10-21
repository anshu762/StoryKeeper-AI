export interface ParsedNLQuery {
  originalQuery: string;
  cleanQuery: string;
  extractedThemes: string[];
  extractedRegion?: string;
  extractedLanguage?: string;
  extractedTimePeriod?: string;
}

const KNOWN_THEMES: Record<string, string> = {
  food: "food",
  cooking: "food",
  recipe: "food",
  kitchen: "food",
  craft: "craft",
  weaving: "craft",
  loom: "craft",
  pottery: "craft",
  partition: "partition",
  "1947": "partition",
  border: "partition",
  migration: "migration",
  displacement: "migration",
  refugee: "migration",
  resilience: "resilience",
  community: "community",
  solidarity: "community",
  village: "community",
  festival: "festivals",
  festivals: "festivals",
  celebration: "festivals",
  family: "family",
  ancestors: "family",
  grandmothers: "family",
  farming: "farming",
  agriculture: "farming",
  paddy: "farming",
  harvest: "farming",
  childhood: "childhood",
  youth: "childhood",
  games: "childhood",
  women: "womens-histories",
  "women's histories": "womens-histories",
  mothers: "womens-histories",
  wedding: "marriage-and-weddings",
  weddings: "marriage-and-weddings",
  marriage: "marriage-and-weddings",
  work: "work-and-livelihood",
  profession: "work-and-livelihood",
  livelihood: "work-and-livelihood",
};

const KNOWN_REGIONS = [
  "bihar",
  "punjab",
  "bengal",
  "west bengal",
  "gujarat",
  "delhi",
  "tamil nadu",
  "uttar pradesh",
  "maharashtra",
  "odisha",
  "amritsar",
  "bhojpur",
  "kolkata",
  "thanjavur",
  "pune",
  "ahmedabad",
  "madhubani",
  "gaya",
  "cuttack",
];

const KNOWN_LANGUAGES: Record<string, string> = {
  hindi: "Hindi",
  bhojpuri: "Bhojpuri",
  bengali: "Bengali",
  punjabi: "Punjabi",
  tamil: "Tamil",
  maithili: "Maithili",
  gujarati: "Gujarati",
  english: "English",
};

const TIME_PERIODS = ["1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s"];

/**
 * Parses user natural language phrases into structured filters and clean search terms.
 */
export function parseNaturalLanguageQuery(input: string): ParsedNLQuery {
  const originalQuery = input.trim();
  const lower = originalQuery.toLowerCase();

  const extractedThemes = new Set<string>();
  let extractedRegion: string | undefined;
  let extractedLanguage: string | undefined;
  let extractedTimePeriod: string | undefined;

  // 1. Time period extraction (e.g., "1960s", "from the 1940s")
  for (const period of TIME_PERIODS) {
    if (lower.includes(period)) {
      extractedTimePeriod = period;
      break;
    }
  }

  // 2. Language extraction
  for (const [key, langName] of Object.entries(KNOWN_LANGUAGES)) {
    const langRegex = new RegExp(`\\b(in|recorded in)?\\s*${key}\\b`, "i");
    if (langRegex.test(lower)) {
      extractedLanguage = langName;
      break;
    }
  }

  // 3. Region extraction
  for (const region of KNOWN_REGIONS) {
    const regionRegex = new RegExp(`\\b(from|in|around)\\s+${region}\\b`, "i");
    if (regionRegex.test(lower) || lower.includes(` ${region}`)) {
      extractedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      break;
    }
  }

  // 4. Theme extraction
  for (const [keyword, themeSlug] of Object.entries(KNOWN_THEMES)) {
    const themeRegex = new RegExp(`\\b${keyword}\\b`, "i");
    if (themeRegex.test(lower)) {
      extractedThemes.add(themeSlug);
    }
  }

  // 5. Clean query by stripping boilerplate phrases
  let cleanQuery = originalQuery
    .replace(/\b(show me|find|stories about|stories from|recorded in|tales of|tell me about|mentioning|all stories)\b/gi, "")
    .trim();

  // If after stripping, cleanQuery is empty, fallback to the original
  if (!cleanQuery) {
    cleanQuery = originalQuery;
  }

  return {
    originalQuery,
    cleanQuery,
    extractedThemes: Array.from(extractedThemes),
    extractedRegion,
    extractedLanguage,
    extractedTimePeriod,
  };
}
