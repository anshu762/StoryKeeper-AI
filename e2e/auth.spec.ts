import { test, expect } from "@playwright/test";

test.describe("Authentication Flows: Registration, Login & Logout", () => {
  const testEmail = `test.user.${Date.now()}@storykeeper.archive`;
  const testPassword = "Password123!";
  const testName = "Heritage Narrator";

  test("should register a new contributor account", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/Create Account|StoryKeeper/i);

    // Fill form
    await page.getByLabel(/Full Name|Display Name/i).fill(testName);
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(testPassword);

    // Submit
    await page.getByRole("button", { name: /Create Account|Register/i }).click();

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/\/dashboard|\/login/);
  });

  test("should log in with valid credentials and log out", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill(testPassword);

    await page.getByRole("button", { name: /Sign In|Log In/i }).click();

    // Verify authenticated dashboard view
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10000 });

    // Open user menu and click logout
    const userMenuButton = page.getByRole("button", { name: /User menu|Account/i });
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
      await page.getByRole("menuitem", { name: /Sign Out|Log Out/i }).click();
      await expect(page).toHaveURL(/\/|\/login/);
    }
  });

  test("should reject login with wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/Password/i).fill("WrongPassword999!");

    await page.getByRole("button", { name: /Sign In|Log In/i }).click();

    // Error toast or inline message should appear
    await expect(
      page.getByText(/Invalid email or password|Authentication failed/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
