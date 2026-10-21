/**
 * Extracts a contextual text snippet around search query terms
 * and highlights occurrences.
 */
export function extractSnippet(
  text: string,
  query: string,
  maxLength = 150
): string {
  if (!text) return "";
  if (!query || !query.trim()) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  const lowerText = text.toLowerCase();

  // Find the position of the first matching term
  let matchIndex = -1;
  let matchedTerm = "";

  for (const term of terms) {
    const idx = lowerText.indexOf(term);
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
      matchedTerm = term;
    }
  }

  // If no match found, return the beginning
  if (matchIndex === -1) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  // Calculate start and end bounds around the match
  const radius = Math.floor(maxLength / 2);
  let start = Math.max(0, matchIndex - radius);
  let end = Math.min(text.length, matchIndex + matchedTerm.length + radius);

  // Adjust to nearest word boundary
  if (start > 0) {
    const spaceIdx = text.indexOf(" ", start);
    if (spaceIdx !== -1 && spaceIdx < matchIndex) {
      start = spaceIdx + 1;
    }
  }

  if (end < text.length) {
    const spaceIdx = text.lastIndexOf(" ", end);
    if (spaceIdx > matchIndex) {
      end = spaceIdx;
    }
  }

  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  return highlightTerms(excerpt, terms);
}

/**
 * HTML escapes a string to prevent XSS injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Wraps matching query terms in safe HTML <mark> tags
 */
export function highlightTerms(text: string, terms: string[]): string {
  if (!text || terms.length === 0) return escapeHtml(text || "");

  // First HTML escape the text to ensure safe rendering
  const safeText = escapeHtml(text);

  // Escape regex special chars and HTML escape terms so they match safeText
  const escaped = terms
    .map((t) => escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  if (escaped.length === 0) return safeText;

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return safeText.replace(
    regex,
    '<mark class="bg-saffron/30 text-ink font-semibold rounded px-0.5">$1</mark>'
  );
}
