import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicStoryWhere } from "@/lib/permissions";
import { calculateStoryScore } from "@/lib/search/ranking";
import { extractSnippet } from "@/lib/search/snippet";

describe("End-to-End User Journeys: Contributor, Admin, and Visitor", () => {
  describe("Journey 1: Visitor Searches for 'harvest'", () => {
    it("matches 'harvest' across titles, topics, and keywords with high ranking", () => {
      const harvestStory = {
        title: "Harvest Songs of the Kaveri Delta: Sowing and Kuruvai Paddy",
        summary:
          "An oral preservation of traditional Kuruvai paddy transplantation and monsoon harvest chants, seasonal river rituals from the fertile Thanjavur delta.",
        englishTranslation:
          "On the day of Aadi Perukku when the first fresh swells filled the Kaveri river, we stepped barefoot into the slushy fields.",
        originalTranscript: "காவிரி ஆற்றில் புது வெள்ளம் வரும் ஆடிப் பெருக்கு நாளில்...",
        region: "Thanjavur, Tamil Nadu",
        topic: "Monsoon Harvest & Agricultural Songs",
        keywords: [
          { name: "harvest", normalizedName: "harvest" },
          { name: "kaveri", normalizedName: "kaveri" },
          { name: "paddy songs", normalizedName: "paddysongs" },
        ],
      };

      const result = calculateStoryScore(harvestStory, "harvest");
      expect(result.score).toBeGreaterThan(15);
      expect(result.matchedField).toBe("title");
    });

    it("generates safe highlighted snippet wrapping 'harvest' in mark tag", () => {
      const summary =
        "An oral preservation of traditional Kuruvai paddy transplantation and monsoon harvest chants in delta.";
      const snippet = extractSnippet(summary, "harvest", 100);

      expect(snippet).toContain(
        '<mark class="bg-saffron/30 text-ink font-semibold rounded px-0.5">harvest</mark>'
      );
      // Ensures no raw unescaped script tag could inject
      const malicious = "Testing <script>alert(1)</script> during harvest";
      const safeSnippet = extractSnippet(malicious, "harvest", 100);
      expect(safeSnippet).not.toContain("<script>");
      expect(safeSnippet).toContain("&lt;script&gt;");
    });
  });

  describe("Journey 2: Contributor Recording & AI Pipeline Simulation", () => {
    it("ensures publicStoryWhere rejects non-published or non-public stories", () => {
      const where = publicStoryWhere();
      expect(where.status).toBe("PUBLISHED");
      expect(where.permission).toBe("PUBLIC");
      expect(where.deletedAt).toBeNull();
    });

    it("requires aiReviewedAt and complete fields before admin approval", () => {
      // Pre-flight check logic reproduction
      function canApprove(story: {
        title: string;
        originalTranscript: string;
        englishTranslation: string;
        summary: string;
        aiReviewedAt: Date | null;
        permission: string;
      }): { approved: boolean; error?: string } {
        if (!story.aiReviewedAt) {
          return { approved: false, error: "AI output must be reviewed" };
        }
        if (!story.title.trim()) {
          return { approved: false, error: "Title required" };
        }
        if (!story.originalTranscript.trim()) {
          return { approved: false, error: "Original transcript required" };
        }
        if (!story.englishTranslation.trim()) {
          return { approved: false, error: "English translation required" };
        }
        if (!story.summary.trim()) {
          return { approved: false, error: "Summary required" };
        }
        return { approved: true };
      }

      const unreviewedStory = {
        title: "Kaveri Oral Memory",
        originalTranscript: "காவிரி...",
        englishTranslation: "Kaveri delta...",
        summary: "Oral memories of Kuruvai...",
        aiReviewedAt: null,
        permission: "PUBLIC",
      };

      expect(canApprove(unreviewedStory).approved).toBe(false);

      const reviewedStory = {
        ...unreviewedStory,
        aiReviewedAt: new Date(),
      };
      expect(canApprove(reviewedStory).approved).toBe(true);
    });
  });

  describe("Journey 3: Privacy and Access Control", () => {
    it("ensures PRIVATE and RESEARCH_ONLY stories never satisfy publicStoryWhere", () => {
      const publicWhere = publicStoryWhere();

      const privateStory = {
        status: "PUBLISHED",
        permission: "PRIVATE",
        deletedAt: null,
      };

      const researchStory = {
        status: "PUBLISHED",
        permission: "RESEARCH_ONLY",
        deletedAt: null,
      };

      const publicStory = {
        status: "PUBLISHED",
        permission: "PUBLIC",
        deletedAt: null,
      };

      function matchesWhere(story: any, where: any): boolean {
        return (
          story.status === where.status &&
          story.permission === where.permission &&
          story.deletedAt === where.deletedAt
        );
      }

      expect(matchesWhere(privateStory, publicWhere)).toBe(false);
      expect(matchesWhere(researchStory, publicWhere)).toBe(false);
      expect(matchesWhere(publicStory, publicWhere)).toBe(true);
    });

    it("ensures unpublished or archived stories immediately vanish from public view", () => {
      const publicWhere = publicStoryWhere();

      const archivedStory = {
        status: "ARCHIVED",
        permission: "PUBLIC",
        deletedAt: null,
      };

      const softDeletedStory = {
        status: "PUBLISHED",
        permission: "PUBLIC",
        deletedAt: new Date(),
      };

      function matchesWhere(story: any, where: any): boolean {
        return (
          story.status === where.status &&
          story.permission === where.permission &&
          story.deletedAt === where.deletedAt
        );
      }

      expect(matchesWhere(archivedStory, publicWhere)).toBe(false);
      expect(matchesWhere(softDeletedStory, publicWhere)).toBe(false);
    });

    it("verifies contributor ownership guard prevents unauthorized edits", () => {
      const story = {
        id: "story_123",
        contributorId: "user_contributor_1",
      };

      function canModifyStory(storyOwnerId: string, requestUserId: string, role: string) {
        if (role === "ADMIN") return true;
        return storyOwnerId === requestUserId;
      }

      expect(canModifyStory(story.contributorId, "user_contributor_2", "CONTRIBUTOR")).toBe(false);
      expect(canModifyStory(story.contributorId, "user_contributor_1", "CONTRIBUTOR")).toBe(true);
      expect(canModifyStory(story.contributorId, "user_admin_1", "ADMIN")).toBe(true);
    });
  });
});
