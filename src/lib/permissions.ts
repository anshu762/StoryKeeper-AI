import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Shared minimal representation of a User Session for permission checks
 */
export interface SessionUser {
  id: string;
  name?: string | null;
  email: string;
  role: "CONTRIBUTOR" | "ADMIN";
}

/**
 * Minimal representation of a Story for permission checks
 */
export interface StoryPermissionFields {
  id?: string;
  contributorId: string;
  status:
    | "DRAFT"
    | "PROCESSING"
    | "NEEDS_REVIEW"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "PUBLISHED"
    | "ARCHIVED";
  permission: "PRIVATE" | "PUBLIC" | "RESEARCH_ONLY";
  deletedAt: Date | string | null;
}

/**
 * AGENTS.md Rule 2:
 * A story is publicly visible ONLY if:
 * status = published AND permission = public AND it is not archived or soft-deleted.
 *
 * Implement this in ONE helper `publicStoryWhere()` (Prisma where clause)
 * and use it in EVERY public query.
 */
export function publicStoryWhere() {
  return {
    status: "PUBLISHED" as const,
    permission: "PUBLIC" as const,
    deletedAt: null,
  };
}

/**
 * Check if a given story is visible to the public or the current user.
 */
export function canViewStory(
  user: SessionUser | null | undefined,
  story: StoryPermissionFields
): boolean {
  // 1. If public, anyone can view
  const isPubliclyVisible =
    story.status === "PUBLISHED" &&
    story.permission === "PUBLIC" &&
    story.deletedAt === null;

  if (isPubliclyVisible) {
    return true;
  }

  // If not public, requires authentication
  if (!user) {
    return false;
  }

  // 2. Admins can view any story
  if (user.role === "ADMIN") {
    return true;
  }

  // 3. Contributor can view their own story if not soft-deleted
  if (user.id === story.contributorId) {
    return story.deletedAt === null;
  }

  return false;
}

/**
 * Check if a user has permission to edit a story.
 */
export function canEditStory(
  user: SessionUser | null | undefined,
  story: StoryPermissionFields
): boolean {
  if (!user) {
    return false;
  }

  // Admins can edit any story
  if (user.role === "ADMIN") {
    return true;
  }

  // Contributors can edit their own stories (if not soft deleted)
  if (user.id === story.contributorId) {
    return story.deletedAt === null;
  }

  return false;
}

/**
 * Server-side helper to require an authenticated user.
 * Returns the session user or redirects to /login.
 */
export async function requireUser(): Promise<SessionUser> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as unknown as { role?: "CONTRIBUTOR" | "ADMIN" }).role || "CONTRIBUTOR",
  };
}

/**
 * Server-side helper to require an admin user.
 * Returns the session user or redirects/throws.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
