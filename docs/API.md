# StoryKeeper AI — API Documentation

This document logs all API routes implemented across StoryKeeper AI phases.

---

## Phase 1 Endpoints

### 1. Health Check
- **Path**: `/api/health`
- **Method**: `GET`
- **Authentication**: None (Public)
- **Description**: Verifies service status and queries the PostgreSQL database with `SELECT 1`.
- **Response Success (200)**:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-10-21T10:00:00.000Z"
  }
  ```
- **Response Error (503)**:
  ```json
  {
    "status": "error",
    "database": "disconnected",
    "error": "Database connection error message",
    "timestamp": "2026-10-21T10:00:00.000Z"
  }
  ```

---

### 2. Authentication (Better Auth)
- **Path**: `/api/auth/[...all]`
- **Methods**: `GET`, `POST`
- **Description**: Better Auth core handlers using Prisma adapter and secure HTTP cookies.

#### Key Auth Actions:
- `POST /api/auth/sign-in/email`:
  - Body: `{ email, password }`
  - Sets `better-auth.session_token` cookie.
- `POST /api/auth/sign-up/email`:
  - Body: `{ name, email, password }`
  - Creates user with default role `CONTRIBUTOR`.
- `POST /api/auth/sign-out`:
  - Clears session cookies.
- `POST /api/auth/forget-password`:
  - Body: `{ email, redirectTo }`
  - Generates token and triggers reset email (or logs to dev server console).
- `POST /api/auth/reset-password`:
  - Body: `{ token, newPassword }`
  - Validates token and resets account password.
- `GET /api/auth/get-session`:
  - Returns active user session object.


---

## Phase 2 Endpoints

### 3. Search Suggestions Autocomplete
- **Path**: `/api/search/suggestions`
- **Method**: `GET`
- **Authentication**: None (Public)
- **Query Parameters**:
  - `q` (string, required): Partial query prefix (min 2 characters).
- **Description**: Returns prefix-matched keywords, themes, regions, curated collections, and published stories matching `publicStoryWhere()`.
- **Response Success (200)**:
  ```json
  {
    "suggestions": [
      { "text": "Harvest", "type": "theme", "count": 4, "slug": "harvest-traditions" },
      { "text": "Punjab", "type": "region", "count": 8 },
      { "text": "Grandmother's Pickle Recipe", "type": "story", "slug": "grandmothers-pickle-recipe" }
    ]
  }
  ```

---

### 4. Deduplicated Story View Counter
- **Path**: `/api/stories/[id]/view` (accepts story ID or slug)
- **Method**: `POST`
- **Authentication**: None (Public)
- **Description**: Increments `viewCount` on `Story` and creates a `StoryView` entry. Ignores bots, crawlers, and prefetch requests (`Purpose: prefetch`). Deduplicated per client using a secure 24-hour cookie (`sk_view_<idOrSlug>`) to prevent reload inflation.
- **Response Success (200)**:
  ```json
  {
    "success": true,
    "counted": true
  }
  ```
- **Response Skipped (200)**:
  ```json
  {
    "success": true,
    "counted": false,
    "reason": "already_viewed_or_bot"
  }
  ```

---

### 5. Report a Concern
- **Path**: `/api/stories/[id]/report` (accepts story ID or slug)
- **Method**: `POST`
- **Authentication**: None (Public)
- **Body**:
  ```json
  {
    "reason": "Consent or privacy question",
    "details": "Details about the concern or cultural sensitivity",
    "email": "reporter@example.com"
  }
  ```
- **Description**: Submits a concern for moderation review. Creates a `StoryReport` database entry linked to the story.
- **Response Success (201)**:
  ```json
  {
    "success": true,
    "message": "Report submitted for moderation review",
    "reportId": "cuid_here"
  }
  ```

---

### 6. Contributor Edit or Removal Request
- **Path**: `/api/stories/[id]/removal-request` (accepts story ID or slug)
- **Method**: `POST`
- **Authentication**: Optional (authenticated user ID linked if logged in)
- **Body**:
  ```json
  {
    "type": "REMOVE",
    "message": "Reason for removal or edit request",
    "email": "contributor@example.com"
  }
  ```
- **Description**: Allows contributors or family members to formally request edit or removal of a story per contributor consent rights. Creates a `RemovalRequest` database entry.
- **Response Success (201)**:
  ```json
  {
    "success": true,
    "message": "Removal request received and queued for review",
    "requestId": "cuid_here"
  }
  ```


---

## Phase 3 Endpoints

### 7. Presigned Upload URL Generator
- **Path**: `/api/upload/presigned`
- **Method**: `POST`
- **Authentication**: Required (Contributor / Admin)
- **Body**:
  ```json
  {
    "mimeType": "audio/wav",
    "sizeBytes": 1245000,
    "filename": "grandmother_interview.wav"
  }
  ```
- **Description**: Generates a Cloudflare R2 presigned S3 PUT URL for direct browser audio upload. If R2 credentials are not set in dev, falls back seamlessly to a local storage upload endpoint.
- **Response Success (200)**:
  ```json
  {
    "uploadUrl": "https://<account_id>.r2.cloudflarestorage.com/...",
    "key": "audio/user_cuid/timestamp_grandmother_interview.wav",
    "isLocalFallback": false
  }
  ```

---

### 8. Background AI Processing Trigger
- **Path**: `/api/stories/[id]/process`
- **Method**: `POST`
- **Authentication**: Required (Owner Contributor / Admin)
- **Description**: Initiates the background AI pipeline (Transcription, Translation, Summary, Keywords, Themes). Executes asynchronously via Next.js `after()`.
- **Response Success (200)**:
  ```json
  {
    "success": true,
    "message": "AI pipeline dispatched",
    "storyId": "cuid_here"
  }
  ```

---

### 9. AI Pipeline Status Polling
- **Path**: `/api/stories/[id]/status`
- **Method**: `GET`
- **Authentication**: Required (Owner Contributor / Admin)
- **Description**: Returns live progress for the story and each `AiJob` row (`TRANSCRIPTION`, `TRANSLATION`, `SUMMARY`, `KEYWORDS`, `THEMES`), enabling the animated progress checklist in the contributor studio.
- **Response Success (200)**:
  ```json
  {
    "story": {
      "id": "cuid_here",
      "title": "Story Title",
      "status": "NEEDS_REVIEW",
      "originalLanguage": "Hindi",
      "transcriptAi": true,
      "translationAi": true,
      "summaryAi": true
    },
    "aiJobs": [
      {
        "id": "job_1",
        "type": "TRANSCRIPTION",
        "status": "COMPLETED",
        "errorMessage": null,
        "retryCount": 0
      }
    ],
    "isCompleted": true,
    "hasFailed": false
  }
  ```

---

### 10. Secure Audio Stream
- **Path**: `/api/storage/audio`
- **Method**: `GET`
- **Authentication**: Signed token URL with HMAC signature
- **Query Parameters**: `key`, `expires`, `sig`
- **Description**: Serves audio with HTTP Range header support for seeking and scrubber controls in Wavesurfer. Ensures private and draft audio is never publicly exposed without authorization.

---

## Phase 4 Endpoints

### 11. Admin Dataset Export
- **Path**: `/api/admin/export`
- **Method**: `GET`
- **Authentication**: Required (`ADMIN` role via session cookie)
- **Query Parameters**:
  - `format` (string, `"json"` | `"csv"`, default: `"json"`): File format.
  - `tier` (string, `"public"` | `"research"`, default: `"public"`): Scope of stories.
  - `collection` (string, optional): Filter by collection ID.
  - `language` (string, optional): Filter by regional language.
- **Description**: Generates an immediate RFC-4180 CSV or structured JSON archive download. Strictly strips all contributor emails, passwords, session data, and private stories.
- **Response Headers**:
  - `Content-Disposition: attachment; filename="storykeeper-archive-<date>.<ext>"`
  - `Content-Type: application/json` or `text/csv`

---

### 12. Public Researcher Dataset API
- **Path**: `/api/public/dataset`
- **Method**: `GET`
- **Authentication**: None (Public, Rate limited to 30 req / 5 min per IP)
- **Description**: Returns all approved and published oral narratives matching `publicStoryWhere()`. Excludes non-public stories, drafts, and contributor emails.
- **Response Success (200)**:
  ```json
  {
    "archive": "StoryKeeper Oral History Digital Repository",
    "description": "Open public dataset of community-preserved oral memories and folk traditions.",
    "version": "1.0",
    "license": "Creative Commons BY-NC-ND 4.0",
    "totalRecords": 14,
    "records": [
      {
        "id": "cuid_here",
        "slug": "village-harvest-songs",
        "title": "Village Harvest Songs",
        "description": "Family recollections",
        "originalLanguage": "Bhojpuri",
        "originalTranscript": "गीत गावत रहली...",
        "englishTranslation": "We were singing...",
        "summary": "Harvest memories...",
        "region": "Bhojpur, Bihar",
        "topic": "Harvest Festivities",
        "timePeriodLabel": "1960s",
        "collection": "Songs of the Earth",
        "keywords": ["harvest", "folk"],
        "themes": ["Music & Oral Traditions"],
        "contributorAttribution": "Ramesh Sharma",
        "publishedAt": "2026-03-01T12:00:00.000Z",
        "archiveNotice": "Stories represent personal memories and community histories, not verified historical facts."
      }
    ]
  }
  ```

---

### 13. Automated Deletion & Retention Worker (Cron)
- **Path**: `/api/cron/purge-deleted`
- **Methods**: `GET`, `POST`
- **Authentication**: Bearer token via `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`
- **Description**: Identifies accounts where the 30-day grace period has expired (`deletedAt <= now - 30 days`), purges original audio recordings from Cloudflare R2 storage, executes account retention choices (full purge vs anonymous archival donation), and removes user credentials.
- **Response Success (200)**:
  ```json
  {
    "timestamp": "2026-10-21T12:00:00.000Z",
    "success": true,
    "processedCount": 2,
    "results": [
      {
        "userId": "cuid_1",
        "purgedStoriesCount": 3,
        "anonymizedStoriesCount": 0,
        "message": "Account purged: 3 stories deleted, 0 stories anonymized."
      }
    ]
  }
  ```

