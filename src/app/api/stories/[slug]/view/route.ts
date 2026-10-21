import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicStoryWhere } from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Ignore prefetch requests
  const purpose =
    request.headers.get("purpose") ||
    request.headers.get("x-purpose") ||
    request.headers.get("sec-purpose");
  if (purpose === "prefetch") {
    return NextResponse.json({ status: "ignored_prefetch" });
  }

  // 2. Ignore bot user agents
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  if (
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider") ||
    userAgent.includes("googlebot")
  ) {
    return NextResponse.json({ status: "ignored_bot" });
  }

  // 3. Deduplicate via session cookie
  const cookieName = `viewed_${slug}`;
  const alreadyViewed = request.cookies.get(cookieName);
  if (alreadyViewed) {
    return NextResponse.json({ status: "already_recorded" });
  }

  try {
    // 4. Only record view if story matches publicStoryWhere
    const story = await prisma.story.findFirst({
      where: {
        slug,
        ...publicStoryWhere(),
      },
      select: { id: true, viewCount: true },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found or not public" },
        { status: 404 }
      );
    }

    // 5. Update viewCount & record StoryView
    await prisma.$transaction([
      prisma.story.update({
        where: { id: story.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.storyView.create({
        data: { storyId: story.id },
      }),
    ]);

    const response = NextResponse.json({
      status: "recorded",
      views: story.viewCount + 1,
    });

    // Set cookie for 24 hours
    response.cookies.set(cookieName, "1", {
      maxAge: 60 * 60 * 24,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.warn("[VIEW RECORD ERROR]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
