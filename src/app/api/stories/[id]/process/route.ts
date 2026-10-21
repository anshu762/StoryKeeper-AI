import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runAiPipeline } from "@/server/ai/pipeline";
import { after } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 300; // 5 minutes max on serverless

export async function POST(
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

    const ip = request.headers.get("x-forwarded-for") || session.user.id;
    const limit = checkRateLimit(`ai-proc-${ip}`, {
      intervalMs: 60000,
      maxRequests: 10,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many AI processing requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const { id: storyId } = await params;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, contributorId: true, audioKey: true, status: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.contributorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!story.audioKey) {
      return NextResponse.json(
        { error: "No audio recording attached to story" },
        { status: 400 }
      );
    }

    // Mark status as PROCESSING immediately
    await prisma.story.update({
      where: { id: storyId },
      data: { status: "PROCESSING" },
    });

    // Run the AI pipeline in the background using Next.js after()
    after(async () => {
      try {
        await runAiPipeline(storyId);
      } catch (err) {
        console.error(`[BACKGROUND PIPELINE ERROR] Story ${storyId}:`, err);
      }
    });

    return NextResponse.json({
      success: true,
      message: "AI pipeline dispatched",
      storyId,
    });
  } catch (error: any) {
    console.error("[AI TRIGGER ROUTE ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to trigger AI processing" },
      { status: 500 }
    );
  }
}
