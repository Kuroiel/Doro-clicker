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

    // check state
    await expect(async () => {
      const clickMultiplier = await gamePage.getClickMultiplier();
      expect(clickMultiplier).toBe(2);
    }).toPass();

    // check cost change
    await expect(upgradeButton).toContainText(/Cost: 100 Doros/);
  });

  test("should handle upgrade visibility conditions", async ({ page }) => {
    const motivatingDoro = upgradePage.getUpgradeButton("upg_motivating_doro");
    await expect(motivatingDoro).toBeHidden();

    // set viewable state
    await page.evaluate(() => {
      const game = window.doroGame;
      const walkin = game.autoclickers.find((a) => a.id === "ac_walkin_doro");
      walkin.purchased = 34; // dps > 500
      game.ui.forceFullUpdate();
    });

    await expect(motivatingDoro).toBeVisible({ timeout: 5000 });
  });

  test("should prevent unaffordable purchases", async ({ page }) => {
    // broke mode
    await resetGameState(page, { initialDoros: 5 });

    // wait for ui
    await expect(gamePage.scoreDisplay).toContainText("Doros: 5");

    const upgradeButton = upgradePage.getUpgradeButton("upg_doro_power");
    await expect(upgradeButton).toBeVisible();
    await expect(upgradeButton).toBeDisabled();
    await expect(upgradeButton).not.toHaveClass(/affordable/);
  });
});

