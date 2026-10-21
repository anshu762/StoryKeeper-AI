import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";
import { sanitizeStoryForExport } from "@/lib/export";

export const dynamic = "force-dynamic";

// Basic in-memory rate limiting: max 30 requests per IP per 5 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= 30) {
    return false;
  }

  current.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        error:
          "Too many requests to public researcher dataset API. Please retry in 5 minutes.",
      },
      { status: 429 }
    );
  }

  // AGENTS.md Rule 2: publicStoryWhere() used strictly
  const stories = await prisma.story.findMany({
    where: publicStoryWhere(),
    orderBy: { publishedAt: "desc" },
    include: {
      contributor: {
        select: { name: true }, // No email!
      },
      collection: {
        select: { name: true },
      },
      keywords: {
        include: { keyword: true },
      },
      themes: {
        include: { theme: true },
      },
    },
  });

  const sanitized = stories.map((s) =>
    sanitizeStoryForExport({
      ...s,
      contributor: { name: s.contributor.name },
    })
  );

  return NextResponse.json(
    {
      archive: "StoryKeeper Oral History Digital Repository",
      description:
        "Open public dataset of community-preserved oral memories and folk traditions.",
      version: "1.0",
      license: "Creative Commons BY-NC-ND 4.0",
      disclaimer:
        "Stories represent personal memories and community histories, not verified historical facts.",
      exportedAt: new Date().toISOString(),
      totalRecords: sanitized.length,
      records: sanitized,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
