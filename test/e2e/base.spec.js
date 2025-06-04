import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Basic Game Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);

    await waitForGameInitialization(page);

    // Handle view switching
    const upgradesButton = page.locator('[data-view="upgrades"]');
    await upgradesButton.click();
    await expect(page.locator("#upgrades-container.active-view")).toBeVisible();
  });

  test("should load game with initial state", async ({ page }) => {
    // For this specific test, reset to true initial state (0 doros)
    await resetGameState(page, {
      initialDoros: 0,
      resetUpgrades: true,
      resetAutoclickers: true,
    });

    // Verify core elements exist
    await expect(page).toHaveTitle("Doro Clicker");
    await expect(page.locator(".title")).toHaveText("Doro Clicker");
    await expect(page.locator("#doro-image")).toBeVisible();
    await expect(page.locator("#score-display")).toContainText("Doros: 0");

    // Verify initial upgrade state
    const upgradeButton = page.locator(".upgrade-button").first();
    await expect(upgradeButton).toBeDisabled();
  });

  test("should increment score on manual click", async ({ page }) => {
    // Reset to default state (1000 doros) for other tests
    await resetGameState(page);

    // Initial click
    await page.locator("#doro-image").click();

    // Verify state updates
    const manualClicks = await page.evaluate(
      () => window.doroGame.state.manualClicks
    );
    expect(manualClicks).toBe(1);

    // Verify UI reflects changes (now expecting formatted number with thousand separator)
    await expect(page.locator("#score-display")).toContainText("Doros: 1,001");
    await expect(page.locator("#stat-clicks")).toContainText("1");
  });

  test("should handle stats overlay visibility", async ({ page }) => {
    // Verify overlay starts hidden
    await expect(page.locator(".stats-overlay")).toBeHidden();

    // Open and verify content
    await page.locator("#show-stats").click();
    await expect(page.locator(".stats-overlay")).toBeVisible();
    await expect(page.locator("#stat-dps")).toContainText("0");

    // Close overlay
    await page.locator("#close-stats").click();
    await expect(page.locator(".stats-overlay")).toBeHidden();
  });
});
