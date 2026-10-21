import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const removalSchema = z.object({
  type: z.enum(["EDIT", "REMOVE"]),
  message: z.string().min(5, "Please provide reason details (minimum 5 characters)"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to request edit or removal" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = removalSchema.parse(body);

    const story = await prisma.story.findUnique({
      where: { slug },
      select: { id: true, contributorId: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Role check: must be owner or admin
    const userRole = (session.user as unknown as { role?: string }).role || "CONTRIBUTOR";
    const isOwner = story.contributorId === session.user.id;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the contributing author or an administrator may request removal." },
        { status: 403 }
      );
    }

    const removalRequest = await prisma.removalRequest.create({
      data: {
        storyId: story.id,
        userId: session.user.id,
        type: validated.type,
        message: validated.message,
      },
    });

    return NextResponse.json({
      status: "success",
      requestId: removalRequest.id,
      message:
        validated.type === "REMOVE"
          ? "Your removal request has been submitted to moderators."
          : "Your edit request has been submitted to moderators.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[REMOVAL REQUEST ERROR]", err);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
