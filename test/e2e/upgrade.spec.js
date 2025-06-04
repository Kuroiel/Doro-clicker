import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Upgrade System", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);

    await waitForGameInitialization(page);

    // Reset to default test state (1000 doros)
    await resetGameState(page);

    // Handle view switching if needed
    const upgradesButton = page.locator('[data-view="upgrades"]');
    await upgradesButton.click();
    await expect(page.locator("#upgrades-container.active-view")).toBeVisible();
  });

  test("should purchase click multiplier upgrade", async ({ page }) => {
    const upgradeButton = page.locator('[data-id="1"]');

    // Wait for button to be in initial state
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toContainText("Cost: 10 Doros");

    // Purchase the upgrade
    await upgradeButton.click();
    await page.evaluate(() => window.doroGame.ui.refreshUpgradeButton(1));

    // Verify the click multiplier was updated
    const clickMultiplier = await page.evaluate(
      () => window.doroGame.mechanics.clickMultiplier
    );
    expect(clickMultiplier).toBe(1);

    // Wait for UI to update with new cost - use regex to match text within the HTML structure
    await expect(upgradeButton).toContainText(/Cost: 100 Doros/);
  });

  test("should handle upgrade visibility conditions", async ({ page }) => {
    const motivatingDoro = page.locator('[data-id="5"]');
    await expect(motivatingDoro).toBeHidden();

    // Set up valid DPS state and force view update
    await page.evaluate(() => {
      const game = window.doroGame;
      const walkin = game.autoclickers.find((a) => a.id === 4);
      walkin.purchased = 34;
      game.viewManager.switchView("upgrades");
      game.ui.forceFullUpdate(); // Explicit update when needed
    });

    await expect(motivatingDoro).toBeVisible({ timeout: 5000 });
  });

  test("should prevent unaffordable purchases", async ({ page }) => {
    await page.evaluate(() => {
      window.doroGame.state.doros = 5;
      window.doroGame.ui.updateUI(); // Changed from window.doroGame.updateUI
    });

    // Wait for UI to reflect the state change
    await expect(page.getByText("Doros: 5")).toBeVisible();

    const upgradeButton = page.locator('[data-id="1"]');
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toBeDisabled();
    await expect(upgradeButton).not.toHaveClass(/affordable/);
  });
});
