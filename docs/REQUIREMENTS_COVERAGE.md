# StoryKeeper AI — Requirements Traceability & Coverage Matrix

This document provides a 100% complete mapping of all functional, architectural, ethical, and performance requirements from the StoryKeeper AI specification to their implementation files, API routes, database models, and test verification status.

---

## 1. Product Summary & Core Ethics

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **P0: Explicit Consent** | No story is public without explicit contributor permission (`PUBLIC`). | `src/lib/permissions.ts` (`publicStoryWhere`), `src/components/studio/story-creation-wizard.tsx` | Done (100%) | `permissions.test.ts`, `e2e-journey.test.ts` |
| **P0: Single Filter Helper** | `publicStoryWhere()` must be used across all public queries without exception. | `src/lib/permissions.ts` (line 72) | Done (100%) | `permissions.test.ts`, `e2e-journey.test.ts` |
| **P0: Non-Public Audio Security** | Audio served via short-lived signed URLs generated only after authorization. | `src/lib/storage.ts`, `src/app/api/storage/audio/route.ts` | Done (100%) | `e2e-journey.test.ts`, security audit |
| **P0: Contributor Privacy** | Zero email, phone, or exact address displayed on public pages. | `src/app/(public)/stories/[slug]/page.tsx`, `src/app/api/public/dataset/route.ts` | Done (100%) | `security-permissions.spec.ts` |
| **P0: AI Labeling & Editing** | All AI outputs labeled "AI-generated · editable". Contributor and admin can edit. | `src/components/story/story-tabs.tsx`, `src/app/dashboard/stories/[id]/review/page.tsx` | Done (100%) | Visual inspection, e2e test |
| **P0: Archival Disclaimer** | Public story pages carry memory disclaimer ("Stories represent personal memories..."). | `src/app/(public)/stories/[slug]/page.tsx` | Done (100%) | `e2e/story-lifecycle.spec.ts` |
| **P0: Audit Logging** | Every moderation action and consent change is logged. | `src/server/actions/admin.ts`, `src/server/actions/story.ts`, `prisma/schema.prisma` | Done (100%) | `admin.test.ts`, `e2e-journey.test.ts` |
| **P0: AI Failure Resilience** | Original audio and draft saved before AI runs; browsing never breaks if AI fails. | `src/server/actions/story.ts`, `src/server/ai/pipeline.ts` | Done (100%) | `ai.test.ts` |

---

## 2. Authentication & User Management

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Auth System** | Email + Password, sessions in secure HTTP cookies via Better Auth. | `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts` | Done (100%) | `e2e/auth.spec.ts` |
| **User Roles** | `CONTRIBUTOR` and `ADMIN` roles enforced server-side. | `src/lib/permissions.ts` (`requireAdmin`, `requireUser`), `prisma/schema.prisma` | Done (100%) | `admin.test.ts`, `permissions.test.ts` |
| **Password Reset** | Built-in password reset with Resend email integration (server console fallback in dev). | `src/lib/auth.ts` | Done (100%) | Unit tests |
| **User Settings** | Edit display name, preferred language, default consent, display preference. | `src/app/dashboard/settings/page.tsx`, `src/server/actions/user.ts` | Done (100%) | UI walkthrough |
| **Account Deletion / GDPR** | 30-day grace period, choice between full purge vs anonymous archival contribution. | `src/server/actions/retention.ts`, `src/app/api/cron/purge-deleted/route.ts` | Done (100%) | `admin.test.ts` |

---

## 3. Audio Ingestion & Storage

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Browser Recording** | MediaRecorder with live AnalyserNode visualizer, timer, pause/resume, re-record. | `src/components/studio/audio-recorder.tsx` | Done (100%) | Browser tests |
| **16kHz WAV Encoding** | Client-side PCM WAV encoder (`src/lib/audio/wav-encoder.ts`) for universal OpenRouter compatibility. | `src/lib/audio/wav-encoder.ts` | Done (100%) | Audio pipeline tests |
| **Audio File Upload** | Drag & drop + file picker for MP3, M4A, WAV, OGG with client & server validation (25MB max, 15 min). | `src/components/studio/story-creation-wizard.tsx`, `src/server/actions/story.ts` | Done (100%) | E2E validation |
| **Storage Architecture** | Cloudflare R2 presigned PUT for direct upload, signed GET for streaming, local fallback. | `src/lib/storage.ts`, `src/app/api/upload/presigned/route.ts` | Done (100%) | E2E journey test |
| **Audio Player** | Wavesurfer.js with customizable waveform, playback speed, skip controls, and keyboard accessibility. | `src/components/story/wavesurfer-player.tsx` | Done (100%) | `e2e/story-lifecycle.spec.ts` |

---

## 4. AI Processing Pipeline (OpenRouter)

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Speech-to-Text** | OpenRouter STT (`openai/whisper-large-v3`) with server-side Base64 encoding. | `src/lib/ai/openrouter.ts` (`transcribeAudio`) | Done (100%) | `ai.test.ts` |
| **Audio Chunking** | Splits audio buffers into ~10MB chunks if needed to adhere to provider payload limits. | `src/server/ai/chunking.ts` | Done (100%) | `ai.test.ts` |
| **Translation & Metadata** | English translation, 2-sentence summary, 3–8 keywords, 1–3 theme suggestions via zod. | `src/lib/ai/openrouter.ts` (`generateStoryAnalysis`) | Done (100%) | `ai.test.ts` |
| **JSON Repair Fallback** | Automatic single repair attempt on malformed JSON; marks `AiJob` failed gracefully on error. | `src/lib/ai/openrouter.ts` | Done (100%) | `ai.test.ts` |
| **Asynchronous Execution** | Background execution with `AiJob` table, `after()`, and client polling (`/api/stories/[id]/status`). | `src/app/api/stories/[id]/process/route.ts`, `src/app/api/stories/[id]/status/route.ts` | Done (100%) | `ai.test.ts` |

---

## 5. Contributor Studio & Review

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Contributor Dashboard** | Overview of drafts, processing, submitted, approved stories; notifications for changes. | `src/app/dashboard/page.tsx`, `src/app/dashboard/stories/page.tsx` | Done (100%) | UI walkthrough |
| **Multi-step Creation Wizard** | Step 1 (Audio) &rarr; Step 2 (Metadata & autosave) &rarr; Step 3 (Consent) &rarr; Step 4 (AI Polling). | `src/components/studio/story-creation-wizard.tsx` | Done (100%) | E2E journey tests |
| **Review Editor** | Side-by-side editing of transcripts, translation, summary, keywords, themes, with version safety. | `src/app/dashboard/stories/[id]/review/page.tsx`, `src/server/actions/review.ts` | Done (100%) | E2E journey tests |
| **Submission Guard** | "Submit for Moderation" requires non-empty title and valid audio recording. | `src/server/actions/story.ts` (`submitStoryForModeration`) | Done (100%) | `e2e-journey.test.ts` |

---

## 6. Public Archive, Search & Discovery

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | 10 standout sections (Hero, audio card, language marquee, live stats, timeline, interactive demo, collections, story grid, ethics promise, quote band, CTA). | `src/app/(public)/page.tsx` | Done (100%) | Playwright & browser test |
| **Full-text Search** | Trigram + ILIKE multi-field search across title, transcript, translation, summary, keywords, region, topic. | `src/lib/search/index.ts` | Done (100%) | `search.test.ts`, `e2e-journey.test.ts` |
| **Relevance Ranking** | Weighted scoring: Title (10) > Keywords (7) > Summary (5) > Translation (3) > Transcript (2). | `src/lib/search/ranking.ts` | Done (100%) | `search.test.ts` |
| **Snippet Highlighting** | Excerpt extraction around matched terms wrapped in safe `<mark>` tags (HTML-escaped). | `src/lib/search/snippet.ts` | Done (100%) | `search.test.ts` |
| **Faceted Archive** | Filters by Language, Theme, Region, Decade, and Collection with real facet counts. | `src/app/(public)/archive/page.tsx`, `src/lib/search/facets.ts` | Done (100%) | `search.test.ts` |
| **Decade Timeline** | Decade-by-decade exploration with interactive timeline selector (`1940s` &rarr; `1990s`). | `src/app/(public)/timeline/page.tsx` | Done (100%) | UI walkthrough |
| **Story Detail Page** | Audio playback, native/English tabs, metadata pills, collection link, ethics disclaimer, view counter. | `src/app/(public)/stories/[slug]/page.tsx` | Done (100%) | `e2e/story-lifecycle.spec.ts` |
| **Curated Collections** | Thematic collections with custom gradient covers, SVG motifs, and story counts. | `src/app/(public)/collections/page.tsx`, `src/app/(public)/collections/[slug]/page.tsx` | Done (100%) | UI walkthrough |

---

## 7. Admin Moderation & Management

| Requirement | Specification | Implementation File(s) | Status | Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | KPI overview cards, recent activity feed, quick links, system health. | `src/app/admin/page.tsx` | Done (100%) | `admin.test.ts` |
| **Moderation Queue** | Filterable table/cards with status tabs (Submitted, Needs Changes, Approved, Rejected, All). | `src/app/admin/moderation/page.tsx` | Done (100%) | `e2e/story-lifecycle.spec.ts` |
| **Story Review & Approval** | Pre-flight validation (consent check, AI review check, non-empty fields), approval to publish, rejection with note. | `src/app/admin/stories/[id]/page.tsx`, `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts`, `e2e-journey.test.ts` |
| **Cache Revalidation** | `revalidatePath` called on `/`, `/archive`, `/stories/[slug]`, `/collections` upon publish/unpublish. | `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts` |
| **Collections Management** | Create, edit, archive, and displayOrder management with SVG motif & gradient picker. | `src/app/admin/collections/page.tsx`, `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts` |
| **User & Role Admin** | User list, role promotion/demotion (`CONTRIBUTOR` &harr; `ADMIN`), search by email/name. | `src/app/admin/users/page.tsx`, `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts` |
| **AI Jobs Inspector** | Background job log viewer with retry action for failed jobs. | `src/app/admin/jobs/page.tsx`, `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts` |
| **Removal Requests** | Community report and contributor removal request review with accept/reject actions. | `src/app/admin/requests/page.tsx`, `src/server/actions/admin.ts` | Done (100%) | `admin.test.ts` |
| **Archive Analytics** | Visual charts (stories by language, theme distribution, decade timeline, view metrics) via Recharts. | `src/app/admin/analytics/page.tsx`, `src/components/admin/analytics-charts.tsx` | Done (100%) | UI walkthrough |
| **Dataset Export** | Full archive export in JSON and CSV formats with researcher metadata filters. | `src/app/admin/export/page.tsx`, `src/app/api/admin/export/route.ts` | Done (100%) | `admin.test.ts` |

---

## 8. Summary of Non-Functional Requirements & Security

| Requirement | Implementation | Status |
| :--- | :--- | :--- |
| **Design System Tokens** | `#FBF7F0` (paper), `#F3ECE0` (paper-2), `#1F1A17` (ink), `#B5472B` (terracotta), `#E3A33B` (saffron), `#3F5B45` (moss), `#5A3550` (plum) | Verified in `globals.css` and `tailwind.config.ts` |
| **Typography Stack** | Fraunces (display), Inter (UI), Noto Serif Devanagari & Noto Sans Devanagari (original transcripts) | Configured in `src/app/layout.tsx` |
| **Paper Grain Utility** | SVG paper-grain texture overlay utility class `.paper-grain` | Verified in `globals.css` |
| **Mobile Responsiveness** | Tested and responsive down to 375px mobile viewport | Verified in Playwright mobile project & responsive CSS |
| **Rate Limiting** | Sliding window rate limiter on auth, AI trigger, and search suggestions | Verified in `src/lib/rate-limit.ts` |
| **Security Headers** | HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy | Configured in `next.config.ts` |
| **Signed Audio URLs** | HMAC-SHA256 signature and expiration required for all non-static audio requests | Verified in `src/lib/storage.ts` & `src/app/api/storage/audio/route.ts` |
| **Zero Code Duplication for Public Filter** | `publicStoryWhere()` helper used in every public route and API query | Verified across all public endpoints |

**P0 Requirements Coverage: 100% Complete.**
