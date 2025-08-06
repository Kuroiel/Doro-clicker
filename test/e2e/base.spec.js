import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Basic Game Functionality", () => {
  // This block runs before each test in this describe block.
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // Resets to 1000 Doros by default
  });

  // --- Group for Initial State and Core Clicking Tests ---
  test.describe("Initial State and Manual Clicks", () => {
    test("should load game with initial state", async ({ page }) => {
      // For this specific test, reset to a true initial state (0 doros).
      await resetGameState(page, { initialDoros: 0 });

      await expect(page).toHaveTitle("Doro Clicker");
      await expect(page.locator(".title")).toHaveText("Doro Clicker");
      await expect(page.locator("#doro-image")).toBeVisible();
      await expect(page.locator("#score-display")).toContainText("Doros: 0");

      // An arbitrary upgrade button should be disabled when the player has 0 doros.
      const upgradeButton = page.locator('.upgrade-button[data-id="1"]');
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
      // 1. Switch to the upgrades view to purchase "Doro Power".
      await page.locator('[data-view="upgrades"]').click();
      await page.locator('[data-id="1"]').click(); // Purchase "Doro Power" (cost 10)

      // 2. The click multiplier should now be 2 (base 1 + upgrade 1).
      const clickMultiplier = await page.evaluate(
        () => window.doroGame.mechanics.clickMultiplier
      );
      expect(clickMultiplier).toBe(2);

      // 3. Click the Doro image again.
      await page.locator("#doro-image").click();

      // 4. Verify the score increased by 2. (1000 - 10 for upgrade + 2 for click)
      await expect(page.locator("#score-display")).toContainText("Doros: 992");
    });
  });

  // --- NEW: Group for UI Navigation and State Tests ---
  test.describe("UI Navigation and State", () => {
    test("should correctly switch between Autoclicker and Upgrade views", async ({
      page,
    }) => {
      const autoDorosButton = page.locator('[data-view="autoclickers"]');
      const doroUpgradesButton = page.locator('[data-view="upgrades"]');
      const autoclickersContainer = page.locator("#autoclickers-container");
      const upgradesContainer = page.locator("#upgrades-container");

      // Initial state: Autoclickers view should be active.
      await expect(autoDorosButton).toHaveClass(/active/);
      await expect(autoclickersContainer).toHaveClass(/active-view/);
      await expect(doroUpgradesButton).not.toHaveClass(/active/);
      await expect(upgradesContainer).not.toHaveClass(/active-view/);

      // Action: Click the "Doro Upgrades" button.
      await doroUpgradesButton.click();

      // Final state: Upgrades view should now be active.
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

      // 1. Open overlay and check initial stats.
      await showStatsButton.click();
      await expect(dpsStat).toContainText("0.0");
      await expect(totalStat).toContainText("1,000"); // Initial total doros

      // Close the overlay before interacting with other elements.
      await page.locator("#close-stats").click();
      await expect(page.locator("#stats-overlay")).toBeHidden();

      // 2. Buy an autoclicker to change the game state.
      await page.locator('[data-id="2"]').click(); // 1 DPS
      await page.locator('[data-id="4"]').click(); // 15 DPS

      // 3. Re-open the stats overlay to check the updated values.
      await showStatsButton.click();

      // 4. Verify the stats have updated. Use toPass for robustness.
      await expect(async () => {
        await expect(dpsStat).toContainText("16.0");
        // FIX: Use `toHaveText` with a regex to assert the locator's text content.
        // The `.toMatch()` matcher is for strings, not Locator objects.
        await expect(totalStat).toHaveText(/1,\d{3}/);
      }).toPass();
    });

    test("should allow user to reset the game via the modal", async ({
      page,
    }) => {
      // 1. Change the game state by buying something.
      await page.locator('[data-id="2"]').click();
      await expect(page.locator("#score-display")).toContainText("Doros: 990");

      // 2. Click the main reset button to open the modal.
      await page.locator("#reset-button").click();
      const resetButtonInModal = page.locator("#confirm-reset");
      await expect(resetButtonInModal).toBeVisible();

      // 3. Click the confirmation button in the modal.
      await resetButtonInModal.click();

      // 4. Verify the game has reset to its initial state (0 Doros).
      await expect(page.locator("#score-display")).toContainText("Doros: 0");

      // 5. Verify the modal is gone.
      await expect(resetButtonInModal).toBeHidden();
    });
  });
});
