import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/storage";

// Max audio size: 25 MB
const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024;

// Max audio duration: 15 minutes (900 seconds)
const MAX_AUDIO_DURATION_SEC = 15 * 60;

const ALLOWED_MIME_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mimeType, sizeBytes, filename } = body;

    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid audio format: ${mimeType}. Please upload MP3, M4A, WAV, OGG, or WebM.`,
        },
        { status: 400 }
      );
    }

    if (sizeBytes && sizeBytes > MAX_AUDIO_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds the 25 MB limit. Please trim or compress your recording.`,
        },
        { status: 400 }
      );
    }

    const ext = mimeType.includes("wav")
      ? "wav"
      : mimeType.includes("mpeg") || mimeType.includes("mp3")
      ? "mp3"
      : mimeType.includes("ogg")
      ? "ogg"
      : mimeType.includes("mp4") || mimeType.includes("m4a")
      ? "m4a"
      : "wav";

    const cleanFilename = (filename || "audio")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const key = `audio/${session.user.id}/${Date.now()}_${cleanFilename}.${ext}`;

    const presigned = await getPresignedUploadUrl({
      key,
      mimeType,
      sizeBytes,
    });

    return NextResponse.json(presigned);
  } catch (error: any) {
    console.error("[PRESIGNED UPLOAD ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
