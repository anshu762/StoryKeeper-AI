import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import {
  sanitizeStoryForExport,
  formatStoriesAsCsv,
} from "@/lib/export";
import { StoryPermission } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Unauthorized: Administrator privileges required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const language = searchParams.get("language") || "";
  const collectionId = searchParams.get("collection") || "";
  const permissionTier = searchParams.get("tier") || "public";

  // Build filter - STRICTLY excluding PRIVATE stories
  const permissions: StoryPermission[] =
    permissionTier === "research"
      ? ["PUBLIC", "RESEARCH_ONLY"]
      : ["PUBLIC"];

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: { in: ["PUBLISHED", "APPROVED"] },
    permission: { in: permissions },
  };

  if (language) {
    where.originalLanguage = language;
  }

  if (collectionId) {
    where.collectionId = collectionId;
  }

  const stories = await prisma.story.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      contributor: {
        select: { name: true, email: true },
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

  const sanitized = stories.map(sanitizeStoryForExport);

  const timestamp = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csvContent = formatStoriesAsCsv(sanitized);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="storykeeper-archive-${timestamp}.csv"`,
      },
    });
  }

  // Default JSON format
  return new NextResponse(
    JSON.stringify(
      {
        archive: "StoryKeeper Oral History Archive",
        license:
          "Creative Commons BY-NC-ND 4.0 / Ethical Community Oral History Charter",
        exportedAt: new Date().toISOString(),
        totalRecords: sanitized.length,
        stories: sanitized,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="storykeeper-archive-${timestamp}.json"`,
      },
    }
  );
}
