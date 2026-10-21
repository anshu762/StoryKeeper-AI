-- Enable pg_trgm extension for full-text / trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONTRIBUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "StoryPermission" AS ENUM ('PRIVATE', 'PUBLIC', 'RESEARCH_ONLY');

-- CreateEnum
CREATE TYPE "DisplayPreference" AS ENUM ('NAMED', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PROCESSING', 'NEEDS_REVIEW', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiJobType" AS ENUM ('TRANSCRIPTION', 'TRANSLATION', 'SUMMARY', 'KEYWORDS', 'THEMES');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'EDIT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "RemovalRequestType" AS ENUM ('EDIT', 'REMOVE');

-- CreateEnum
CREATE TYPE "RemovalRequestStatus" AS ENUM ('OPEN', 'RESOLVED', 'DECLINED');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultPermission" "StoryPermission" NOT NULL DEFAULT 'PUBLIC',
    "defaultDisplay" "DisplayPreference" NOT NULL DEFAULT 'NAMED',
    "allowPublicEmail" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable Account
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable Verification
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable Story
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "audioKey" TEXT,
    "audioMimeType" TEXT,
    "audioSizeBytes" INTEGER,
    "audioDurationSec" DOUBLE PRECISION,
    "originalLanguage" TEXT NOT NULL,
    "originalTranscript" TEXT NOT NULL,
    "englishTranslation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "region" TEXT,
    "topic" TEXT,
    "timePeriodLabel" TEXT,
    "timePeriodStart" INTEGER,
    "timePeriodEnd" INTEGER,
    "interviewDate" TIMESTAMP(3),
    "collectionId" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'DRAFT',
    "permission" "StoryPermission" NOT NULL DEFAULT 'PUBLIC',
    "displayPreference" "DisplayPreference" NOT NULL DEFAULT 'NAMED',
    "transcriptAi" BOOLEAN NOT NULL DEFAULT false,
    "translationAi" BOOLEAN NOT NULL DEFAULT false,
    "summaryAi" BOOLEAN NOT NULL DEFAULT false,
    "aiReviewedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable Keyword
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable StoryKeyword
CREATE TABLE "StoryKeyword" (
    "storyId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryKeyword_pkey" PRIMARY KEY ("storyId","keywordId")
);

-- CreateTable Theme
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable StoryTheme
CREATE TABLE "StoryTheme" (
    "storyId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryTheme_pkey" PRIMARY KEY ("storyId","themeId")
);

-- CreateTable Collection
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverGradient" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "motif" TEXT NOT NULL,
    "status" "CollectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable AiJob
CREATE TABLE "AiJob" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "type" "AiJobType" NOT NULL,
    "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable ModerationLog
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable ConsentLog
CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldPermission" "StoryPermission" NOT NULL,
    "newPermission" "StoryPermission" NOT NULL,
    "oldDisplay" "DisplayPreference" NOT NULL,
    "newDisplay" "DisplayPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable RemovalRequest
CREATE TABLE "RemovalRequest" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RemovalRequestType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RemovalRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable StoryView
CREATE TABLE "StoryView" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable SearchLog
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
CREATE INDEX "Story_status_permission_deletedAt_idx" ON "Story"("status", "permission", "deletedAt");
CREATE INDEX "Story_contributorId_idx" ON "Story"("contributorId");
CREATE INDEX "Story_collectionId_idx" ON "Story"("collectionId");
CREATE INDEX "Story_slug_idx" ON "Story"("slug");
CREATE INDEX "Story_originalLanguage_idx" ON "Story"("originalLanguage");
CREATE INDEX "Story_timePeriodStart_timePeriodEnd_idx" ON "Story"("timePeriodStart", "timePeriodEnd");
CREATE INDEX "Story_isSample_idx" ON "Story"("isSample");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_normalizedName_key" ON "Keyword"("normalizedName");
CREATE INDEX "Keyword_normalizedName_idx" ON "Keyword"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");
CREATE INDEX "Theme_slug_idx" ON "Theme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");
CREATE INDEX "Collection_status_displayOrder_idx" ON "Collection"("status", "displayOrder");

-- CreateIndex
CREATE INDEX "AiJob_storyId_status_idx" ON "AiJob"("storyId", "status");

-- CreateIndex
CREATE INDEX "ModerationLog_storyId_idx" ON "ModerationLog"("storyId");
CREATE INDEX "ModerationLog_adminId_idx" ON "ModerationLog"("adminId");

-- CreateIndex
CREATE INDEX "ConsentLog_storyId_idx" ON "ConsentLog"("storyId");
CREATE INDEX "ConsentLog_userId_idx" ON "ConsentLog"("userId");

-- CreateIndex
CREATE INDEX "RemovalRequest_storyId_idx" ON "RemovalRequest"("storyId");
CREATE INDEX "RemovalRequest_userId_idx" ON "RemovalRequest"("userId");
CREATE INDEX "RemovalRequest_status_idx" ON "RemovalRequest"("status");

-- CreateIndex
CREATE INDEX "StoryView_storyId_createdAt_idx" ON "StoryView"("storyId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryKeyword" ADD CONSTRAINT "StoryKeyword_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryKeyword" ADD CONSTRAINT "StoryKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTheme" ADD CONSTRAINT "StoryTheme_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTheme" ADD CONSTRAINT "StoryTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentLog" ADD CONSTRAINT "ConsentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigram GIN indexes for fuzzy search (Title, Summary, Transcripts, Keywords)
CREATE INDEX IF NOT EXISTS "story_title_trgm_idx" ON "Story" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "story_summary_trgm_idx" ON "Story" USING gin ("summary" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "story_original_transcript_trgm_idx" ON "Story" USING gin ("originalTranscript" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "story_english_translation_trgm_idx" ON "Story" USING gin ("englishTranslation" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "keyword_normalized_name_trgm_idx" ON "Keyword" USING gin ("normalizedName" gin_trgm_ops);
