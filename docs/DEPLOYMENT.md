# StoryKeeper AI — Production Deployment Guide

This guide details the end-to-end procedure for deploying **StoryKeeper AI** to a production stack using **Vercel** (Next.js App Router), **Neon** (Serverless Postgres), **Cloudflare R2** (S3-compatible object storage), and **OpenRouter** (Unified AI Speech-to-Text & LLM).

---

## 1. Architecture Overview

```mermaid
flowchart TD
    Client["Browser / Mobile Client"] -->|HTTPS / App Router| Vercel["Vercel Edge & Serverless Functions"]
    Vercel -->|Pooled Connections (PgBouncer)| NeonPool["Neon Postgres (DATABASE_URL)"]
    Vercel -->|Schema Migrations| NeonDirect["Neon Postgres Direct (DIRECT_URL)"]
    Client -->|Direct Presigned PUT (Audio Upload)| R2["Cloudflare R2 Storage"]
    Vercel -->|Short-lived Signed GET (Audio Playback)| R2
    Vercel -->|Base64 STT & LLM Pipeline| OpenRouter["OpenRouter AI (openai/whisper & deepseek)"]
    Vercel -->|Transactional Password Reset| Resend["Resend Email API"]
```

---

## 2. Neon Postgres Configuration

Neon provides serverless PostgreSQL with connection pooling.

1. **Create a Neon Project**:
   - Create a database called `storykeeper`.
2. **Obtain Connection Strings**:
   - **Pooled connection string (`DATABASE_URL`)**:
     Format: `postgresql://[user]:[password]@[neon-hostname]-pooler.[region].aws.neon.tech/storykeeper?sslmode=require`
     *Used at runtime for serverless queries to avoid connection exhaustion.*
   - **Direct connection string (`DIRECT_URL`)**:
     Format: `postgresql://[user]:[password]@[neon-hostname].[region].aws.neon.tech/storykeeper?sslmode=require`
     *Used by Prisma CLI for schema diffing and running migrations (`prisma migrate deploy`).*

---

## 3. Cloudflare R2 Storage & CORS Setup

1. **Create a Cloudflare R2 Bucket**:
   - Name: `storykeeper-media` (or your preferred name).
2. **Create R2 API Token**:
   - Permission: **Object Read & Write**.
   - Note down: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
3. **Configure CORS Rules on R2**:
   - In Cloudflare Dashboard &rarr; R2 &rarr; Select Bucket &rarr; Settings &rarr; **CORS Policy**:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://your-domain.vercel.app",
         "https://storykeeper.ai",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": [
         "Content-Type",
         "Content-Length",
         "x-amz-content-sha256",
         "x-amz-date",
         "authorization"
       ],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. **Public Bucket Access**: Keep **Public access disabled**. Audio is served strictly via authenticated, short-lived signed URLs.

---

## 4. Vercel Project Setup

1. **Import Repository**:
   - Connect your GitHub repository to Vercel.
2. **Build and Output Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `prisma generate && prisma migrate deploy && next build`
   - Install Command: `pnpm install`
3. **Configure `vercel.json` for Automated Retention Cron**:
   Ensure `vercel.json` contains:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/purge-deleted",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```
4. **Serverless Function Duration**:
   The AI background route `src/app/api/stories/[id]/process/route.ts` specifies `export const maxDuration = 300;` (5 minutes) to ensure complete transcription of longer audio files.

---

## 5. Environment Variables Reference Table

Set these in Vercel Project Settings &rarr; Environment Variables:

| Variable | Required | Description | Sample / Format |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Pooled Neon PostgreSQL connection | `postgresql://user:pass@host-pooler.tech/storykeeper?sslmode=require` |
| `DIRECT_URL` | Yes | Direct Neon connection for migrations | `postgresql://user:pass@host.tech/storykeeper?sslmode=require` |
| `BETTER_AUTH_SECRET` | Yes | 32+ character random secret for sessions | Generate via `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Yes | Canonical root URL of the deployment | `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public root URL for OG images & canonical links | `https://your-domain.vercel.app` |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API Key for STT + LLMs | `sk-or-v1-...` |
| `OPENROUTER_STT_MODEL` | No | STT Model identifier (defaults to whisper) | `openai/whisper-large-v3` |
| `OPENROUTER_LLM_MODEL` | No | LLM Model for translation & metadata | `deepseek/deepseek-chat` or `anthropic/claude-3.5-sonnet` |
| `R2_ACCOUNT_ID` | Yes | Cloudflare 32-character account ID | `a1b2c3d4e5f6...` |
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 Access Key ID | `abc12345...` |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 Secret Access Key | `secret...` |
| `R2_BUCKET` | Yes | Cloudflare R2 bucket name | `storykeeper-media` |
| `R2_PUBLIC_URL` | No | Optional CDN URL (leave empty for signed URLs) | `https://media.storykeeper.ai` |
| `RESEND_API_KEY` | Optional | Resend API key for password reset emails | `re_123456...` (logs to console if unset in dev) |
| `EMAIL_FROM` | Optional | Sender address for system transactional emails | `StoryKeeper <noreply@storykeeper.ai>` |
| `SEED_ADMIN_EMAIL` | Yes | Initial administrator email for seeding | `admin@storykeeper.archive` |
| `SEED_ADMIN_PASSWORD` | Yes | Initial administrator password | `AdminSecurePass123!` |
| `CRON_SECRET` | Optional | Secret key to protect `/api/cron/purge-deleted` | `cron_secret_key...` |

---

## 6. Pre-flight & Verification Checklist

1. [ ] Neon Postgres schemas deployed: `pnpm prisma:deploy`
2. [ ] Database seeded with initial collections and sample stories: `pnpm prisma:seed`
3. [ ] Verify `/api/health` returns `200 OK` with database connected:
   ```bash
   curl -I https://your-domain.vercel.app/api/health
   ```
4. [ ] Contributor audio recording test: record a 15-second voice snippet and verify presigned PUT upload succeeds.
5. [ ] AI pipeline test: verify transcription, translation, and summaries generate within 10–30 seconds.
6. [ ] Admin review test: log in as admin, verify story in `/admin/moderation`, and approve to publish.
7. [ ] Public verification: confirm approved story immediately appears in `/archive?q=harvest` and plays audio via signed URL.
