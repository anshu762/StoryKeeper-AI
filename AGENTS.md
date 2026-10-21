You are a senior full-stack engineer and product designer. You are building "StoryKeeper AI" end to end, one phase at a time. This is an MVP, but it must look and behave like a premium, production-quality product, because it will be shown as a freelance portfolio project. Everything must actually work. No fake buttons, no dead links, no lorem ipsum, no "coming soon" in the main flows.

## 1. Product
StoryKeeper AI is a public digital archive for oral histories, folk traditions, recipes, community memories and cultural knowledge.
Core purpose: help families and communities record REAL human stories before they disappear, then use AI to make those stories searchable, readable, translated and accessible. AI does not invent stories. It transcribes, translates, summarises and tags real ones, and humans review everything.
Contributors upload or record audio, the original language is preserved, AI generates transcript + English translation + summary + keywords + themes, humans review/edit, the contributor gives explicit permission, an admin moderates, and only approved + consented stories become public.
Target: a usable archive of 50-100 approved stories. Free, ethical, community-driven.

## 2. Users
- Contributor: records/uploads, adds details, reviews AI output, grants permission.
- Visitor: searches, reads, listens, filters, discovers.
- Admin/Moderator: reviews, edits, approves/rejects, manages collections and users.
- Researcher/Educator: finds stories by theme/region/language/time period, exports permitted public data.
- Community organizer: curated collections (Admin creates them).

## 3. Tech stack (fixed - do not swap without asking me)
- Next.js (latest stable, App Router, TypeScript strict), React Server Components by default, Route Handlers + Server Actions for backend. No separate Express server.
- Tailwind CSS (latest stable) + shadcn/ui + lucide-react
- Framer Motion (package `framer-motion`) for animation
- Prisma ORM + Neon Postgres (pooled DATABASE_URL for runtime, DIRECT_URL for migrations). Read the CURRENT Prisma + Neon docs before configuring (driver adapter / prisma.config.ts requirements change between versions).
- Auth: Better Auth (email + password, sessions in cookies, Prisma adapter, built-in password reset, `role` + extra fields via additionalFields). If it causes more than ~30 minutes of trouble, fall back to Auth.js v5 credentials + bcryptjs and tell me.
- AI provider: OpenRouter ONLY (https://openrouter.ai/api/v1). One API key: OPENROUTER_API_KEY.
  - Speech-to-text: OpenRouter `/api/v1/audio/transcriptions` (model from env OPENROUTER_STT_MODEL). Audio must be base64 (URLs are not supported for audio), so fetch the file from storage server-side and encode it. Before coding, read the current OpenRouter STT + audio docs and check supported formats and model IDs.
  - Text tasks (translation, summary, keywords, themes, metadata suggestions): `/api/v1/chat/completions` with model from env OPENROUTER_LLM_MODEL, JSON output validated with zod. If JSON is invalid, retry once with a repair prompt, then mark the job failed.
  - Wrap all of it in ONE module `src/lib/ai/openrouter.ts` so models can be changed from env only.
- File storage: Cloudflare R2 (S3-compatible, `@aws-sdk/client-s3` + presigned URLs). Browser uploads directly via presigned PUT. Audio for non-public stories must NEVER be publicly reachable; serve it via short-lived signed GET URLs generated after an authorization check. Public published audio is also served via signed URLs (keep one code path).
- Email (password reset): Resend. If RESEND_API_KEY is missing in dev, log the reset link to the server console.
- Forms/validation: react-hook-form + zod (share schemas between client and server)
- Audio: browser MediaRecorder for recording, wavesurfer.js for waveform playback, custom accessible player controls
- Charts: recharts. Toasts: sonner. Dates: date-fns. Slugs: slugify.
- Search: Postgres (pg_trgm + ILIKE + weighted ranking via $queryRaw). No external search service.
- Deploy target: Vercel + Neon + R2.
- Package manager: pnpm.

If you need any technology, service or credential that is not listed here, STOP and ask me. Do not silently add big dependencies.

## 4. Design direction (premium, not generic)
Mood: "a warm, modern archive" - editorial, human, calm, trustworthy. Think museum website meets modern SaaS. Not a template-looking AI landing page.
- Colour tokens (define as CSS variables in globals.css and Tailwind theme):
  paper #FBF7F0, paper-2 #F3ECE0, ink #1F1A17, muted #6B625A, line #E4DACB,
  primary (terracotta) #B5472B, saffron #E3A33B, moss #3F5B45, plum #5A3550.
  Use primary sparingly for key actions. Light theme only for the MVP.
- Typography via next/font: Fraunces (display/headings, serif), Inter (UI/body), Noto Serif Devanagari + Noto Sans Devanagari for original transcripts. Transcripts must render any script correctly (set lang attribute from the story language and use a font stack that falls back to system fonts for other scripts).
- Subtle paper-grain overlay (CSS/SVG, very light), generous whitespace, large serif headlines, 16-20px radii, soft layered shadows, thin warm borders.
- No stock photos. Visuals are generated: gradients, SVG patterns/motifs, waveforms, big typography. Each collection gets a unique gradient + SVG motif cover.
- Every page needs: designed empty state, loading skeleton, error state, mobile layout (design mobile-first, test at 375px).
- Accessibility: visible focus rings, keyboard navigation, labels on every input, alt text, AA contrast, accessible audio controls, respect `prefers-reduced-motion` (disable parallax/large motion).
- Motion rules (Framer Motion): purposeful, 200-600ms, ease-out. Use for: hero text reveal, scroll-reveal sections (whileInView, once), staggered card grids, animated counters, hover lifts, animated waveform, layout animations when filters change, page/route fade, accordion/tabs. Never block content behind animation.
- Reusable components in `src/components/ui` (shadcn) and `src/components/` (app-level). No copy-pasted page markup.

## 5. Non-negotiable ethics and consent rules
1. No story is public without explicit contributor permission. Permission values: private | public | research_only. Display preference: named | anonymous.
2. A story is publicly visible ONLY if: status = published AND permission = public AND it is not archived or soft-deleted. Implement this in ONE helper `publicStoryWhere()` (Prisma where clause) and use it in EVERY public query (archive, search, story page, collection pages, related stories, timeline, sitemap, public API, stats). Never re-write this condition elsewhere.
3. research_only stories never appear on public pages; they are included in the dataset export only. private stories appear nowhere except to their owner and admins. Drafts never appear publicly.
4. Public pages never show email, phone, full address, exact location, or account data. Contributor account data and public story metadata are separate. Region is coarse (state/district/region), never exact.
5. AI output is always labelled "AI-generated - editable" in the UI. Every AI field is editable by contributor and admin. The original transcript is never overwritten by the translation (separate columns).
6. Public story pages carry the disclaimer: "Stories represent personal memories and community histories, not verified historical facts."
7. Every moderation action and every consent change is logged (who, what, when, optional note).
8. Contributors can request edit or removal of their story. Account deletion follows a defined retention flow (see Phase 4).
9. AI failure must never lose a story or break browsing. Original audio + draft are saved before any AI step.

## 6. Engineering rules
- TypeScript strict, no `any`. ESLint + Prettier clean. `pnpm build` and `pnpm lint` must pass at the end of every phase.
- Folder structure: src/app (routes), src/components, src/lib (db, auth, ai, storage, search, permissions, validators), src/server (server actions, services), prisma/, docs/.
- Every API route/server action: validate input with zod, check authentication AND authorization (role + ownership), return typed errors. Contributors can only touch their own stories. Admin routes check role = admin on the server, never only in the UI.
- Passwords hashed (never plain). Basic rate limiting on auth and AI-trigger endpoints (simple in-memory or DB-based is fine for MVP).
- Environment variables only via a validated `src/lib/env.ts` (zod). Provide `.env.example` with every key.
- AI processing is asynchronous: the UI never freezes. Use DB-backed jobs (AiJob table) + Next.js `after()` (or equivalent) to run jobs in the background + client polling for status. Jobs are idempotent; retry never creates a duplicate story or duplicate keywords/themes. Set `maxDuration` appropriately on the processing route.
- Use Server Components for data pages; Client Components only where interactivity is needed.
- Seed script (`prisma/seed.ts`) must be re-runnable (upsert).
- Commit-sized, readable code. Short comments only where logic is non-obvious.
- Document API endpoints in `docs/API.md` as you add them.
- NEVER break earlier phases. Before finishing a phase, run the regression checklist for all previous phases (listed in each phase prompt) and report results.

## 7. Working protocol for every phase
1. Start by reading AGENTS.md and PROGRESS.md.
2. Write a short plan (files to create, order). Then build. Do not ask me questions unless truly blocked by a missing decision/credential.
3. Run the app and test it yourself (build, lint, and walk through the flows). Fix what you find.
4. At the end, update PROGRESS.md (done / not done / known issues / env vars I must set) and give me a short "How to test this phase" list.