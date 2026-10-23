"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import slugify from "slugify";
import {
  StoryStatus,
  StoryPermission,
  DisplayPreference,
  ModerationAction,
  CollectionStatus,
  AiJobStatus,
  AiJobType,
  RemovalRequestStatus,
  UserRole,
} from "@prisma/client";

/**
 * Revalidates public pages when a story is published, updated, or unpublished.
 */
function revalidatePublicPages(slug?: string) {
  try {
    revalidatePath("/archive");
    revalidatePath("/collections");
    revalidatePath("/admin/collections");
    revalidatePath("/search");
    revalidatePath("/timeline");
    revalidatePath("/sitemap.xml");
    if (slug) {
      revalidatePath(`/stories/${slug}`);
    }
  } catch (error) {
    console.warn("Path revalidation warning:", error);
  }
}

/**
 * ---------------------------------------------------------------------------
 * OVERVIEW & METRICS
 * ---------------------------------------------------------------------------
 */
export async function getAdminOverviewMetrics() {
  await requireAdmin();

  const [
    pendingCount,
    publishedCount,
    draftsCount,
    failedJobsCount,
    openRequestsCount,
    totalUsersCount,
    recentModerationLogs,
    recentConsentLogs,
  ] = await Promise.all([
    prisma.story.count({
      where: {
        status: { in: ["SUBMITTED", "NEEDS_REVIEW"] },
        deletedAt: null,
      },
    }),
    prisma.story.count({
      where: {
        status: "PUBLISHED",
        permission: "PUBLIC",
        deletedAt: null,
      },
    }),
    prisma.story.count({
      where: {
        status: "DRAFT",
        deletedAt: null,
      },
    }),
    prisma.aiJob.count({
      where: { status: "FAILED" },
    }),
    prisma.removalRequest.count({
      where: { status: "OPEN" },
    }),
    prisma.user.count({
      where: { deletedAt: null },
    }),
    prisma.moderationLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        story: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.consentLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        story: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  return {
    pendingCount,
    publishedCount,
    draftsCount,
    failedJobsCount,
    openRequestsCount,
    totalUsersCount,
    recentModerationLogs,
    recentConsentLogs,
  };
}

/**
 * ---------------------------------------------------------------------------
 * MODERATION QUEUE & STORY REVIEW
 * ---------------------------------------------------------------------------
 */
export async function getModerationQueue(params?: {
  statusTab?: string;
  search?: string;
  language?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const statusTab = params?.statusTab || "submitted";
  const search = params?.search?.trim() || "";
  const language = params?.language || "";
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(50, params?.limit || 15));
  const skip = (page - 1) * limit;

  // Build Prisma where filter
  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (statusTab === "submitted") {
    where.status = "SUBMITTED";
  } else if (statusTab === "needs_changes") {
    where.status = "NEEDS_REVIEW";
  } else if (statusTab === "approved") {
    where.status = { in: ["APPROVED", "PUBLISHED"] };
  } else if (statusTab === "rejected") {
    where.status = "REJECTED";
  }

  if (language) {
    where.originalLanguage = language;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { contributor: { name: { contains: search, mode: "insensitive" } } },
      { contributor: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, stories] = await Promise.all([
    prisma.story.count({ where }),
    prisma.story.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        contributor: {
          select: { id: true, name: true, email: true },
        },
        collection: {
          select: { id: true, name: true, motif: true, coverGradient: true },
        },
      },
    }),
  ]);

  return {
    stories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStoryForModeration(id: string) {
  await requireAdmin();

  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      contributor: {
        select: {
          id: true,
          name: true,
          email: true,
          preferredLanguage: true,
          createdAt: true,
        },
      },
      collection: true,
      keywords: {
        include: { keyword: true },
      },
      themes: {
        include: { theme: true },
      },
      moderationLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      },
      consentLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      aiJobs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!story) {
    throw new Error("Story not found");
  }

  return story;
}

/**
 * Approve Story
 * Sets APPROVED. If permission = PUBLIC, sets PUBLISHED and publishedAt.
 * Blocks if AI output is unreviewed or consent is missing.
 */
export async function approveStory(storyId: string, note?: string) {
  const admin = await requireAdmin();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.deletedAt !== null) {
    throw new Error("Story does not exist or has been deleted.");
  }

  // Pre-flight validation rules
  if (!story.aiReviewedAt) {
    throw new Error(
      "Approval blocked: AI generated transcript and translation must be reviewed and marked as verified before approval."
    );
  }

  if (!story.title.trim()) {
    throw new Error("Approval blocked: Story title cannot be empty.");
  }

  if (!story.originalTranscript.trim()) {
    throw new Error("Approval blocked: Original transcript is required.");
  }

  if (!story.englishTranslation.trim()) {
    throw new Error("Approval blocked: English translation is required.");
  }

  if (!story.summary.trim()) {
    throw new Error("Approval blocked: Story summary is required.");
  }

  const isPublicArchive = story.permission === "PUBLIC";
  const newStatus: StoryStatus = isPublicArchive ? "PUBLISHED" : "APPROVED";
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.story.update({
      where: { id: storyId },
      data: {
        status: newStatus,
        publishedAt: isPublicArchive ? now : story.publishedAt,
      },
    });

    await tx.moderationLog.create({
      data: {
        storyId,
        adminId: admin.id,
        action: isPublicArchive ? "PUBLISH" : "APPROVE",
        note:
          note?.trim() ||
          (isPublicArchive
            ? "Story approved and published to public archive."
            : "Story approved for private/research archive."),
      },
    });

    return s;
  });

  revalidatePublicPages(story.slug);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  revalidatePath("/admin/moderation");
  return { success: true, story: updated };
}

/**
 * Request Changes
 * Sends back to contributor with status NEEDS_REVIEW and visible note.
 */
export async function requestStoryChanges(storyId: string, note: string) {
  const admin = await requireAdmin();

  const cleanNote = note?.trim();
  if (!cleanNote) {
    throw new Error("A detailed note explaining the requested changes is required.");
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.deletedAt !== null) {
    throw new Error("Story does not exist or has been deleted.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.story.update({
      where: { id: storyId },
      data: {
        status: "NEEDS_REVIEW",
      },
    });

    await tx.moderationLog.create({
      data: {
        storyId,
        adminId: admin.id,
        action: "REQUEST_CHANGES",
        note: cleanNote,
      },
    });

    return s;
  });

  revalidatePublicPages(story.slug);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  revalidatePath("/admin/moderation");
  return { success: true, story: updated };
}

/**
 * Reject Story
 * Sets REJECTED with mandatory note.
 */
export async function rejectStory(storyId: string, note: string) {
  const admin = await requireAdmin();

  const cleanNote = note?.trim();
  if (!cleanNote) {
    throw new Error("A note explaining the reason for rejection is required.");
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.deletedAt !== null) {
    throw new Error("Story does not exist or has been deleted.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.story.update({
      where: { id: storyId },
      data: {
        status: "REJECTED",
      },
    });

    await tx.moderationLog.create({
      data: {
        storyId,
        adminId: admin.id,
        action: "REJECT",
        note: cleanNote,
      },
    });

    return s;
  });

  revalidatePublicPages(story.slug);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  revalidatePath("/admin/moderation");
  return { success: true, story: updated };
}

/**
 * Unpublish or Archive Story
 */
export async function unpublishStory(storyId: string, note?: string) {
  const admin = await requireAdmin();

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.deletedAt !== null) {
    throw new Error("Story not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const s = await tx.story.update({
      where: { id: storyId },
      data: {
        status: "ARCHIVED",
      },
    });

    await tx.moderationLog.create({
      data: {
        storyId,
        adminId: admin.id,
        action: "UNPUBLISH",
        note: note?.trim() || "Unpublished from public archive by curator.",
      },
    });

    return s;
  });

  revalidatePublicPages(story.slug);
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${storyId}`);
  revalidatePath("/admin/moderation");
  return { success: true, story: updated };
}

/**
 * Edit Story as Admin
 * Admin can edit every field (including AI output, tags, and metadata).
 * Automatically logs ModerationAction.EDIT.
 */
export async function updateStoryAsAdmin(
  storyId: string,
  data: {
    title: string;
    description?: string;
    originalLanguage: string;
    originalTranscript: string;
    englishTranslation: string;
    summary: string;
    region?: string;
    topic?: string;
    timePeriodLabel?: string;
    timePeriodStart?: number | null;
    timePeriodEnd?: number | null;
    collectionId?: string | null;
    permission: StoryPermission;
    displayPreference: DisplayPreference;
    keywords?: string[];
    themeIds?: string[];
    markReviewed?: boolean;
  },
  note?: string
) {
  const admin = await requireAdmin();

  const existing = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!existing || existing.deletedAt !== null) {
    throw new Error("Story not found.");
  }

  // Update story and relations
  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update main story
    const s = await tx.story.update({
      where: { id: storyId },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        originalLanguage: data.originalLanguage.trim(),
        originalTranscript: data.originalTranscript,
        englishTranslation: data.englishTranslation,
        summary: data.summary,
        region: data.region?.trim() || null,
        topic: data.topic?.trim() || null,
        timePeriodLabel: data.timePeriodLabel?.trim() || null,
        timePeriodStart: data.timePeriodStart || null,
        timePeriodEnd: data.timePeriodEnd || null,
        collectionId: data.collectionId || null,
        permission: data.permission,
        displayPreference: data.displayPreference,
        aiReviewedAt: data.markReviewed
          ? new Date()
          : existing.aiReviewedAt,
      },
    });

    // 2. Keywords update
    if (data.keywords) {
      await tx.storyKeyword.deleteMany({ where: { storyId } });
      for (const kw of data.keywords) {
        const cleanKw = kw.trim();
        if (!cleanKw) continue;
        const norm = cleanKw.toLowerCase();
        const keywordRecord = await tx.keyword.upsert({
          where: { normalizedName: norm },
          update: {},
          create: { name: cleanKw, normalizedName: norm },
        });
        await tx.storyKeyword.create({
          data: { storyId, keywordId: keywordRecord.id },
        });
      }
    }

    // 3. Themes update
    if (data.themeIds) {
      await tx.storyTheme.deleteMany({ where: { storyId } });
      for (const tId of data.themeIds) {
        await tx.storyTheme.create({
          data: { storyId, themeId: tId },
        });
      }
    }

    // 4. Log moderation action
    await tx.moderationLog.create({
      data: {
        storyId,
        adminId: admin.id,
        action: "EDIT",
        note: note?.trim() || "Admin updated story content or metadata.",
      },
    });

    return s;
  });

  revalidatePublicPages(updated.slug);
  return { success: true, story: updated };
}

/**
 * Accept AI Theme Suggestion into the Theme table
 */
export async function acceptAiTheme(name: string, description?: string) {
  await requireAdmin();

  const cleanName = name.trim();
  if (!cleanName) throw new Error("Theme name cannot be empty.");
  const slug = slugify(cleanName, { lower: true, strict: true });

  const theme = await prisma.theme.upsert({
    where: { slug },
    update: {
      description: description || undefined,
    },
    create: {
      name: cleanName,
      slug,
      description: description || `Curated oral history theme for ${cleanName}`,
    },
  });

  return { success: true, theme };
}

/**
 * ---------------------------------------------------------------------------
 * COLLECTIONS MANAGEMENT
 * ---------------------------------------------------------------------------
 */
export async function getAdminCollections() {
  await requireAdmin();

  return prisma.collection.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: {
          stories: { where: { deletedAt: null } },
        },
      },
    },
  });
}

export async function createCollection(data: {
  name: string;
  slug?: string;
  description: string;
  coverGradient: string;
  motif: string;
  coverImageUrl?: string;
}) {
  await requireAdmin();

  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("Collection name cannot be blank.");

  const generatedSlug =
    data.slug?.trim() || slugify(cleanName, { lower: true, strict: true });

  // Get max displayOrder to append to end
  const maxOrder = await prisma.collection.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const nextOrder = (maxOrder?.displayOrder ?? 0) + 1;

  const collection = await prisma.collection.create({
    data: {
      name: cleanName,
      slug: generatedSlug,
      description: data.description.trim(),
      coverGradient: data.coverGradient,
      motif: data.motif,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      status: "ACTIVE",
      displayOrder: nextOrder,
    },
  });

  revalidatePublicPages();
  return { success: true, collection };
}

export async function updateCollection(
  id: string,
  data: {
    name: string;
    slug: string;
    description: string;
    coverGradient: string;
    motif: string;
    coverImageUrl?: string;
    status?: CollectionStatus;
  }
) {
  await requireAdmin();

  const cleanName = data.name.trim();
  if (!cleanName) throw new Error("Collection name cannot be blank.");

  const updated = await prisma.collection.update({
    where: { id },
    data: {
      name: cleanName,
      slug: data.slug.trim(),
      description: data.description.trim(),
      coverGradient: data.coverGradient,
      motif: data.motif,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      status: data.status,
    },
  });

  revalidatePublicPages();
  return { success: true, collection: updated };
}

export async function reorderCollections(
  items: { id: string; displayOrder: number }[]
) {
  await requireAdmin();

  await prisma.$transaction(
    items.map((item) =>
      prisma.collection.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  revalidatePublicPages();
  return { success: true };
}

export async function toggleCollectionStatus(
  id: string,
  status: CollectionStatus
) {
  await requireAdmin();

  const updated = await prisma.collection.update({
    where: { id },
    data: { status },
  });

  revalidatePublicPages();
  return { success: true, collection: updated };
}

export async function deleteCollection(id: string) {
  await requireAdmin();

  const storyCount = await prisma.story.count({
    where: { collectionId: id, deletedAt: null },
  });

  if (storyCount > 0) {
    throw new Error(
      `Cannot delete collection containing ${storyCount} story/stories. Please archive the collection or reassign stories first.`
    );
  }

  await prisma.collection.delete({
    where: { id },
  });

  revalidatePublicPages();
  return { success: true };
}

/**
 * ---------------------------------------------------------------------------
 * USER MANAGEMENT
 * ---------------------------------------------------------------------------
 */
export async function getAdminUsers(params?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const search = params?.search?.trim() || "";
  const role = params?.role || "";
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(50, params?.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (role === "ADMIN" || role === "CONTRIBUTOR") {
    where.role = role as UserRole;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredLanguage: true,
        defaultPermission: true,
        defaultDisplay: true,
        deletedAt: true,
        createdAt: true,
        _count: {
          select: {
            stories: { where: { deletedAt: null } },
          },
        },
      },
    }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserRole(
  userId: string,
  newRole: "CONTRIBUTOR" | "ADMIN"
) {
  const currentAdmin = await requireAdmin();

  if (currentAdmin.id === userId && newRole !== "ADMIN") {
    throw new Error("You cannot remove admin privileges from your own account.");
  }

  if (newRole === "CONTRIBUTOR") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", deletedAt: null },
    });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last remaining system administrator.");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return { success: true, user: updated };
}

export async function toggleUserStatus(userId: string, activate: boolean) {
  const currentAdmin = await requireAdmin();

  if (currentAdmin.id === userId && !activate) {
    throw new Error("You cannot deactivate your own administrative account.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: activate ? null : new Date(),
    },
  });

  return { success: true, user: updated };
}

/**
 * ---------------------------------------------------------------------------
 * AI JOBS OBSERVABILITY
 * ---------------------------------------------------------------------------
 */
export async function getAdminAiJobs(params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const status = params?.status || "";
  const type = params?.type || "";
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, Math.min(50, params?.limit || 20));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status && Object.values(AiJobStatus).includes(status as AiJobStatus)) {
    where.status = status as AiJobStatus;
  }

  if (type && Object.values(AiJobType).includes(type as AiJobType)) {
    where.type = type as AiJobType;
  }

  const [total, jobs] = await Promise.all([
    prisma.aiJob.count({ where }),
    prisma.aiJob.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            contributor: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function retryAiJob(jobId: string) {
  await requireAdmin();

  const job = await prisma.aiJob.findUnique({
    where: { id: jobId },
  });

  if (!job) throw new Error("AI Job not found.");

  const updated = await prisma.aiJob.update({
    where: { id: jobId },
    data: {
      status: "PENDING",
      errorMessage: null,
      retryCount: { increment: 1 },
      startedAt: null,
    },
  });

  return { success: true, job: updated };
}

export async function retryAllFailedAiJobs() {
  await requireAdmin();

  const count = await prisma.aiJob.updateMany({
    where: { status: "FAILED" },
    data: {
      status: "PENDING",
      errorMessage: null,
      retryCount: { increment: 1 },
      startedAt: null,
    },
  });

  return { success: true, retriedCount: count.count };
}

export async function resetStuckAiJobs() {
  await requireAdmin();

  // Reset jobs stuck in PROCESSING for more than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const count = await prisma.aiJob.updateMany({
    where: {
      status: "PROCESSING",
      startedAt: { lt: tenMinutesAgo },
    },
    data: {
      status: "PENDING",
      startedAt: null,
    },
  });

  return { success: true, resetCount: count.count };
}

/**
 * ---------------------------------------------------------------------------
 * ETHICS REQUESTS & COMMUNITY REPORTS
 * ---------------------------------------------------------------------------
 */
export async function getAdminRequests() {
  await requireAdmin();

  const [removalRequests, storyReports] = await Promise.all([
    prisma.removalRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            permission: true,
          },
        },
      },
    }),
    prisma.storyReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            permission: true,
          },
        },
      },
    }),
  ]);

  return { removalRequests, storyReports };
}

export async function resolveRemovalRequest(
  requestId: string,
  resolution: "ARCHIVE_STORY" | "KEEP_STORY" | "DECLINE",
  adminNote?: string
) {
  const admin = await requireAdmin();

  const request = await prisma.removalRequest.findUnique({
    where: { id: requestId },
    include: { story: true },
  });

  if (!request) throw new Error("Removal request not found.");

  await prisma.$transaction(async (tx) => {
    // 1. Update request status
    await tx.removalRequest.update({
      where: { id: requestId },
      data: {
        status:
          resolution === "DECLINE"
            ? ("DECLINED" as RemovalRequestStatus)
            : ("RESOLVED" as RemovalRequestStatus),
        resolvedAt: new Date(),
      },
    });

    // 2. If archive story was chosen
    if (resolution === "ARCHIVE_STORY" && request.story) {
      await tx.story.update({
        where: { id: request.storyId },
        data: { status: "ARCHIVED" },
      });

      await tx.moderationLog.create({
        data: {
          storyId: request.storyId,
          adminId: admin.id,
          action: "ARCHIVE",
          note: `Story archived following removal request #${requestId}. Note: ${
            adminNote || "Archived upon contributor/ethics request."
          }`,
        },
      });
    }
  });

  if (request.story?.slug) {
    revalidatePublicPages(request.story.slug);
  }

  return { success: true };
}

export async function resolveStoryReport(
  reportId: string,
  resolution: "TAKE_DOWN" | "DISMISS",
  adminNote?: string
) {
  const admin = await requireAdmin();

  const report = await prisma.storyReport.findUnique({
    where: { id: reportId },
    include: { story: true },
  });

  if (!report) throw new Error("Report not found.");

  await prisma.$transaction(async (tx) => {
    await tx.storyReport.update({
      where: { id: reportId },
      data: {
        status: resolution === "TAKE_DOWN" ? "RESOLVED_TAKEDOWN" : "DISMISSED",
      },
    });

    if (resolution === "TAKE_DOWN" && report.story) {
      await tx.story.update({
        where: { id: report.storyId },
        data: { status: "ARCHIVED" },
      });

      await tx.moderationLog.create({
        data: {
          storyId: report.storyId,
          adminId: admin.id,
          action: "ARCHIVE",
          note: `Story taken down in response to community report #${reportId}. Reason: ${
            report.reason
          }. Curator Note: ${adminNote || "Taken down after review."}`,
        },
      });
    }
  });

  if (report.story?.slug) {
    revalidatePublicPages(report.story.slug);
  }

  return { success: true };
}
