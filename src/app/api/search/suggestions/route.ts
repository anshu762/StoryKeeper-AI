import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/search/suggestions";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "search-anon";
  const limit = checkRateLimit(`search-suggest-${ip}`, {
    intervalMs: 60000,
    maxRequests: 60, // 60 requests per minute
  });

  if (!limit.success) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await getSearchSuggestions(q.trim());
  return NextResponse.json({ suggestions });
}
