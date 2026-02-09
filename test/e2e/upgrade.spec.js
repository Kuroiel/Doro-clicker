import { test, expect } from "@playwright/test";
import { GamePage } from "./pages/GamePage";
import { UpgradePage } from "./pages/UpgradePage";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Upgrade System", () => {
  let gamePage;
  let upgradePage;

  test.beforeEach(async ({ page, baseURL }) => {
    gamePage = new GamePage(page);
    upgradePage = new UpgradePage(page);

    await gamePage.navigate(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page);

    await gamePage.switchToUpgrades();
    await expect(gamePage.upgradesContainer).toBeVisible();
  });

  test("should purchase click multiplier upgrade", async ({ page }) => {
    const upgradeButton = upgradePage.getUpgradeButton("upg_doro_power");
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toContainText("Cost: 10 Doros");

    await upgradePage.buyUpgrade("upg_doro_power");

    // Verify the game state was updated correctly.
    await expect(async () => {
      const clickMultiplier = await gamePage.getClickMultiplier();
      expect(clickMultiplier).toBe(2);
    }).toPass();

    // Verify the UI updated to show the new cost.
    await expect(upgradeButton).toContainText(/Cost: 100 Doros/);
  });

  test("should handle upgrade visibility conditions", async ({ page }) => {
    const motivatingDoro = upgradePage.getUpgradeButton("upg_motivating_doro");
    await expect(motivatingDoro).toBeHidden();

    // Set up game state that meets the visibility condition.
    await page.evaluate(() => {
      const game = window.doroGame;
      const walkin = game.autoclickers.find((a) => a.id === "ac_walkin_doro");
      walkin.purchased = 34; // This gives > 500 DPS
      game.ui.forceFullUpdate();
    });

    await expect(motivatingDoro).toBeVisible({ timeout: 5000 });
  });

  test("should prevent unaffordable purchases", async ({ page }) => {
    // Set the game state to have very few doros.
    await resetGameState(page, { initialDoros: 5 });

    // Wait for the UI to reflect the change.
    await expect(gamePage.scoreDisplay).toContainText("Doros: 5");

    const upgradeButton = upgradePage.getUpgradeButton("upg_doro_power");
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toBeDisabled();
    await expect(upgradeButton).not.toHaveClass(/affordable/);
  });
});

