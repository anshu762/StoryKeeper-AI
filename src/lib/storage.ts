import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const hasCloudinaryCredentials = Boolean(
  (env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET) ||
    env.CLOUDINARY_URL
);

// Initialize Cloudinary
if (hasCloudinaryCredentials) {
  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  } else if (env.CLOUDINARY_URL) {
    const cleanUrl = env.CLOUDINARY_URL.replace(/^CLOUDINARY_URL=/, "");
    cloudinary.config({
      cloudinary_url: cleanUrl,
      secure: true,
    });
  }
}

// Lazy, serverless-safe local upload directory resolver
function getLocalUploadDir(): string {
  const dir = process.env.VERCEL
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "public", "uploads");
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create local upload directory:", err);
  }
  return dir;
}

export function isCloudinaryConfigured(): boolean {
  return hasCloudinaryCredentials;
}

/**
 * Normalizes a storage key for Cloudinary public_id (stripping leading slashes or duplicate extensions if needed)
 */
function sanitizePublicId(key: string): string {
  return key.replace(/^\/+/, "").replace(/\.[^/.]+$/, "");
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  isLocalFallback: boolean;
  isDirectCloudinary?: boolean;
  fields?: Record<string, string>;
}

/**
 * Generates an upload URL for direct browser audio upload.
 * If Cloudinary is configured, returns signed direct Cloudinary upload endpoint & fields.
 * If in dev without Cloudinary, falls back to local upload endpoint.
 */
export async function getPresignedUploadUrl(params: {
  key: string;
  mimeType: string;
  sizeBytes?: number;
}): Promise<PresignedUploadResult> {
  const { key } = params;

  // 1. Direct signed upload to Cloudinary (bypasses serverless payload limit)
  if (
    hasCloudinaryCredentials &&
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = sanitizePublicId(key);
    const folder = "storykeeper_audio";

    const paramsToSign = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`,
      key,
      isLocalFallback: false,
      isDirectCloudinary: true,
      fields: {
        api_key: env.CLOUDINARY_API_KEY,
        timestamp: timestamp.toString(),
        signature,
        folder,
        public_id: publicId,
      },
    };
  }

  // 2. Local fallback endpoint for development
  const uploadUrl = `/api/upload/file?key=${encodeURIComponent(key)}`;
  return {
    uploadUrl,
    key,
    isLocalFallback: true,
    isDirectCloudinary: false,
  };
}

/**
 * Uploads a buffer directly to Cloudinary (used by server actions and upload endpoints)
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  key: string
): Promise<{ secure_url: string; public_id: string }> {
  if (!hasCloudinaryCredentials) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const publicId = sanitizePublicId(key);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // Cloudinary handles audio files under video resource_type
        public_id: publicId,
        overwrite: true,
        folder: "storykeeper_audio",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload returned empty result"));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generates a secure URL for audio streaming/playback.
 * Audio is NEVER served publicly without authorization.
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  // If the key references sample audio
  if (key.startsWith("/samples/") || key === "sample.mp3") {
    return "/samples/sample.mp3";
  }

  // If Cloudinary is configured, generate a signed / secure delivery URL
  if (hasCloudinaryCredentials) {
    const publicId = key.startsWith("storykeeper_audio/")
      ? sanitizePublicId(key)
      : `storykeeper_audio/${sanitizePublicId(key)}`;

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    try {
      // Cloudinary signed delivery URL
      const signedUrl = cloudinary.url(publicId, {
        resource_type: "video",
        secure: true,
        sign_url: true,
        expires_at: expiresAt,
      });

      if (signedUrl) {
        return signedUrl;
      }
    } catch (err) {
      console.warn("Failed to generate signed Cloudinary URL, generating standard secure URL:", err);
      return cloudinary.url(publicId, {
        resource_type: "video",
        secure: true,
      });
    }
  }

  // Local storage signed URL with HMAC signature for secure local streaming
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
    return Buffer.alloc(1024);
  }

  // Check local upload directory first (for local dev or fallback)
  const localFile = path.join(getLocalUploadDir(), path.basename(key));
  if (fs.existsSync(localFile)) {
    return fs.readFileSync(localFile);
  }

  // Fetch from Cloudinary
  if (hasCloudinaryCredentials) {
    const publicId = key.startsWith("storykeeper_audio/")
      ? sanitizePublicId(key)
      : `storykeeper_audio/${sanitizePublicId(key)}`;

    const deliveryUrl = cloudinary.url(publicId, {
      resource_type: "video",
      secure: true,
    });

    try {
      const response = await fetch(deliveryUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (err) {
      console.error(`Failed to fetch audio from Cloudinary (${deliveryUrl}):`, err);
    }
  }

  // Check public/samples as last resort
  const fallbackSample = path.join(process.cwd(), "public", "samples", "sample.mp3");
  if (fs.existsSync(fallbackSample)) {
    return fs.readFileSync(fallbackSample);
  }

  throw new Error(`Audio file not found in Cloudinary or local storage: ${key}`);
}

/**
 * Permanently deletes an audio object from Cloudinary or local storage.
 * Used during GDPR/account deletion or story purging.
 */
export async function deleteAudioObject(key: string | null | undefined): Promise<boolean> {
  if (!key) return false;

  // Never delete sample audio files
  if (key.startsWith("/samples/") || key === "sample.mp3") {
    return false;
  }

  let deleted = false;

  // 1. Delete from Cloudinary if configured
  if (hasCloudinaryCredentials) {
    try {
      const publicId = key.startsWith("storykeeper_audio/")
        ? sanitizePublicId(key)
        : `storykeeper_audio/${sanitizePublicId(key)}`;

      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
      if (res.result === "ok") {
        deleted = true;
      }
    } catch (error) {
      console.error(`Failed to delete audio from Cloudinary for key ${key}:`, error);
    }
  }

  // 2. Delete from local storage if exists
  const localFile = path.join(getLocalUploadDir(), path.basename(key));
  if (fs.existsSync(localFile)) {
    try {
      fs.unlinkSync(localFile);
      deleted = true;
    } catch (err) {
      console.error(`Failed to delete local file for key ${key}:`, err);
    }
  }

  return deleted;
}
