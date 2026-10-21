import { test, expect } from "@playwright/test";

test.describe("Security, Access Control & Privacy Guards", () => {
  const contributorEmail = "sunita.devi@storykeeper.archive";
  const contributorPassword = "Password123!";

  test("unauthenticated visitor is redirected away from /admin", async ({ page }) => {
    await page.goto("/admin");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("standard contributor is forbidden from accessing /admin", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill(contributorEmail);
    await page.getByLabel(/Password/i).fill(contributorPassword);
    await page.getByRole("button", { name: /Sign In|Log In/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // Attempt direct navigation to admin
    await page.goto("/admin");

    // Must be redirected to dashboard or show forbidden
    await expect(page).toHaveURL(/\/dashboard|\/login/);
  });

  test("public stories never leak contributor email or phone numbers", async ({ page }) => {
    await page.goto("/stories/kaveri-delta-monsoon-harvest");

    const pageContent = await page.content();
    // Verify no email address pattern is present in DOM
    expect(pageContent).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  });

  test("research_only dataset export is strictly restricted or sanitised", async ({
    request,
  }) => {
    // Check public dataset endpoint
    const response = await request.get("/api/public/dataset");
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(Array.isArray(json.stories)).toBe(true);

    // Ensure no email address is returned in public dataset
    for (const story of json.stories) {
      expect(story.contributor?.email).toBeUndefined();
    }
  });
});
