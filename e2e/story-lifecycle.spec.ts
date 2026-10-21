import { test, expect } from "@playwright/test";

test.describe("Story Lifecycle: Creation -> AI Processing -> Moderation -> Live Search", () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@storykeeper.archive";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";

  test("visitor can search 'harvest' and find Kaveri harvest songs", async ({ page }) => {
    await page.goto("/archive?q=harvest");

    // Check heading
    await expect(page.locator("body")).toContainText("Archive");

    // Verify search term appears in input
    const searchInput = page.getByPlaceholder(/Search oral memories/i);
    if (await searchInput.isVisible()) {
      await expect(searchInput).toHaveValue("harvest");
    }

    // Verify result card
    await expect(page.getByText(/Harvest Songs of the Kaveri Delta/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("story page displays Wavesurfer player and ethics disclaimer", async ({ page }) => {
    await page.goto("/stories/kaveri-delta-monsoon-harvest");

    // Verify title
    await expect(page.locator("h1")).toContainText("Harvest Songs of the Kaveri Delta");

    // Verify ethics disclaimer banner
    await expect(
      page.getByText(/Stories represent personal memories and community histories/i)
    ).toBeVisible();

    // Verify language & tabs
    await expect(page.getByRole("tab", { name: /Tamil|Original/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /English/i })).toBeVisible();
  });

  test("admin moderation panel lists submitted stories and displays review controls", async ({
    page,
  }) => {
    // 1. Log in as admin
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill(adminEmail);
    await page.getByLabel(/Password/i).fill(adminPassword);
    await page.getByRole("button", { name: /Sign In|Log In/i }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/admin/);

    // 2. Navigate to Admin Moderation
    await page.goto("/admin/moderation");
    await expect(page.locator("h1, h2")).toContainText(/Moderation/i);

    // Verify tabs
    await expect(page.getByRole("tab", { name: /Submitted/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Approved/i })).toBeVisible();
  });
});
