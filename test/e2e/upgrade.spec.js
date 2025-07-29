import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Upgrade System", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page);

    const upgradesButton = page.locator('[data-view="upgrades"]');
    await upgradesButton.click();
    await expect(page.locator("#upgrades-container.active-view")).toBeVisible();
  });

  test("should purchase click multiplier upgrade", async ({ page }) => {
    const upgradeButton = page.locator('[data-id="1"]');
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toContainText("Cost: 10 Doros");

    await upgradeButton.click();

    // REMOVED: Do not call internal UI methods from tests.
    // The game is responsible for its own updates.

    // Verify the game state was updated correctly.
    const clickMultiplier = await page.evaluate(
      () => window.doroGame.mechanics.clickMultiplier
    );
    // FIXED: Base multiplier is 1, the upgrade adds 1. Total is 2.
    expect(clickMultiplier).toBe(2);

    // Verify the UI updated to show the new cost.
    await expect(upgradeButton).toContainText(/Cost: 100 Doros/);
  });

  test("should handle upgrade visibility conditions", async ({ page }) => {
    const motivatingDoro = page.locator('[data-id="5"]');
    await expect(motivatingDoro).toBeHidden();

    // Set up game state that meets the visibility condition.
    await page.evaluate(() => {
      const game = window.doroGame;
      const walkin = game.autoclickers.find((a) => a.id === 4);
      walkin.purchased = 34; // This gives > 500 DPS
      // Use the new robust UI update method.
      game.ui.forceFullUpdate();
    });

    await expect(motivatingDoro).toBeVisible({ timeout: 5000 });
  });

  test("should prevent unaffordable purchases", async ({ page }) => {
    // Set the game state to have very few doros.
    await page.evaluate(() => {
      window.doroGame.state.doros = 5;
      // FIXED: Call state.notify() to trigger the UI update cycle.
      window.doroGame.state.notify();
    });

    // Wait for the UI to reflect the change.
    await expect(page.getByText("Doros: 5")).toBeVisible();

    const upgradeButton = page.locator('[data-id="1"]');
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toBeDisabled();
    await expect(upgradeButton).not.toHaveClass(/affordable/);
  });
});
