import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";

const reportSchema = z.object({
  reason: z.string().min(2, "Reason is required"),
  details: z.string().max(1000).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idOrSlug } = await params;

  try {
    const body = await request.json();
    const validated = reportSchema.parse(body);

    const story = await prisma.story.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...publicStoryWhere(),
      },
      select: { id: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const report = await prisma.storyReport.create({
      data: {
        storyId: story.id,
        reason: validated.reason,
        details: validated.details || null,
        email: validated.email || null,
      },
    });

    return NextResponse.json({
      status: "success",
      reportId: report.id,
      message: "Concern received. An archivist will review it promptly.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[REPORT CONCERN ERROR]", err);
    return NextResponse.json(
      { error: "Failed to submit report. Please try again." },
      { status: 500 }
    );
  }
}
