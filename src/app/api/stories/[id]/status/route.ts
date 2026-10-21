import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: storyId } = await params;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        contributorId: true,
        title: true,
        slug: true,
        status: true,
        originalLanguage: true,
        originalTranscript: true,
        englishTranslation: true,
        summary: true,
        transcriptAi: true,
        translationAi: true,
        summaryAi: true,
        aiJobs: {
          select: {
            id: true,
            type: true,
            status: true,
            errorMessage: true,
            retryCount: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.contributorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isCompleted =
      story.status === "NEEDS_REVIEW" ||
      (story.aiJobs.length > 0 &&
        story.aiJobs.every((j) => j.status === "COMPLETED"));

    const hasFailed = story.aiJobs.some((j) => j.status === "FAILED");

    return NextResponse.json({
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
        status: story.status,
        originalLanguage: story.originalLanguage,
        transcriptAi: story.transcriptAi,
        translationAi: story.translationAi,
        summaryAi: story.summaryAi,
      },
      aiJobs: story.aiJobs,
      isCompleted,
      hasFailed,
    });
  } catch (err: any) {
    console.error("[STORY STATUS ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch story status" },
      { status: 500 }
    );
  }
}
