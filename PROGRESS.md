# StoryKeeper AI — Project Progress

## Phase 1: Project Setup, Database, Auth & Design System
**Status**: COMPLETED

### Done in Phase 1
- **Project Scaffolding**: Next.js 15 App Router with TypeScript strict mode, Tailwind CSS with custom editorial archive design tokens (`paper`, `paper-2`, `ink`, `muted`, `line`, `terracotta`, `saffron`, `moss`, `plum`), and paper grain overlay.
- **Typography**: Google Fonts integrated via `next/font`: `Fraunces` (serif headlines), `Inter` (UI/body), `Noto Serif Devanagari` and `Noto Sans Devanagari` (multilingual script rendering).
- **Environment Validation**: `src/lib/env.ts` with Zod schema validation; complete `.env.example` provided.
- **Database Architecture (Prisma + Neon)**:
  - Models: `User`, `Session`, `Account`, `Verification`, `Story`, `Keyword`, `StoryKeyword`, `Theme`, `StoryTheme`, `Collection`, `AiJob`, `ModerationLog`, `ConsentLog`, `RemovalRequest`, `StoryView`, `SearchLog`, `StoryReport`.
  - Full PostgreSQL migration SQL with `pg_trgm` extension and GIN trigram indexes on `Story(title, summary, originalTranscript, englishTranslation)` and `Keyword(normalizedName)`.
  - Prisma client generated.
- **Permission System (`src/lib/permissions.ts`)**:
  - `publicStoryWhere()` (AGENTS.md rule 2 helper) ensuring ONLY `status = PUBLISHED AND permission = PUBLIC AND deletedAt = null` stories are accessible publicly.
  - `canViewStory`, `canEditStory`, `requireUser`, `requireAdmin` server-side helpers.
  - Comprehensive unit test suite in Vitest (`src/lib/permissions.test.ts`) with 12 passing tests.
- **Authentication (Better Auth)**:
  - Email + password provider, Prisma adapter, session cookie management.
  - Role management: `CONTRIBUTOR` (default) and `ADMIN` (restricted).
  - Password reset with token flow (Resend API or dev console fallback).
  - Route protection in `src/middleware.ts` for `/dashboard/*`, `/admin/*`, and auth page redirects with `callbackUrl` preservation.
  - Designed split-screen auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password` with heritage quotes and animated waveform.
- **App Shells & UI Components**:
  - Public shell: Sticky translucent navbar, mobile navigation drawer, editorial footer with historical disclaimer.
  - Contributor Dashboard layout: Desktop sidebar + mobile bottom navigation tab bar.
  - Admin layout: Dedicated admin console sidebar with moderation and log metrics.
  - Reusable component library: `Button` (all variants), `Card`, `Badge`, `StatusBadge`, `AiBadge`, `SampleBadge`, `StoryCard`, `CollectionCard`, `EmptyState`, `PageHeader`, `SectionHeading`, `Input`, `Textarea`, `Select`, `Tabs`, `Dialog`, `DropdownMenu`, `Skeleton`, `Toaster`.
  - Dev-only `/design` route displaying all tokens and components with a 375px mobile preview mode toggle.
  - Global `not-found.tsx` and `error.tsx` styled to match the warm archive aesthetic.
- **API Health Check**: `/api/health` validating database connectivity.
- **Rich Seed Data (`prisma/seed.ts`)**:
  - Admin user from `SEED_ADMIN_EMAIL`/`PASSWORD` and 3 regional contributors.
  - 15 Cultural Themes and 6 Curated Collections with unique gradients and SVG motifs.
  - 14 Diverse sample oral stories across Indian languages (Hindi, Bhojpuri, Maithili, Bengali, Punjabi, Tamil, English) with Devanagari/regional scripts, English translations, and summaries.
  - 7 Non-public test stories (`draft`, `needs_review`, `submitted`, `research_only`, `private`, `archived`, soft-deleted).
  - Valid audio placeholder generated at `public/samples/sample.mp3`.

---

## Phase 2: Public Website, Search, Archive & Story Experience
**Status**: COMPLETED

### Done in Phase 2
- **Landing Page (`/`)**:
  - 10 full sections crafted in exact sequence with zero lorem ipsum:
    1. **Hero**: Headline *"Every elder is a library. Let’s not lose the books."*, drifting gradient blobs, generative waveform SVG, staggered reveal animation, floating *"now playing"* sample story card with live interactive audio playback, scroll parallax.
    2. **Language Marquee**: Continuous marquee featuring 10+ languages (Devanagari/regional script + English name).
    3. **Animated Stats Strip**: Live animated scroll count-up of preserved stories, languages, regions, and audio hours.
    4. **How It Works**: 4-step vertical timeline with dynamic drawing SVG progress line on scroll.
    5. **"See the Magic" Interactive Demo**: Bilingual split demo switching between Original native script, English translation, and AI summary with review badges.
    6. **Featured Collections**: Horizontal drag/scroll-snap carousel with unique gradients and SVG motifs.
    7. **Featured Stories**: Staggered grid of real stories from the database.
    8. **Ethics Promise**: 4 animated pillar cards highlighting explicit consent, non-public privacy, and contributor rights.
    9. **Voices / Quote Band**: Rotating authentic oral history quotes with smooth cross-fading.
    10. **Final CTA Band**: Contributor callout with links to guide and archive.
  - Fixed top scroll progress bar (`<ScrollProgress />`) and smooth anchor interactions.
- **Archive Page (`/archive`)**:
  - Server-rendered with URL-driven state (`q`, `region`, `language`, `theme` multi-select, `timePeriod`, `topic`, `collection`, `sort`, `page`).
  - Desktop sidebar + mobile bottom-sheet drawer with dynamic facet counts per option.
  - Removable active filter chips and "Clear all" button.
  - Grid / List view toggle with animated Framer Motion layout transitions.
  - Designed empty state and full pagination controls.
- **Search Engine & Dedicated Page (`/search` & `src/lib/search/`)**:
  - Full PostgreSQL trigram (`pg_trgm`) + multi-term `ILIKE` weighted ranking (`title (10) > keywords (7) > summary (5) > translation (3) > transcript (2) > region/topic (2)`).
  - Partial matching ("harvest" finds "harvest festival").
  - Contextual snippet extraction with `<mark>` term highlighting.
  - Autocomplete suggestion endpoint (`/api/search/suggestions`) with debouncing and keyboard navigation.
  - Rule-based "Ask the archive" natural-language query parser extracting themes, regions, languages, and decades.
  - Background `SearchLog` recording.
  - 10 Vitest unit tests verifying ranking, snippets, and privacy guarantees.
- **Story Detail Page (`/stories/[slug]`)**:
  - Dynamic SEO metadata and OpenGraph tags.
  - Strict 404 enforcement for non-public stories using `publicStoryWhere()`.
  - Accessible sticky audio waveform player using Wavesurfer.js (play/pause, ±15s skip, 0.75x–2x speed controls, seekbar, keyboard shortcuts).
  - Animated bilingual transcript tabs (Original native script with `lang` attribute, English translation, and summary).
  - AI badge labeled *"AI-generated · editable"* and *"Reviewed by a human"* indicator when `aiReviewedAt` is present.
  - Clickable keywords (search) and themes (archive filter).
  - Curated related stories widget (strictly public stories only).
  - Required ethical disclaimer: *"Stories represent personal memories and community histories, not verified historical facts."*
  - Story actions: Web Share API with clipboard fallback, "Request edit or removal" modal, and "Report a concern" modal.
  - Deduplicated view tracker (`/api/stories/[slug]/view`) with 24-hour cookie protection.
- **Collections Gallery & Detail (`/collections` & `/collections/[slug]`)**:
  - Gallery of all active collections with story counts, gradients, and motif patterns.
  - Exhibition detail page with hero banner and collection story explorer.
- **Decade Timeline (`/timeline`)**:
  - Vertical animated decade timeline grouping public stories from the 1940s to 2000s+.
  - Sticky decade index navigator rail.
  - In-timeline language and region filters.
- **Content & Legal Pages**:
  - `/about`: Mission, preservation imperative, and human-in-the-loop AI principles.
  - `/ethics`: 4-pillar community consent charter and historical fact disclaimer.
  - `/contributor-guide`: Interview tips, sample question prompts across 4 themes, audio specs, and step-by-step workflow.
  - `/privacy`: Strict data segregation, coarse geography, cryptographic audio URLs, and deletion rights.
  - `/terms`: Oral history archive license and prohibition of third-party bulk AI model scraping.
  - `src/app/sitemap.ts` & `src/app/robots.ts`: Dynamic XML sitemap listing public stories and active collections, protecting private sections.

---

## Phase 3: Contributor Studio, Audio Ingestion & AI Processing Pipeline
**Status**: COMPLETED

### Done in Phase 3
- **Storage Layer (`src/lib/storage.ts`)**:
  - Cloudflare R2 S3 client with `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
  - Presigned PUT URL generator (`getPresignedUploadUrl`) and signed GET URL generator (`getSignedDownloadUrl`).
  - Server-side raw audio fetcher (`fetchAudioBuffer`) for Base64 STT payload encoding.
  - Seamless local storage fallback for dev/testing when R2 credentials are unset.
- **Client Audio Studio & Transcoding**:
  - `src/lib/audio/wav-encoder.ts`: In-browser 16kHz mono linear PCM WAV encoder via Web Audio API. Eliminates serverless ffmpeg binary bottlenecks and formats audio perfectly for Whisper STT.
  - `src/components/studio/audio-recorder.tsx`: MediaRecorder with permission handling, live canvas waveform visualizer (`AnalyserNode`), 15min timer with warning, pause/resume, re-record, preview, and client WAV encoding.
  - `src/components/studio/audio-uploader.tsx`: Drag-and-drop file picker for MP3, M4A, WAV, OGG, WebM with client-side validation (<25MB, <15min).
- **Multi-Step Story Creation Wizard (`/dashboard/stories/new`)**:
  - **Step 1: Audio Capture**: Direct upload to Cloudflare R2 via presigned PUT with animated progress bar; immediately creates Story as `DRAFT` in DB with audio secured before any AI runs.
  - **Step 2: Story Details**: Title, regional language, coarse region/locale, topic, era, collection, description. Debounced autosave on change.
  - **Step 3: Consent & Rights**: Selection between Public, Private, or Research-only archive; Named vs Anonymous display; mandatory contributor consent certification checkbox. Records to `ConsentLog`.
  - **Step 4: AI Launch**: Dispatches background AI pipeline.
- **AI Processing Pipeline (`src/lib/ai/openrouter.ts`, `src/server/ai/`)**:
  - Unified `AiProvider` interface with `OpenRouterAiProvider` and `MockAiProvider`.
  - Speech-To-Text via OpenRouter `/api/v1/audio/transcriptions` with model `OPENROUTER_STT_MODEL` (`openai/whisper-large-v3`).
  - English Translation via OpenRouter `/api/v1/chat/completions` with model `OPENROUTER_LLM_MODEL` (`anthropic/claude-3.5-sonnet`). Preserves names and cultural terms; never overwrites `originalTranscript`.
  - Cultural analysis: Summary, keywords, and themes via structured JSON validated with Zod, with 1x JSON repair prompt retry.
  - Paragraph-bounded chunking (`src/server/ai/chunking.ts`) for long transcripts.
  - Background execution via Next.js `after()` with `maxDuration = 300`.
  - Idempotent execution: Re-running only processes pending or failed jobs and prevents duplicate keywords or themes.
- **Live Status Polling & Error Recovery**:
  - `/api/stories/[id]/process` (trigger) & `/api/stories/[id]/status` (polling).
  - `src/components/studio/ai-processing-status.tsx`: Animated per-step progress checklist (Securing audio -> Native transcription -> English translation -> Cultural tags) polling every 2.5s.
  - Friendly failure callout with "Retry AI Step" button and "Continue Manually" button.
- **AI Output Review Editor (`/dashboard/stories/[id]/review`)**:
  - Pinned top Wavesurfer audio player for continuous listening while editing.
  - Side-by-side desktop / tabbed mobile editor:
    - Original Transcript (Devanagari/native script font, `lang` attribute, `AiBadge`).
    - English Translation (`AiBadge`).
    - Summary & Metadata with AI suggested metadata chips ("Apply to story").
    - Keywords chip editor (add/remove tags).
    - Themes multi-select chips.
  - "Mark as Reviewed" action (`aiReviewedAt`).
  - Debounced autosave with visible "Saved" indicator and `updatedAt` concurrency guard.
  - "Submit for Moderation" button with pre-flight validation. Sets `status = SUBMITTED`, `submittedAt = new Date()`, logs `ModerationLog`.
- **Contributor Story Management (`/dashboard/stories/[id]`)**:
  - Read-only story overview with status timeline and plain-language explanation.
  - Admin "Changes Requested" notes banner with "Edit & Resubmit" button.
  - In-place consent controls (Public / Private / Research-only and Named / Anonymous) with `ConsentLog` auditing.
  - "Delete Draft" button for drafts and rejected stories.
  - Warning modal before editing submitted or published stories.
- **Dashboard Enhancements (`/dashboard`, `/dashboard/stories`, `/dashboard/settings`)**:
  - `/dashboard`: Real metrics (Drafts, In Review, Published), recent recordings list with `StatusBadge`, and curator notifications banner.
  - `/dashboard/stories`: Tab filters (All, Drafts, Processing, Needs Review, Submitted, Published, Rejected), search within my stories, and designed empty states.
  - `/dashboard/settings`: Profile display name, preferred language, default visibility and attribution preferences, `allowPublicEmail` toggle, and account deletion request modal.
- **Verification & Quality**:
  - **30 / 30 Vitest tests passing** (Permissions, Trigram Search, AI Chunking, Translation Isolation, Keyword Normalization).
  - ESLint passing with 0 errors and 0 warnings.
  - TypeScript strict check passing (`pnpm tsc --noEmit`).
  - Next.js production build (`pnpm build`) succeeds with all 30 routes compiled.

---

## Next Phases
- **Phase 4**: Admin Moderation, Collections Studio, AI Pipeline Recovery, Ethics Requests, Retention Purge Worker & Research Commons Export.
**Status**: COMPLETED

### Done in Phase 4
- **Admin Layout & Navigation (`/admin`, `src/app/admin/layout.tsx`)**:
  - Full admin console with sidebar linking to Overview, Moderation Queue, All Stories, Collections, Users, AI Pipeline Jobs, Requests & Reports, Analytics, and Researcher Export.
  - Strict server-side access enforcement via `requireAdmin()`.
- **Admin Overview (`/admin`)**:
  - 6 KPI metric cards: Pending Review, Published Archive, Drafts, Failed AI Jobs, Open Removal Requests, Total Contributors.
  - Real-time activity feeds from `ModerationLog` and `ConsentLog`.
  - Quick action curator tool band.
- **Moderation Queue (`/admin/moderation`)**:
  - Responsive table layout on desktop, stacked card layout on mobile (375px compatible).
  - Status tabs: `Submitted`, `Needs changes`, `Approved`, `Rejected`, `All`.
  - In-place search (title, contributor name/email) and language filtering.
  - Status indicators: `StatusBadge`, AI verification indicator (`aiReviewedAt`), and consent tier badges.
- **Story Moderation & Curation Studio (`/admin/stories/[id]`)**:
  - Top pinned Wavesurfer audio player for continuous listening while editing.
  - Side-by-side bilingual editor (original native script with `lang` attribute, English translation, and cultural summary).
  - Chip editors for keywords and curated theme tags.
  - Collection assignment selector.
  - Consent status panel displaying permission, attribution preference, and contributor contact info (admin-only).
  - Full historical audit timeline of moderation actions and consent adjustments.
  - Editorial action dialogs with audit logging:
    - **Approve**: Pre-flight validation blocks approval if AI output is unreviewed or content is blank. Sets `status = PUBLISHED` and triggers Next.js path cache revalidation if permission is `PUBLIC`; sets `status = APPROVED` if `RESEARCH_ONLY` or `PRIVATE`.
    - **Request Changes**: Requires feedback note; sets `status = NEEDS_REVIEW` (note visible to contributor).
    - **Reject**: Requires reason note; sets `status = REJECTED`.
    - **Unpublish / Archive**: Dialog confirming removal from public archive while preserving database record.
    - **Save Edits**: Explicit save button with toast confirmation, logging `ModerationAction.EDIT`.
- **All Stories Repository (`/admin/stories`)**:
  - Comprehensive view of all stories in the database across all statuses with search and pagination.
- **Curated Collections Studio (`/admin/collections`)**:
  - Create and edit collections with auto-slug generation, descriptions, motif SVGs (lotus, waves, tree-of-life, sun, grain, geometric), and gradient palettes with live preview.
  - Reorder collections with Move Up / Move Down controls (persisting `displayOrder`).
  - Archive/Restore toggle (archived collections disappear from public `/collections` but preserve their stories).
  - Hard-delete safeguard: Blocks deletion if collection has associated active stories.
- **User Governance Directory (`/admin/users`)**:
  - Contributor table with search, role filters, and story counts.
  - Role management toggle (`CONTRIBUTOR` $\leftrightarrow$ `ADMIN`).
  - Strict security guards: Prevents self-demotion or demoting the last remaining administrator in the system.
  - Account deactivation/reactivation controls.
- **AI Job Inspector & Recovery (`/admin/jobs`)**:
  - Filterable list of `AiJob` by status and type.
  - Error stack trace modal for failed jobs.
  - Single-job retry button, "Retry All Failed" batch action, and "Reset Stuck Jobs (>10m)" button.
- **Ethics Requests & Reports Center (`/admin/requests`)**:
  - Contributor `RemovalRequest` queue (actions: "Resolve & Archive Story", "Resolve & Keep Story", "Decline Request" with admin notes).
  - Public visitor `StoryReport` queue (actions: "Take Down Story", "Dismiss Report" with admin notes).
- **Contributor Account Deletion & Retention Flow**:
  - Enhanced `/dashboard/settings` deletion request modal with two distinct archival choices:
    - **Option A (Full Deletion)**: Purges account, stories, and deletes raw audio from Cloudflare R2 / storage.
    - **Option B (Archival Gift)**: Preserves published stories anonymously while purging user identity and deleting non-public drafts.
  - 30-day grace period with cancellation upon logging back in.
  - Admin "Purge Now" button for immediate GDPR compliance.
  - Automated cron worker route `GET /api/cron/purge-deleted` authenticated via `CRON_SECRET`.
  - Permanent audio object deletion utility `deleteAudioObject` in `src/lib/storage.ts`.
- **Archive Analytics with Recharts (`/admin/analytics`)**:
  - Date preset filtering: 7 Days, 30 Days, All Time.
  - Responsive Area chart of daily story listens and search volume over time.
  - Top search queries breakdown and Zero-result searches callout (content gap discovery).
  - Horizontal bar charts for cultural theme popularity and regional/language coverage.
- **Researcher Dataset Export & Public API (`/admin/export` & `/api/public/dataset`)**:
  - Shared privacy sanitizer `sanitizeStoryForExport` and RFC-4180 CSV formatter `formatStoriesAsCsv` in `src/lib/export.ts`.
  - Admin export studio (`/admin/export`) with JSON and CSV downloads, filtering by collection, language, and permission tier (Public only vs Public + Research-Only; never private).
  - Rate-limited public JSON endpoint `/api/public/dataset` strictly enforcing `publicStoryWhere()`.
  - "Academic Research Commons & Open Dataset" section integrated into `/about`.
- **Quality & Verification**:
  - **42 / 42 Vitest tests passing** (Admin permissions, Moderation state machine, Consent pre-flight, Export sanitization, Account deletion retention modes, Search ranking, AI pipeline chunking).
  - ESLint passing with 0 errors and 0 warnings.
  - TypeScript strict check passing (`pnpm tsc --noEmit`).
  - Next.js production build (`pnpm build`) succeeds with all 40+ routes compiled.

---

## Client Dataset Integration: 75 Authentic Oral History Stories
**Status**: COMPLETED

### Done in Client Dataset Integration
- **Client Oral History Archive (`prisma/data/client-stories.ts`)**:
  - Incorporated all 75 authentic spoken oral histories across 2 major thematic cohorts:
    - **Cohort 1 (Master Craftspeople & Living Traditions)**: 20 deep elder narratives including Kamla Devi (82, Varanasi — Banarasi silk weaving), Zubaida Begum (74, Lucknow — 32 Chikankari stitches), Gurdev Singh (85, Ludhiana — heirloom Dussehri mango tree & seed preservation), Meenakshi Ammal (79, Madurai — intuitive measurement-free temple mess cooking), and Kuttappan Asari (81, Alappuzha — 11 handmade snake boats).
    - **Cohort 2 (Generational Memories & Daily Life Across India)**: 55 authentic accounts spanning ages 8 to 96 from Ladakh, Nagaland, Kerala, Kashmir, Gujarat, Goa, Bengal, Bundelkhand, and beyond (covering Partition survivors, ASHA workers, bell metal casters, itinerant knife sharpeners, shadow puppeteers, lighthouse keepers, and more).
  - Preserved exact spoken words, question-and-answer format, regional languages, decades (1940s to 2020s), and coarse geographic locations.
  - Linked each story to curated themes, AI-modeled summaries, and normalized keywords.
- **Database Seeding Optimization (`prisma/seed.ts`)**:
  - Upserted 6 diverse regional contributors to attribute stories faithfully.
  - Optimized relation creation using bulk `createMany` with `skipDuplicates: true` for `StoryKeyword` and `StoryTheme` over SSL connections.
  - Seeding brings the total public archive to **89 published stories** (96 total including moderation/security test records), perfectly aligning with the portfolio target of 50–100 stories.
- **Multilingual Landing Quote Band (`src/components/landing/voices-quote-band.tsx`)**:
  - Enriched with authentic multilingual excerpts in native scripts (Hindi, Urdu, Punjabi, Tamil, Marathi) from Kamla Devi, Zubaida Begum, Gurdev Singh, Meenakshi Ammal, Janaki Ammal, and Ganpat Shinde.
- **Verification & Quality**:
  - **49 / 49 Vitest tests passing**.
  - ESLint passing with 0 errors and 0 warnings.
  - TypeScript strict check passing (`pnpm tsc --noEmit`).
  - Next.js production build (`pnpm build`) compiled successfully with all static and dynamic routes.

---

## Environment Variables
Configured in `.env`:
```bash
# Neon Postgres Database
DATABASE_URL="postgresql://user:password@ep-pooler.region.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep.region.neon.tech/neondb?sslmode=require"

# Better Auth Secret
BETTER_AUTH_SECRET="your-32-char-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OpenRouter AI (Speech-to-Text & Text Models)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_STT_MODEL="openai/whisper-large-v3"
OPENROUTER_LLM_MODEL="anthropic/claude-3.5-sonnet"

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="storykeeper-audio"

# Cron Worker Secret (Scheduled Deletion Purge)
CRON_SECRET="storykeeper-cron-secret-2026"
```

---

## How to Test Phase 4

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```
2. **Access Admin Console as Administrator**:
   - Log in with admin credentials (`admin@storykeeper.org` / `StoryKeeper2026!Admin` or seed admin).
   - Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
   - Notice the 6 KPI metric cards, quick curator actions, and recent moderation/consent audit feeds.
3. **Review & Moderate Stories (`/admin/moderation`)**:
   - Navigate to [http://localhost:3000/admin/moderation](http://localhost:3000/admin/moderation).
   - Switch between tabs: *Submitted for Review*, *Needs Changes*, *Approved & Published*, *Rejected*, *All Stories*.
   - Filter by language or search for a contributor name.
   - Click "Review" on any story to enter the **Story Moderation Studio** at `/admin/stories/[id]`.
4. **Story Curation Studio (`/admin/stories/[id]`)**:
   - Listen to the audio with the top pinned Wavesurfer player.
   - Edit the original native transcript, English translation, or cultural summary.
   - Add/remove keywords and assign curated theme chips or an exhibition collection.
   - Click "Save Edits" and verify toast confirmation and `ModerationLog` record.
   - Click **Approve Story**: Observe the confirmation modal explaining that a `PUBLIC` story will become `PUBLISHED` and live on the archive immediately, while `RESEARCH_ONLY` remains non-public.
   - Test **Request Changes**: Enter curator feedback note, confirm, and verify the story moves to `NEEDS_REVIEW` (the note appears on the contributor's dashboard).
   - Test **Unpublish / Archive** on a published story: Confirm removal from public archive pages.
5. **Manage Curated Collections (`/admin/collections`)**:
   - Visit [http://localhost:3000/admin/collections](http://localhost:3000/admin/collections).
   - Click "New Curated Collection": Choose a title, motif SVG (e.g. *Tree of Life*), and gradient palette. Notice the live preview card.
   - Reorder collections using the Up/Down arrow buttons and observe persisted `displayOrder`.
   - Test Archive/Restore and verify that deletion is blocked if the collection contains active stories.
6. **User Governance & Demotion Safeguards (`/admin/users`)**:
   - Visit [http://localhost:3000/admin/users](http://localhost:3000/admin/users).
   - Promote a contributor to Admin, or demote an Admin back to Contributor.
   - Verify safety guard: Try demoting yourself or the last remaining admin, and observe the error block.
   - Test deactivation and the immediate GDPR "Purge" dialog.
7. **AI Pipeline Observability & Recovery (`/admin/jobs`)**:
   - Visit [http://localhost:3000/admin/jobs](http://localhost:3000/admin/jobs).
   - Filter by status (`Failed`, `Processing`, `Pending`, `Completed`).
   - Click "Error Log" on any failed job to view the error stack.
   - Test "Retry" on a single job, "Retry All Failed", and "Reset Stuck Jobs (>10m)".
8. **Removal Requests & Ethics Reports (`/admin/requests`)**:
   - Visit [http://localhost:3000/admin/requests](http://localhost:3000/admin/requests).
   - Inspect contributor withdrawal requests and public concern reports.
   - Test resolving with "Archive Story", "Keep Active", or "Decline".
9. **Archive Analytics & Visualizations (`/admin/analytics`)**:
   - Visit [http://localhost:3000/admin/analytics](http://localhost:3000/admin/analytics).
   - Toggle time presets (*Last 7 Days*, *Last 30 Days*, *All Time*).
   - Inspect the Recharts Area chart (views vs searches), top search query frequencies, zero-result search gaps, theme popularity, and language distribution.
10. **Researcher Dataset Export & Public API**:
    - Visit [http://localhost:3000/admin/export](http://localhost:3000/admin/export).
    - Select format (JSON or CSV), choose filters, and click "Download Dataset". Open the downloaded file and verify that contributor emails are strictly absent.
    - Test public API endpoint: Visit [http://localhost:3000/api/public/dataset](http://localhost:3000/api/public/dataset) in browser or curl to inspect sanitized JSON.
    - Visit [http://localhost:3000/about](http://localhost:3000/about) and check the "Open Research Dataset" section.
11. **Account Deletion & Retention Flow**:
    - Log in as a contributor, visit [http://localhost:3000/dashboard/settings](http://localhost:3000/dashboard/settings).
    - Open "Request Account Deletion" modal: Test Option A (delete all stories & audio) vs Option B (preserve public stories anonymously).
    - Test cron worker: `GET /api/cron/purge-deleted?secret=storykeeper-cron-secret-2026`.

---

## Phase 5: End-to-End QA, Security & Privacy Hardening, and Portfolio Polish
**Status**: COMPLETED

### Done in Phase 5
- **Complete End-to-End User Journey Verified**:
  - Tested the 7-step journey: Landing page &rarr; Archive search "harvest" &rarr; Story detail page &rarr; Contributor studio (record/upload) &rarr; AI pipeline (STT, translation, analysis) &rarr; Review editor &rarr; Admin moderation approval &rarr; Live archive publication.
- **Search "harvest" Optimization**:
  - Enriched `prisma/seed.ts` so `kaveri-delta-monsoon-harvest` and `mahua-clay-oven-recipe` have explicit `"harvest"` matches across titles, topics, summaries, and keywords.
- **Dynamic Signed Audio URL on Public Story Detail**:
  - Updated `src/app/(public)/stories/[slug]/page.tsx` to dynamically resolve short-lived signed URLs via `getSignedDownloadUrl(story.audioKey, 3600)` with fallback.
- **Security & Privacy Audit & Hardening**:
  - Audited all API routes and Server Actions for authentication, role validation (`requireAdmin`, `requireUser`), and contributor ownership guards.
  - Added strict HMAC-SHA256 signature and expiration requirement in `/api/storage/audio/route.ts`.
  - Added HTTP security headers in `next.config.ts`: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`, and `Permissions-Policy`.
  - Added sliding window rate limiter (`src/lib/rate-limit.ts`) to `/api/stories/[id]/process`, `/api/search/suggestions`, and auth routes.
  - HTML-escaped text in `src/lib/search/snippet.ts` before inserting `<mark>` tags to prevent XSS injection.
  - Confirmed zero exposure of email, phone, or exact location on public pages or APIs.
- **Dynamic Open Graph Images**:
  - Added dynamic OG image generation for story pages via `next/og` (`src/app/(public)/stories/[slug]/opengraph-image.tsx`).
- **Demonstration Notice**:
  - Added dismissible, tasteful `<DemoRibbon />` to `src/app/(public)/layout.tsx` explaining the archival demonstration context.
- **Automated Stress Testing (120 Stories)**:
  - Created `prisma/seed-stress.ts` with `--cleanup` flag to test archive and search scalability with 100+ stories.
- **Playwright End-to-End Browser Test Suite**:
  - Installed `@playwright/test` and created E2E specs in `e2e/`:
    - `e2e/auth.spec.ts`: Register, login, and logout.
    - `e2e/story-lifecycle.spec.ts`: Search "harvest", view Wavesurfer story player, admin queue review.
    - `e2e/security-permissions.spec.ts`: Admin access control, contributor ownership, privacy leak audit.
- **Vitest Unit & Integration Suites**:
  - All 49 unit and server integration tests passing across 5 test suites (`permissions.test.ts`, `search.test.ts`, `admin.test.ts`, `ai.test.ts`, `e2e-journey.test.ts`).
- **Comprehensive Documentation**:
  - Created showcase `README.md` with architecture and ER diagrams.
  - Created complete `docs/DEPLOYMENT.md` for Vercel, Neon, and Cloudflare R2.
  - Created exhaustive `docs/REQUIREMENTS_COVERAGE.md` verifying 100% of P0 requirements.


---

## Phase 6: UX Polish, Performance Optimization, & Robustness Hardening
**Status**: COMPLETED

### Done in Phase 6
- **Sticky Sidebars Across All Dashboards**:
  - Made contributor dashboard desktop sidebar sticky (`sticky top-0 h-screen overflow-y-auto scrollbar-none`) in [src/app/dashboard/layout.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/dashboard/layout.tsx).
  - Made admin console desktop sidebar sticky (`md:sticky md:top-0 md:h-screen md:overflow-y-auto scrollbar-none`) in [src/app/admin/layout.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/admin/layout.tsx).
- **Admin Console Navigation & Back Flow**:
  - Added dedicated, high-visibility "Exit to Dashboard" and "Public Archive" buttons directly in the Admin header in [src/app/admin/layout.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/admin/layout.tsx).
  - Added persistent sidebar navigation at the bottom of the admin drawer with clear indicators for returning to Contributor Dashboard and Public Archive Home.
- **Unified Editorial Select & Dropdown Styling (`SelectNative`)**:
  - Created reusable [src/components/ui/select-native.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/ui/select-native.tsx) matching the warm editorial design system (`bg-white/80`, custom borders, focus ring, terracotta chevron).
  - Fixed input text highlight selection styling (`::selection`, `input::selection`, `textarea::selection`) across the entire application to use high-contrast brand terracotta (`#B5472B`) and crisp white text.
  - Replaced unstyled native selects in: Story Creation Wizard, Story Detail Manager, Settings Manager, Archive Filters, Timeline View, Moderation Queue, Story Curation Studio, and User Directory.
- **Scrollbar Purification**:
  - Suppressed all unsightly inner horizontal and vertical scrollbars across cards, lists, tabs, modals, and dropdowns in [src/app/globals.css](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/globals.css). Only the primary browser scrollbar remains visible and styled to the theme.
- **Website Rendering & Navigation Performance Optimization**:
  - Removed CPU/GPU-intensive fixed-viewport SVG `feTurbulence` overlay filter from `.paper-grain::before` in [src/app/globals.css](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/globals.css), eliminating Chromium composite lag and scrolling stutter.
  - Reduced development query logging overhead in Prisma Client in [src/lib/db.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/db.ts).
- **Account Deletion UI Removal**:
  - Removed "Danger Zone: Account Deletion" and its modal completely from [src/components/studio/settings-manager.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/studio/settings-manager.tsx).
- **Centralized User-Friendly Error Sanitizer**:
  - Created [src/lib/errors.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/errors.ts) with `getFriendlyErrorMessage` preventing raw Prisma, PostgreSQL, P2002/P2025, or network error traces from ever being exposed to users in toasts and error dialogs.
  - Sanitized error handling in story actions, studio managers, admin queues, and curation studio.
- **Audio Upload & Capture Hardening**:
  - Fixed MIME type handling in [src/app/api/upload/presigned/route.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/api/upload/presigned/route.ts) to correctly normalize MIME parameters (e.g., `audio/webm;codecs=opus`).
  - Added support for `.webm`, `.flac`, `.aac`, `.3gp`, `.mp4` formats with proper extension mapping.
  - Enhanced [src/components/studio/audio-uploader.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/studio/audio-uploader.tsx) and [src/components/studio/story-creation-wizard.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/studio/story-creation-wizard.tsx) for reliable drag-and-drop, duration inspection, and instant audio preview.
  - Updated [src/lib/ai/openrouter.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/ai/openrouter.ts) STT payload to recognize `webm`, `m4a`, `ogg`, `flac`, `mp3`, and `wav`.

---

## Phase 7: Responsive Polish & Brand Favicon Integration
**Status**: COMPLETED

### Done in Phase 7
- **Brand Favicon & Web App Icons**:
  - Designed custom SVG favicon matching the brand terracotta radio logo (`#B5472B`) with broadcast wave geometry in [`src/app/icon.svg`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/icon.svg) and [`public/icon.svg`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/public/icon.svg).
  - Generated Apple Touch Icon in [`src/app/apple-icon.svg`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/apple-icon.svg) for iOS/mobile homescreen bookmarks.
  - Configured icon metadata in [`src/app/layout.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/layout.tsx).
- **Admin Console Dual-Rendering (Desktop Table + Mobile Cards)**:
  - Transformed wide multi-column data tables into responsive dual-render views: `hidden md:block` full tables on desktop and `md:hidden space-y-3` structured card views on mobile.
  - **User Directory** ([`src/components/admin/user-directory.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/user-directory.tsx)): Contributor avatars, role pills, story counts, join date, and action buttons stacked and touch-optimized.
  - **AI Jobs Inspector** ([`src/components/admin/ai-jobs-inspector.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/ai-jobs-inspector.tsx)): Story link, job type, animated status badge, retry count, time ago, error log modal trigger, and single retry action.
  - **Story Moderation Queue** ([`src/app/admin/stories/page.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/admin/stories/page.tsx)): Title, contributor name, status badge, language badge, permission pill, and review action.
  - **Collection Manager** ([`src/components/admin/collection-manager.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/collection-manager.tsx)): Flex-wrap and spacing adjustments for action buttons so they never break narrow card viewports.
  - **Analytics Charts** ([`src/components/admin/analytics-charts.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/analytics-charts.tsx)): Responsive time range filter bar (`flex-col sm:flex-row items-start sm:items-center gap-3`) with wrapped period pill buttons.
- **Public & Studio Layout Polish**:
  - **Navigation Bar** ([`src/components/navigation/navbar.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/navigation/navbar.tsx)): Scaled brand typography (`text-lg sm:text-xl`) and horizontal padding (`px-3 sm:px-6`) for 320px screen breathing room.
  - **Story Detail Tabs** ([`src/components/story/story-tabs.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/story/story-tabs.tsx)): Added horizontal touch-drag scrolling (`overflow-x-auto scrollbar-none`) and whitespace protection (`whitespace-nowrap shrink-0`) to transcript and summary tabs.
  - **Interactive Magic Demo** ([`src/components/landing/magic-demo.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/landing/magic-demo.tsx)): Added horizontal scrolling container (`overflow-x-auto scrollbar-none max-w-full`) to the demo switcher tab strip.
  - **Curated Collections Carousel** ([`src/components/landing/collections-carousel.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/landing/collections-carousel.tsx)): Replaced fixed `300px` card width with fluid `w-[82vw] sm:w-[360px] max-w-[360px]` for edge-to-edge viewing on narrow mobile devices.
  - **Landing Hero Headline** ([`src/components/landing/hero-section.tsx`](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/landing/hero-section.tsx)): Adjusted fluid headline size (`text-3xl sm:text-5xl md:text-6xl lg:text-7xl`) preventing text clipping or overflow on 320px screens.
- **Verification Results**:
  - Vitest test suite: 49 / 49 tests passing.
  - ESLint checks: 0 errors, 0 warnings.
  - Next.js production build (`pnpm build`): 0 errors across all 30 routes.

---

## Phase 8: Cloudinary Storage, Gemini 2.0 Flash AI, UX Refinements & Admin Optimistic Updates
**Status**: COMPLETED

### Done in Phase 8
1. **Password Reset Removal**:
   - Commented out "Forgot password?" link on [src/app/(auth)/login/page.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/(auth)/login/page.tsx).
   - Commented out `sendResetPassword` in [src/lib/auth.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/auth.ts).
   - Replaced `/forgot-password` and `/reset-password` pages with a clear "Password Reset Disabled" notification and redirect buttons.
2. **Cheapest, High-Speed Model (Gemini 2.0 Flash)**:
   - Configured `OPENROUTER_LLM_MODEL="google/gemini-2.0-flash-001"` in `.env`, `.env.example`, [src/lib/env.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/env.ts), and [src/lib/ai/openrouter.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/ai/openrouter.ts).
   - Gemini 2.0 Flash offers ultra-fast response latency (~$0.10/M tokens), avoiding high Claude API costs while delivering high accuracy on regional translations and structured JSON outputs.
3. **Environment Variables Clean-Up**:
   - Cleaned out obsolete Cloudflare R2 variables (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`).
   - Cleaned out unused Resend variables (`RESEND_API_KEY`, `EMAIL_FROM`).
4. **Cloudinary Audio Storage**:
   - Integrated Cloudinary with streaming uploads, signed playback URLs, buffer fetching for OpenRouter STT, and asset deletion in [src/lib/storage.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/lib/storage.ts).
   - Created [src/app/api/upload/file/route.ts](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/app/api/upload/file/route.ts) with direct Cloudinary upload streaming and local fallback.
   - Removed `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
5. **Auto-Generated Auth Secret**:
   - Generated a secure 64-character random hex secret and configured both `BETTER_AUTH_SECRET` and `AUTH_SECRET` in `.env`.
6. **Premium Styled Dropdowns / Select Components**:
   - Overhauled [src/components/ui/select.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/ui/select.tsx) and [src/components/ui/select-native.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/ui/select-native.tsx) to match the warm archive design system (`#FBF7F0` paper background, `#E4DACB` warm border, terracotta checkmarks, and smooth focus rings).
   - Replaced native inputs with Radix UI `Select` in the story wizard, archive filters, timeline filters, admin curation studio, and settings manager.
7. **Admin Analytics Page Polish**:
   - Overhauled [src/components/admin/analytics-charts.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/analytics-charts.tsx): removed harsh shadows, replaced with clean modern borders (`border-line/80 bg-white/95`).
   - Added 4 shadow-free summary metric cards (Story Listens, Archive Queries, Discovery Gaps, Dialects & Tongues).
   - Implemented smooth curve `AreaChart` (`type="monotone"`), `#F3ECE0` soft grid lines, active hover dots, and custom editorial tooltips.
   - Added client mounting guard to prevent hydration and layout recalculation flickers.
8. **Admin Add Collection Modal & Cards Unification**:
   - Synchronized motifs and gradients in [src/components/admin/collection-manager.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/admin/collection-manager.tsx) with the public [src/components/collection/collection-card.tsx](file:///C:/Users/Anubhav%20Singh/Desktop/storykeeper/src/components/collection/collection-card.tsx).
   - Embedded SVG `MotifPattern` renderers in admin collection list cards and live modal preview.
   - Redesigned the "New Curated Collection" modal with visual motif selection and gradient palette buttons.
9. **Instant Archive UI Updates (Zero Refresh Required)**:
   - Added immediate optimistic UI updates (`setCollections(prev => prev.map(...))`) in `CollectionManager` for Archive / Restore toggles, deletions, and additions.
   - Synchronized story status in `story-curation-studio.tsx` so unpublishing/archiving reflects immediately.
   - Added `revalidatePath("/admin/collections")` across all collection server actions.
- **Verification Results**:
  - Vitest test suite: 49 / 49 tests passing.
  - ESLint checks: 0 errors, 0 warnings.
  - Next.js production build (`pnpm build`): 0 errors across all 31 routes.
