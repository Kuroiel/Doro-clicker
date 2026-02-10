import { test, expect } from "@playwright/test";
import { GamePage } from "./pages/GamePage";
import { UpgradePage } from "./pages/UpgradePage";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Basic Game Functionality", () => {
  let gamePage;

  test.beforeEach(async ({ page, baseURL }) => {
    gamePage = new GamePage(page);
    await gamePage.navigate(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // Resets to 1000 Doros by default
  });

  test.describe("Initial State and Manual Clicks", () => {
    test("should load game with initial state", async ({ page }) => {
      await resetGameState(page, { initialDoros: 0 });

      await expect(page).toHaveTitle("Doro Clicker");
      await expect(gamePage.titleText).toHaveText("Doro Clicker");
      await expect(gamePage.doroImage).toBeVisible();
      await expect(gamePage.scoreDisplay).toContainText("Doros: 0");

      // should be disabled
      const upgradeButton = gamePage.page.locator(
        '.upgrade-button[data-id="upg_doro_power"]'
      );
      await expect(upgradeButton).toBeDisabled();
    });

    test("should increment score on manual click with default power", async ({
      page,
    }) => {
      await gamePage.clickDoro();

      const manualClicks = await gamePage.getManualClicks();
      expect(manualClicks).toBe(1);

      await expect(gamePage.scoreDisplay).toContainText("Doros: 1,001");
    });

    test("should increment score correctly after buying a click power upgrade", async ({
      page,
    }) => {
      await gamePage.switchToUpgrades();
      // wait a sec
      await page.waitForTimeout(500);
      await gamePage.page.locator('[data-id="upg_doro_power"]').click({ force: true }); // Purchase "Doro Power" (cost 10)

      const clickMultiplier = await gamePage.getClickMultiplier();
      expect(clickMultiplier).toBe(2);

      await gamePage.clickDoro();

      await expect(gamePage.scoreDisplay).toContainText("Doros: 992");
    });
  });

  test.describe("UI Navigation and State", () => {
    test("should correctly switch between Autoclicker and Upgrade views", async ({
      page,
    }) => {
      await expect(gamePage.autoDorosButton).toHaveClass(/active/);
      await expect(gamePage.autoclickersContainer).toHaveClass(/active-view/);
      await expect(gamePage.doroUpgradesButton).not.toHaveClass(/active/);
      await expect(gamePage.upgradesContainer).not.toHaveClass(/active-view/);

      await gamePage.switchToUpgrades();

      // wait for classes
      await expect(gamePage.doroUpgradesButton).toHaveClass(/active/);
      await expect(gamePage.upgradesContainer).toHaveClass(/active-view/);
      await expect(gamePage.autoDorosButton).not.toHaveClass(/active/);
      await expect(gamePage.autoclickersContainer).not.toHaveClass(/active-view/);
    });

    test("should update stats overlay with dynamic content", async ({ page }) => {
      await gamePage.openStats();
      await expect(gamePage.statsOverlay).toBeVisible();
      await expect(gamePage.closeStatsButton).toBeVisible();

      // Allow "0" or "0.0"
      await expect(gamePage.dpsStat).toHaveText(/^0(\.0)?$/);
      await expect(gamePage.totalStat).toContainText("1,000"); // start total

      await gamePage.closeStats();
      await expect(gamePage.statsOverlay).toBeHidden();

      /*
       * buy stuff for stats
       */
      const upgradePage = new UpgradePage(page);
      await upgradePage.buyAutoclicker("ac_lurking_doro"); // 1 DPS
      await upgradePage.buyAutoclicker("ac_walkin_doro"); // 15 DPS

      await gamePage.openStats();

      await expect(async () => {
        await expect(gamePage.dpsStat).toContainText("15.1");
        await expect(gamePage.totalStat).toHaveText(/1,\d{3}/);
      }).toPass();
    });

    test("should allow user to reset the game via the modal", async ({
      page,
    }) => {
      const upgradePage = new UpgradePage(page);
      await upgradePage.buyAutoclicker("ac_lurking_doro");
      await expect(gamePage.scoreDisplay).toContainText("Doros: 995");

      await gamePage.resetGame();

      await expect(gamePage.scoreDisplay).toContainText("Doros: 0");
      await expect(gamePage.confirmResetButton).toBeHidden();
    });
  });
});

