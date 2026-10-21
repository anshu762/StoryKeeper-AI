import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const hasR2Credentials = Boolean(
  env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET
);

// Initialize S3 client for Cloudflare R2
const s3Client = hasR2Credentials
  ? new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

// Local upload directory fallback for development
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

/**
 * Generates a presigned PUT URL for direct browser audio upload.
 */
export async function getPresignedUploadUrl(params: {
  key: string;
  mimeType: string;
  sizeBytes?: number;
}): Promise<{ uploadUrl: string; key: string; isLocalFallback: boolean }> {
  const { key, mimeType } = params;

  if (s3Client && env.R2_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { uploadUrl, key, isLocalFallback: false };
  }

  // Local fallback endpoint for development
  const uploadUrl = `/api/upload/local?key=${encodeURIComponent(key)}`;
  return { uploadUrl, key, isLocalFallback: true };
}

/**
 * Generates a short-lived signed GET URL for secure audio streaming.
 * NEVER serves audio publicly without authorization.
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  // If the key references sample audio
  if (key.startsWith("/samples/") || key === "sample.mp3") {
    return "/samples/sample.mp3";
  }

  if (s3Client && env.R2_BUCKET) {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  // Local storage signed URL with HMAC signature
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const secret = env.BETTER_AUTH_SECRET || "local-storage-secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${key}:${expiresAt}`)
    .digest("hex");

  return `/api/storage/audio?key=${encodeURIComponent(
    key
  )}&expires=${expiresAt}&sig=${signature}`;
}

/**
 * Fetches the raw audio bytes on the server and returns a Buffer.
 * Used for Base64 encoding into OpenRouter STT payload.
 */
export async function fetchAudioBuffer(key: string): Promise<Buffer> {
  // Sample audio fallback
  if (key.startsWith("/samples/") || key === "sample.mp3") {
    const localSample = path.join(process.cwd(), "public", "samples", "sample.mp3");
    if (fs.existsSync(localSample)) {
      return fs.readFileSync(localSample);
    }
    // Return empty 1s silence buffer fallback
    return Buffer.alloc(1024);
  }

  if (s3Client && env.R2_BUCKET) {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error(`Audio object not found in R2 for key: ${key}`);
    }

    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  // Local fallback: read from public/uploads/
  const localFile = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
  if (fs.existsSync(localFile)) {
    return fs.readFileSync(localFile);
  }

  // Check public/samples as last resort
  const localSample = path.join(process.cwd(), "public", "samples", "sample.mp3");
  if (fs.existsSync(localSample)) {
    return fs.readFileSync(localSample);
  }

  throw new Error(`Local audio file not found on disk: ${key}`);
}

/**
 * Permanently deletes an audio object from Cloudflare R2 or local storage.
 * Used during GDPR/account deletion or story purging.
 */
export async function deleteAudioObject(key: string | null | undefined): Promise<boolean> {
  if (!key) return false;

  // Never delete sample audio files
  if (key.startsWith("/samples/") || key === "sample.mp3") {
    return false;
  }

  try {
    if (s3Client && env.R2_BUCKET) {
      const command = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    }

    // Local fallback deletion
    const localFile = path.join(LOCAL_UPLOAD_DIR, path.basename(key));
    if (fs.existsSync(localFile)) {
      fs.unlinkSync(localFile);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete audio object for key ${key}:`, error);
    return false;
  }
}
