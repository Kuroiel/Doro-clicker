import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Basic Game Functionality", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // Resets to 1000 Doros by default
  });

  test.describe("Initial State and Manual Clicks", () => {
    test("should load game with initial state", async ({ page }) => {
      await resetGameState(page, { initialDoros: 0 });

      await expect(page).toHaveTitle("Doro Clicker");
      await expect(page.locator(".title")).toHaveText("Doro Clicker");
      await expect(page.locator("#doro-image")).toBeVisible();
      await expect(page.locator("#score-display")).toContainText("Doros: 0");

      // An arbitrary upgrade button should be disabled when the player has 0 doros.
      const upgradeButton = page.locator('.upgrade-button[data-id="upg_doro_power"]');
      await expect(upgradeButton).toBeDisabled();
    });

    test("should increment score on manual click with default power", async ({
      page,
    }) => {
      await page.locator("#doro-image").click();

      const manualClicks = await page.evaluate(
        () => window.doroGame.state.manualClicks
      );
      expect(manualClicks).toBe(1);

      await expect(page.locator("#score-display")).toContainText(
        "Doros: 1,001"
      );
    });

    test("should increment score correctly after buying a click power upgrade", async ({
      page,
    }) => {
      await page.locator('[data-view="upgrades"]').click();
      await page.locator('[data-id="upg_doro_power"]').click(); // Purchase "Doro Power" (cost 10)

      const clickMultiplier = await page.evaluate(
        () => window.doroGame.mechanics.clickMultiplier
      );
      expect(clickMultiplier).toBe(2);

      await page.locator("#doro-image").click();

      await expect(page.locator("#score-display")).toContainText("Doros: 992");
    });
  });

  test.describe("UI Navigation and State", () => {
    test("should correctly switch between Autoclicker and Upgrade views", async ({
      page,
    }) => {
      const autoDorosButton = page.locator('[data-view="autoclickers"]');
      const doroUpgradesButton = page.locator('[data-view="upgrades"]');
      const autoclickersContainer = page.locator("#autoclickers-container");
      const upgradesContainer = page.locator("#upgrades-container");

      await expect(autoDorosButton).toHaveClass(/active/);
      await expect(autoclickersContainer).toHaveClass(/active-view/);
      await expect(doroUpgradesButton).not.toHaveClass(/active/);
      await expect(upgradesContainer).not.toHaveClass(/active-view/);

      await doroUpgradesButton.click();

      await expect(doroUpgradesButton).toHaveClass(/active/);
      await expect(upgradesContainer).toHaveClass(/active-view/);
      await expect(autoDorosButton).not.toHaveClass(/active/);
      await expect(autoclickersContainer).not.toHaveClass(/active-view/);
    });

    test("should update stats overlay with dynamic content", async ({
      page,
    }) => {
      const showStatsButton = page.locator("#show-stats");
      const dpsStat = page.locator("#stat-dps");
      const totalStat = page.locator("#stat-total");

      await showStatsButton.click();
      await expect(dpsStat).toContainText("0.0");
      await expect(totalStat).toContainText("1,000"); // Initial total doros

      await page.locator("#close-stats").click();
      await expect(page.locator("#stats-overlay")).toBeHidden();

      await page.locator('[data-id="ac_lurking_doro"]').click(); // 1 DPS
      await page.locator('[data-id="ac_walkin_doro"]').click(); // 15 DPS

      await showStatsButton.click();

      await expect(async () => {
        await expect(dpsStat).toContainText("16.0");

        await expect(totalStat).toHaveText(/1,\d{3}/);
      }).toPass();
    });

    test("should allow user to reset the game via the modal", async ({
      page,
    }) => {
      await page.locator('[data-id="ac_lurking_doro"]').click();
      await expect(page.locator("#score-display")).toContainText("Doros: 990");

      await page.locator("#reset-button").click();
      const resetButtonInModal = page.locator("#confirm-reset");
      await expect(resetButtonInModal).toBeVisible();

      await resetButtonInModal.click();

      await expect(page.locator("#score-display")).toContainText("Doros: 0");

      await expect(resetButtonInModal).toBeHidden();
    });
  });
});
