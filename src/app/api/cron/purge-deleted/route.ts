import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { purgeExpiredDeletions } from "@/server/actions/retention";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const providedSecret = authHeader?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("secret");

  if (!providedSecret || providedSecret !== env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET." },
      { status: 401 }
    );
  }

  try {
    const result = await purgeExpiredDeletions();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Cron purge-deleted error:", error);
    return NextResponse.json(
      { error: "Internal retention worker error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
