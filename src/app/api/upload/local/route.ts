import { NextRequest, NextResponse } from "next/server";
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

    if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
      fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    }

    const filename = path.basename(key);
    const filePath = path.join(LOCAL_UPLOAD_DIR, filename);

    const buffer = Buffer.from(await request.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    console.error("[LOCAL UPLOAD ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save file locally" },
      { status: 500 }
    );
  }
}
