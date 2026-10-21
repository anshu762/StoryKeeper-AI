import { describe, it, expect } from "vitest";
import {
  publicStoryWhere,
  canViewStory,
  canEditStory,
  SessionUser,
  StoryPermissionFields,
} from "./permissions";

describe("publicStoryWhere", () => {
  it("returns the exact query enforcing PUBLISHED, PUBLIC, and not soft-deleted", () => {
    const where = publicStoryWhere();
    expect(where).toEqual({
      status: "PUBLISHED",
      permission: "PUBLIC",
      deletedAt: null,
    });
  });
});

describe("canViewStory", () => {
  const publicStory: StoryPermissionFields = {
    id: "story-1",
    contributorId: "user-1",
    status: "PUBLISHED",
    permission: "PUBLIC",
    deletedAt: null,
  };

  const draftStory: StoryPermissionFields = {
    id: "story-2",
    contributorId: "user-1",
    status: "DRAFT",
    permission: "PUBLIC",
    deletedAt: null,
  };

  const privateStory: StoryPermissionFields = {
    id: "story-3",
    contributorId: "user-1",
    status: "PUBLISHED",
    permission: "PRIVATE",
    deletedAt: null,
  };

  const researchOnlyStory: StoryPermissionFields = {
    id: "story-4",
    contributorId: "user-1",
    status: "PUBLISHED",
    permission: "RESEARCH_ONLY",
    deletedAt: null,
  };

  const archivedStory: StoryPermissionFields = {
    id: "story-5",
    contributorId: "user-1",
    status: "ARCHIVED",
    permission: "PUBLIC",
    deletedAt: null,
  };

  const softDeletedStory: StoryPermissionFields = {
    id: "story-6",
    contributorId: "user-1",
    status: "PUBLISHED",
    permission: "PUBLIC",
    deletedAt: new Date("2026-01-01"),
  };

  const owner: SessionUser = {
    id: "user-1",
    email: "owner@test.com",
    role: "CONTRIBUTOR",
  };

  const otherUser: SessionUser = {
    id: "user-2",
    email: "other@test.com",
    role: "CONTRIBUTOR",
  };

  const admin: SessionUser = {
    id: "admin-1",
    email: "admin@test.com",
    role: "ADMIN",
  };

  it("allows anyone (including unauthenticated visitors) to view a public story", () => {
    expect(canViewStory(null, publicStory)).toBe(true);
    expect(canViewStory(undefined, publicStory)).toBe(true);
    expect(canViewStory(otherUser, publicStory)).toBe(true);
  });

  it("denies unauthenticated visitors from viewing non-public stories", () => {
    expect(canViewStory(null, draftStory)).toBe(false);
    expect(canViewStory(null, privateStory)).toBe(false);
    expect(canViewStory(null, researchOnlyStory)).toBe(false);
    expect(canViewStory(null, archivedStory)).toBe(false);
    expect(canViewStory(null, softDeletedStory)).toBe(false);
  });

  it("denies other contributors from viewing non-public stories", () => {
    expect(canViewStory(otherUser, draftStory)).toBe(false);
    expect(canViewStory(otherUser, privateStory)).toBe(false);
    expect(canViewStory(otherUser, researchOnlyStory)).toBe(false);
    expect(canViewStory(otherUser, archivedStory)).toBe(false);
    expect(canViewStory(otherUser, softDeletedStory)).toBe(false);
  });

  it("allows story owner to view their own non-public, non-deleted stories", () => {
    expect(canViewStory(owner, draftStory)).toBe(true);
    expect(canViewStory(owner, privateStory)).toBe(true);
    expect(canViewStory(owner, researchOnlyStory)).toBe(true);
    expect(canViewStory(owner, archivedStory)).toBe(true);
  });

  it("denies story owner from viewing soft-deleted stories", () => {
    expect(canViewStory(owner, softDeletedStory)).toBe(false);
  });

  it("allows admins to view any story including non-public and soft-deleted", () => {
    expect(canViewStory(admin, draftStory)).toBe(true);
    expect(canViewStory(admin, privateStory)).toBe(true);
    expect(canViewStory(admin, researchOnlyStory)).toBe(true);
    expect(canViewStory(admin, archivedStory)).toBe(true);
    expect(canViewStory(admin, softDeletedStory)).toBe(true);
  });
});

describe("canEditStory", () => {
  const story: StoryPermissionFields = {
    id: "story-1",
    contributorId: "user-1",
    status: "DRAFT",
    permission: "PUBLIC",
    deletedAt: null,
  };

  const softDeletedStory: StoryPermissionFields = {
    id: "story-2",
    contributorId: "user-1",
    status: "DRAFT",
    permission: "PUBLIC",
    deletedAt: new Date("2026-01-01"),
  };

  const owner: SessionUser = {
    id: "user-1",
    email: "owner@test.com",
    role: "CONTRIBUTOR",
  };

  const otherUser: SessionUser = {
    id: "user-2",
    email: "other@test.com",
    role: "CONTRIBUTOR",
  };

  const admin: SessionUser = {
    id: "admin-1",
    email: "admin@test.com",
    role: "ADMIN",
  };

  it("disallows unauthenticated users from editing", () => {
    expect(canEditStory(null, story)).toBe(false);
  });

  it("disallows non-owner contributors from editing", () => {
    expect(canEditStory(otherUser, story)).toBe(false);
  });

  it("allows owner to edit their own active story", () => {
    expect(canEditStory(owner, story)).toBe(true);
  });

  it("disallows owner to edit a soft-deleted story", () => {
    expect(canEditStory(owner, softDeletedStory)).toBe(false);
  });

  it("allows admin to edit any story, including soft-deleted ones", () => {
    expect(canEditStory(admin, story)).toBe(true);
    expect(canEditStory(admin, softDeletedStory)).toBe(true);
  });
});
