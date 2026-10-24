/**
 * StoryKeeper Centralized User-Friendly Error Sanitizer
 * Ensures users NEVER see raw Prisma stack traces, database codes, or raw SQL errors.
 */

export function getFriendlyErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!err) return fallback;

  let rawMessage = "";
  if (typeof err === "string") {
    rawMessage = err;
  } else if (err instanceof Error) {
    rawMessage = err.message || "";
  } else if (typeof err === "object" && err !== null && "message" in err) {
    rawMessage = String((err as { message: unknown }).message || "");
  }

  if (!rawMessage || rawMessage.trim().length === 0) {
    return fallback;
  }

  const lower = rawMessage.toLowerCase();

  // 1. Prisma Unique Constraint (P2002)
  if (lower.includes("unique constraint") || lower.includes("p2002")) {
    return "A story or record with this title or slug already exists. Please use a unique title.";
  }

  // 2. Prisma Record Not Found (P2025)
  if (
    lower.includes("record to update not found") ||
    lower.includes("record to delete does not exist") ||
    lower.includes("p2025")
  ) {
    return "The requested record could not be found or has already been removed.";
  }

  // 3. Prisma Foreign Key or Relation constraint
  if (lower.includes("foreign key") || lower.includes("p2003")) {
    return "This action could not be completed because of a related record dependency.";
  }

  // 4. Database Connection & Timeout Errors
  if (
    lower.includes("cant reach database") ||
    lower.includes("can't reach database") ||
    lower.includes("connection pool") ||
    lower.includes("neondberror") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("etimedout") ||
    lower.includes("ssl connection") ||
    lower.includes("timeout")
  ) {
    return "Unable to connect to the archive storage at the moment. Please check your internet connection and try again.";
  }

  // 5. Catch any other Prisma or SQL syntax / query engine errors
  if (
    lower.includes("prisma") ||
    lower.includes("invocation:") ||
    lower.includes("query engine") ||
    lower.includes("syntax error in sql") ||
    lower.includes("postgresql") ||
    lower.includes("select ") ||
    lower.includes("insert into") ||
    lower.includes("update ")
  ) {
    return "A temporary database interruption occurred. Your work is safe; please try again.";
  }

  // 6. Next.js digest or internal server errors
  if (lower.includes("nextjs") || lower.includes("digest:")) {
    return "The server encountered a momentary delay. Please refresh or try again in a few moments.";
  }

  // 7. Audio / Upload / Network specific errors
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("load failed")
  ) {
    return "Network connection issue. Please check your internet connection and retry.";
  }

  // 8. JSON parse / HTML server error responses (e.g. Unexpected token '<', "<!DOCTYPE "...)
  if (
    lower.includes("unexpected token") ||
    lower.includes("not valid json") ||
    lower.includes("<!doctype") ||
    lower.includes("doctype") ||
    lower.includes("json.parse") ||
    lower.includes("syntaxerror")
  ) {
    return "The archive server responded unexpectedly. Please check your recording and try again.";
  }

  // 9. AI Provider / OpenRouter / Model specific errors (Never show technical model or provider JSON to users)
  if (
    lower.includes("openrouter") ||
    lower.includes("no provider serves this model") ||
    lower.includes("is no longer available") ||
    lower.includes("translation error") ||
    lower.includes("stt error") ||
    lower.includes("speech-to-text") ||
    lower.includes("gemini") ||
    lower.includes("whisper") ||
    lower.includes("openai") ||
    lower.includes("claude") ||
    lower.includes("user_id") ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("insufficient_quota") ||
    lower.includes("credits") ||
    lower.includes("model ") ||
    lower.includes("json repair failed")
  ) {
    if (lower.includes("transcription") || lower.includes("stt") || lower.includes("speech")) {
      return "The automated speech transcription is taking longer than expected. Your audio is safely saved; you can retry or continue manually.";
    }
    if (lower.includes("translation") || lower.includes("translate")) {
      return "The automated translation service experienced a brief delay. Your original transcript is safe; please click retry or continue to edit.";
    }
    if (lower.includes("analysis") || lower.includes("summary") || lower.includes("theme")) {
      return "The story analysis service is momentarily delayed. Your story details are safe; please click retry or review manually.";
    }
    return "The automated preservation service experienced a momentary delay. Your recorded memory is completely safe; please click retry or continue manually.";
  }

  // 10. Reject any raw JSON, stack trace or error response code strings
  if (
    rawMessage.includes("{") ||
    rawMessage.includes("}") ||
    rawMessage.includes("Error:") ||
    rawMessage.includes("status:") ||
    rawMessage.includes("code:") ||
    rawMessage.includes("404") ||
    rawMessage.includes("500") ||
    rawMessage.includes("502") ||
    rawMessage.includes("503") ||
    rawMessage.includes("<!") ||
    rawMessage.includes("/>") ||
    rawMessage.includes("http") ||
    rawMessage.includes(".ts:") ||
    rawMessage.includes(".js:")
  ) {
    return fallback;
  }

  // If the message is already short, human-friendly, and contains no code jargon, pass it through
  const technicalKeywords = [
    "undefined",
    "null",
    "token",
    "jwt",
    "api",
    "endpoint",
    "sql",
    "db",
    "prisma",
    "postgres",
    "server",
    "payload",
    "json",
    "chunk",
    "object",
    "array",
  ];
  const containsTechnicalWord = technicalKeywords.some((w) => lower.includes(w));

  if (
    !containsTechnicalWord &&
    rawMessage.length < 120 &&
    !rawMessage.includes("at ") &&
    !rawMessage.includes("\n")
  ) {
    return rawMessage;
  }

  return fallback;
}
