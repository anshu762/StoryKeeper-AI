import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // OpenRouter AI (Cost-effective Gemini Flash + Whisper STT)
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_STT_MODEL: z.string().default("openai/whisper-large-v3"),
  OPENROUTER_LLM_MODEL: z.string().default("google/gemini-2.0-flash-001"),

  // Cloudinary Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),

  // Seed Admin Credentials
  SEED_ADMIN_EMAIL: z.string().email().default("admin@storykeeper.org"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("StoryKeeper2026!Admin"),

  // Cron Secret for scheduled retention workers
  CRON_SECRET: z.string().default("storykeeper-cron-secret-2026"),
});

/**
 * Validated environment object.
 * Safe fallback during build steps if optional keys are missing.
 */
function getEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn(
      "⚠️ Missing or invalid environment variables:\n",
      result.error.flatten().fieldErrors
    );
    // Return raw process.env casted if in build / dev without full env
    return process.env as unknown as z.infer<typeof envSchema>;
  }
  return result.data;
}

export const env = getEnv();
