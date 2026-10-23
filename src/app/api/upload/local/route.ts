import { NextRequest, NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "@/lib/storage";
import fs from "fs";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isCloudinaryConfigured()) {
      try {
        const cloudinaryResult = await uploadBufferToCloudinary(buffer, key);
        return NextResponse.json({
          success: true,
          key,
          url: cloudinaryResult.secure_url,
        });
      } catch (cloudErr) {
        console.error("[CLOUDINARY LOCAL FALLBACK ERROR]:", cloudErr);
      }
    }

    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    }

    const filename = path.basename(key);
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    console.error("[LOCAL UPLOAD ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save file" },
      { status: 500 }
    );
  }
}
