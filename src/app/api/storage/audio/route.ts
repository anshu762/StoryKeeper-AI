import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "@/lib/env";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");

  if (!key) {
    return new NextResponse("Key required", { status: 400 });
  }

  // Validate mandatory HMAC signature and expiry for audio security
  if (!expires || !sig) {
    return new NextResponse("Signed URL with signature and expiration required", {
      status: 403,
    });
  }

  const expiresNum = parseInt(expires, 10);
  if (isNaN(expiresNum) || Date.now() / 1000 > expiresNum) {
    return new NextResponse("Signed URL expired", { status: 403 });
  }

  const secret = env.BETTER_AUTH_SECRET || "local-storage-secret";
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${key}:${expires}`)
    .digest("hex");

  if (sig !== expectedSig) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const filename = path.basename(key);
  let filePath = path.join(LOCAL_UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    // Check public/samples/sample.mp3 as fallback
    const samplePath = path.join(process.cwd(), "public", "samples", "sample.mp3");
    if (fs.existsSync(samplePath)) {
      filePath = samplePath;
    } else {
      return new NextResponse("Audio file not found", { status: 404 });
    }
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".wav"
      ? "audio/wav"
      : ext === ".mp3"
      ? "audio/mpeg"
      : ext === ".m4a"
      ? "audio/mp4"
      : ext === ".ogg"
      ? "audio/ogg"
      : "audio/webm";

  // Handle HTTP Range header for Wavesurfer seek support
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    // Node readable to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": contentType,
      },
    });
  }

  const fileStream = fs.createReadStream(filePath);
  const webStream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    },
  });
}
