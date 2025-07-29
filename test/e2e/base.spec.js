import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Basic Game Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // Now uses the robust reset utility
  });

  test("should load game with initial state", async ({ page }) => {
    // For this test, override the default and reset to 0 doros.
    await resetGameState(page, { initialDoros: 0 });

    await expect(page).toHaveTitle("Doro Clicker");
    await expect(page.locator(".title")).toHaveText("Doro Clicker");
    await expect(page.locator("#doro-image")).toBeVisible();
    await expect(page.locator("#score-display")).toContainText("Doros: 0");

    const upgradeButton = page.locator(".upgrade-button").first();
    await expect(upgradeButton).toBeDisabled();
  });

  test("should increment score on manual click", async ({ page }) => {
    await page.locator("#doro-image").click();

    const manualClicks = await page.evaluate(
      () => window.doroGame.state.manualClicks
    );
    expect(manualClicks).toBe(1);

    // After clicking, the score should be 1001.
    await expect(page.locator("#score-display")).toContainText("Doros: 1,001");

    // The stats panel might take a moment to update due to throttling.
    await expect(async () => {
      await expect(page.locator("#stat-clicks")).toContainText("1");
    }).toPass();
  });

  test("should handle stats overlay visibility", async ({ page }) => {
    await expect(page.locator("#stats-overlay")).toBeHidden();

    await page.locator("#show-stats").click();
    await expect(page.locator("#stats-overlay")).toBeVisible();
    await expect(page.locator("#stat-dps")).toContainText("0.0");

    await page.locator("#close-stats").click();
    await expect(page.locator("#stats-overlay")).toBeHidden();
  });
});
