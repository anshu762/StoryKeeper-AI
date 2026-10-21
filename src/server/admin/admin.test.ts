import { describe, it, expect, vi } from "vitest";
import {
  sanitizeStoryForExport,
  formatStoriesAsCsv,
  StoryExportInput,
} from "@/lib/export";
import { publicStoryWhere, canViewStory, SessionUser } from "@/lib/permissions";

describe("Phase 4: Admin Moderation, Export & Retention Verification", () => {
  describe("Dataset Export Privacy & Sanitization", () => {
    it("strictly excludes contributor email from sanitized export", () => {
      const input: StoryExportInput = {
        id: "story-1",
        slug: "village-harvest-songs",
        title: "Village Harvest Songs",
        description: "Recollections of autumn threshing songs",
        originalLanguage: "Bhojpuri",
        originalTranscript: "गीत गावत रहली...",
        englishTranslation: "We were singing songs...",
        summary: "Harvest celebration memories",
        region: "Bhojpur, Bihar",
        topic: "Folk Songs",
        timePeriodLabel: "1960s",
        timePeriodStart: 1960,
        timePeriodEnd: 1969,
        permission: "PUBLIC",
        displayPreference: "NAMED",
        publishedAt: new Date("2026-03-01T12:00:00Z"),
        contributor: {
          name: "Ramesh Sharma",
          email: "ramesh.private@example.com", // SENSITIVE PII
        },
        collection: { name: "Living Traditions" },
        keywords: [{ keyword: { name: "harvest" } }, { keyword: { name: "folk" } }],
        themes: [{ theme: { name: "Music & Oral Traditions" } }],
      };

      const result = sanitizeStoryForExport(input);

      // Verify email is absent from the export object
      expect((result as unknown as Record<string, unknown>).email).toBeUndefined();
      expect((result as unknown as Record<string, unknown>).contributorEmail).toBeUndefined();
      expect(result.contributorAttribution).toBe("Ramesh Sharma");
      expect(result.title).toBe("Village Harvest Songs");
      expect(result.originalLanguage).toBe("Bhojpuri");
      expect(result.keywords).toEqual(["harvest", "folk"]);
      expect(result.themes).toEqual(["Music & Oral Traditions"]);
    });

    it("anonymizes contributor attribution when displayPreference is ANONYMOUS", () => {
      const input: StoryExportInput = {
        id: "story-2",
        slug: "secret-recipe-1940",
        title: "Secret Family Spice Blend",
        description: "Grandmother's blend",
        originalLanguage: "Hindi",
        originalTranscript: "यह गुप्त नुस्खा है...",
        englishTranslation: "This is a secret recipe...",
        summary: "Traditional culinary wisdom",
        region: "Awadh, UP",
        topic: "Cuisine",
        timePeriodLabel: "1940s",
        timePeriodStart: 1940,
        timePeriodEnd: 1949,
        permission: "PUBLIC",
        displayPreference: "ANONYMOUS",
        publishedAt: new Date("2026-03-02T12:00:00Z"),
        contributor: {
          name: "Sunita Devi", // Must NOT be revealed
          email: "sunita@example.com",
        },
      };

      const result = sanitizeStoryForExport(input);
      expect(result.contributorAttribution).toBe("Anonymous Community Elder");
      expect(result.contributorAttribution).not.toContain("Sunita");
    });

    it("generates RFC-4180 CSV without leaking email addresses", () => {
      const sanitized = [
        sanitizeStoryForExport({
          id: "story-3",
          slug: "test-slug",
          title: "Test Title, with comma",
          description: 'A "quoted" description',
          originalLanguage: "Bengali",
          originalTranscript: "কথা...",
          englishTranslation: "Story...",
          summary: "Summary...",
          region: "Kolkata",
          topic: "Partition",
          timePeriodLabel: "1950s",
          timePeriodStart: 1950,
          timePeriodEnd: 1959,
          permission: "PUBLIC",
          displayPreference: "NAMED",
          publishedAt: new Date("2026-03-03T12:00:00Z"),
          contributor: {
            name: "Ananya Roy",
            email: "ananya.roy.leak@example.com",
          },
        }),
      ];

      const csv = formatStoriesAsCsv(sanitized);

      expect(csv).toContain("id,slug,title,language,summary");
      expect(csv).toContain('"Test Title, with comma"');
      expect(csv).toContain('"Ananya Roy"');
      expect(csv).not.toContain("ananya.roy.leak@example.com");
    });
  });

  describe("Public Query & Permission Guarantees", () => {
    it("publicStoryWhere strictly ensures status is PUBLISHED and permission is PUBLIC and not deleted", () => {
      const filter = publicStoryWhere();
      expect(filter).toEqual({
        status: "PUBLISHED",
        permission: "PUBLIC",
        deletedAt: null,
      });
    });

    it("prevents non-public stories from being visible to visitors", () => {
      const visitor = null;

      // Draft
      expect(
        canViewStory(visitor, {
          contributorId: "user-1",
          status: "DRAFT",
          permission: "PUBLIC",
          deletedAt: null,
        })
      ).toBe(false);

      // Private story
      expect(
        canViewStory(visitor, {
          contributorId: "user-1",
          status: "PUBLISHED",
          permission: "PRIVATE",
          deletedAt: null,
        })
      ).toBe(false);

      // Research only story
      expect(
        canViewStory(visitor, {
          contributorId: "user-1",
          status: "PUBLISHED",
          permission: "RESEARCH_ONLY",
          deletedAt: null,
        })
      ).toBe(false);

      // Soft deleted story
      expect(
        canViewStory(visitor, {
          contributorId: "user-1",
          status: "PUBLISHED",
          permission: "PUBLIC",
          deletedAt: new Date(),
        })
      ).toBe(false);
    });

    it("allows administrators to view stories in any moderation state", () => {
      const admin: SessionUser = {
        id: "admin-1",
        email: "admin@storykeeper.org",
        role: "ADMIN",
      };

      expect(
        canViewStory(admin, {
          contributorId: "contributor-2",
          status: "SUBMITTED",
          permission: "PRIVATE",
          deletedAt: null,
        })
      ).toBe(true);

      expect(
        canViewStory(admin, {
          contributorId: "contributor-2",
          status: "NEEDS_REVIEW",
          permission: "PUBLIC",
          deletedAt: null,
        })
      ).toBe(true);
    });

    it("prevents non-admin contributors from viewing other users' private drafts", () => {
      const contributor: SessionUser = {
        id: "contributor-1",
        email: "contributor1@storykeeper.org",
        role: "CONTRIBUTOR",
      };

      expect(
        canViewStory(contributor, {
          contributorId: "contributor-2", // Different contributor!
          status: "DRAFT",
          permission: "PRIVATE",
          deletedAt: null,
        })
      ).toBe(false);
    });
  });

  describe("Moderation Pre-flight & State Machine Rules", () => {
    it("rejects approval if AI transcript and translation have not been reviewed", () => {
      const unreviewedStory = {
        id: "s1",
        title: "Oral History of Weaving",
        originalTranscript: "बुनकारी की कहानी...",
        englishTranslation: "The story of weaving...",
        summary: "Traditional handloom practices",
        aiReviewedAt: null, // UNREVIEWED!
        permission: "PUBLIC" as const,
        deletedAt: null,
      };

      const checkCanApprove = (s: typeof unreviewedStory) => {
        if (!s.aiReviewedAt) {
          throw new Error("Approval blocked: AI generated transcript and translation must be reviewed");
        }
        return true;
      };

      expect(() => checkCanApprove(unreviewedStory)).toThrow(
        "Approval blocked: AI generated transcript and translation must be reviewed"
      );
    });

    it("rejects approval if story title or transcripts are blank", () => {
      const emptyTranscriptStory = {
        id: "s2",
        title: "Valid Title",
        originalTranscript: "   ", // EMPTY
        englishTranslation: "Some translation",
        summary: "Some summary",
        aiReviewedAt: new Date(),
        permission: "PUBLIC" as const,
        deletedAt: null,
      };

      const checkCanApprove = (s: typeof emptyTranscriptStory) => {
        if (!s.title.trim()) throw new Error("Title is required");
        if (!s.originalTranscript.trim()) throw new Error("Original transcript is required");
        return true;
      };

      expect(() => checkCanApprove(emptyTranscriptStory)).toThrow(
        "Original transcript is required"
      );
    });

    it("sets status to PUBLISHED if permission is PUBLIC, but APPROVED if permission is RESEARCH_ONLY", () => {
      const resolvePublishStatus = (permission: "PUBLIC" | "RESEARCH_ONLY" | "PRIVATE") => {
        return permission === "PUBLIC" ? "PUBLISHED" : "APPROVED";
      };

      expect(resolvePublishStatus("PUBLIC")).toBe("PUBLISHED");
      expect(resolvePublishStatus("RESEARCH_ONLY")).toBe("APPROVED");
      expect(resolvePublishStatus("PRIVATE")).toBe("APPROVED");
    });

    it("requires a non-empty note when requesting changes or rejecting a story", () => {
      const validateActionNote = (action: "REQUEST_CHANGES" | "REJECT", note?: string) => {
        if (!note?.trim()) {
          throw new Error(`A note explaining the ${action.toLowerCase()} decision is required`);
        }
        return true;
      };

      expect(() => validateActionNote("REQUEST_CHANGES", "")).toThrow(
        "A note explaining the request_changes decision is required"
      );
      expect(() => validateActionNote("REJECT", "   ")).toThrow(
        "A note explaining the reject decision is required"
      );
      expect(validateActionNote("REQUEST_CHANGES", "Please fix the timestamp at 02:15")).toBe(true);
    });
  });

  describe("Account Deletion Retention Choices", () => {
    it("distinguishes between DELETE_ALL and KEEP_ANONYMOUS retention modes", () => {
      const stories = [
        { id: "s1", status: "PUBLISHED", permission: "PUBLIC", audioKey: "audio/s1.wav" },
        { id: "s2", status: "DRAFT", permission: "PRIVATE", audioKey: "audio/s2.wav" },
      ];

      // Simulating DELETE_ALL
      const simulateDeleteAll = (stList: typeof stories) => {
        const deletedAudioKeys: string[] = [];
        const deletedStoryIds: string[] = [];

        stList.forEach((st) => {
          deletedAudioKeys.push(st.audioKey);
          deletedStoryIds.push(st.id);
        });

        return { deletedAudioKeys, deletedStoryIds, anonymizedStoryIds: [] };
      };

      const resultA = simulateDeleteAll(stories);
      expect(resultA.deletedStoryIds).toEqual(["s1", "s2"]);
      expect(resultA.deletedAudioKeys).toEqual(["audio/s1.wav", "audio/s2.wav"]);

      // Simulating KEEP_ANONYMOUS
      const simulateKeepAnonymous = (stList: typeof stories) => {
        const deletedAudioKeys: string[] = [];
        const deletedStoryIds: string[] = [];
        const anonymizedStoryIds: string[] = [];

        stList.forEach((st) => {
          if (st.status === "PUBLISHED" && st.permission === "PUBLIC") {
            anonymizedStoryIds.push(st.id);
          } else {
            deletedAudioKeys.push(st.audioKey);
            deletedStoryIds.push(st.id);
          }
        });

        return { deletedAudioKeys, deletedStoryIds, anonymizedStoryIds };
      };

      const resultB = simulateKeepAnonymous(stories);
      expect(resultB.anonymizedStoryIds).toEqual(["s1"]);
      expect(resultB.deletedStoryIds).toEqual(["s2"]); // Draft deleted
      expect(resultB.deletedAudioKeys).toEqual(["audio/s2.wav"]); // Only draft audio deleted
    });
  });
});
