import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Autoclicker System", () => {
  // This block runs before each test in this describe block.
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    // Reset to a known state with 1000 Doros by default.
    await resetGameState(page);
  });

  // --- Group for Basic Purchase and Generation Tests ---
  test.describe("Core Functionality", () => {
    test("should generate doros from autoclickers", async ({ page }) => {
      await expect(page.locator("#score-display")).toContainText(
        "Doros: 1,000"
      );

      const autoClickerButton = page.locator('[data-id="2"]');
      await autoClickerButton.click();

      // Wait for at least one full generation interval (1.1 seconds)
      await page.waitForTimeout(1100);
      const doros = await page.evaluate(() => window.doroGame.state.doros);

      const initialCost = 10;
      // After 1 purchase (cost 10) and 1.1s of generation (1 dps), doros should be ~991.1
      expect(doros).toBeGreaterThan(1000 - initialCost);
      expect(doros).toBeLessThan(1000 - initialCost + 2); // Give a small margin for timing
    });

    test("should scale autoclicker costs after purchase", async ({ page }) => {
      const autoClickerButton = page.locator('[data-id="2"]');

      const initialCost = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === 2).cost;
      });

      await autoClickerButton.click();
      await page.waitForTimeout(100); // Allow UI to process

      const newCost = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === 2).cost;
      });
      expect(newCost).toBeGreaterThan(initialCost);
    });

    test("should handle multiple different autoclicker types", async ({
      page,
    }) => {
      await page.locator('[data-id="2"]').click();
      await page.locator('[data-id="4"]').click();

      const postPurchaseDoros = await page.evaluate(
        () => window.doroGame.state.doros
      );
      // Use toBeCloseTo to account for tiny amounts of passive generation between clicks.
      expect(postPurchaseDoros).toBeCloseTo(1000 - 10 - 120, 0);

      await page.locator("#show-stats").click();

      // Use toPass wrapper to wait for the throttled UI update
      await expect(async () => {
        await expect(page.locator("#stat-dps")).toContainText("16.0"); // 1 DPS from Lurking Doro + 15 DPS from Walkin Doro
      }).toPass();
    });
  });

  // --- NEW: Group for UI State and User Feedback Tests ---
  test.describe("UI State and Feedback", () => {
    test("should disable button when unaffordable and enable when affordable", async ({
      page,
    }) => {
      // 1. Start with too few Doros to afford the autoclicker.
      await resetGameState(page, { initialDoros: 5 });
      const lurkingDoroButton = page.locator('[data-id="2"]'); // Costs 10
      await expect(lurkingDoroButton).toBeDisabled();

      // 2. Give the player enough Doros to afford it.
      await page.evaluate(() => {
        window.doroGame.state.doros = 15;
        window.doroGame.state.notify(); // Manually trigger UI update
      });

      // 3. Verify the button becomes enabled. Use toPass for robustness as UI update is not instant.
      await expect(async () => {
        await expect(lurkingDoroButton).toBeEnabled();
      }).toPass();
    });

    test("should display a correct and informative tooltip on hover", async ({
      page,
    }) => {
      const walkinDoroButton = page.locator('[data-id="4"]'); // Walkin Doro (15 DPS)

      // Hover over the button to trigger the tooltip.
      await walkinDoroButton.hover();

      const tooltip = walkinDoroButton.locator(".upgrade-tooltip");
      await expect(tooltip).toBeVisible();

      // Verify key pieces of information are present in the tooltip.
      await expect(tooltip).toContainText("Nice day out huh?"); // Description
      await expect(tooltip).toContainText("Provides 15 Doros per second."); // Effect
    });
  });

  // --- NEW: Group for Advanced Mechanics and Scaling Tests ---
  test.describe("Advanced Mechanics and Scaling", () => {
    test("should correctly handle multiple purchases of the same autoclicker", async ({
      page,
    }) => {
      // Start with a large amount of Doros to afford multiple purchases
      await resetGameState(page, { initialDoros: 50000 });
      const lurkingDoroButton = page.locator('[data-id="2"]');

      // Purchase the same autoclicker 5 times.
      for (let i = 0; i < 5; i++) {
        await lurkingDoroButton.click();
        await page.waitForTimeout(50); // Small delay to prevent race conditions
      }

      // Verify the final state of the autoclicker.
      const ownedCount = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === 2).purchased;
      });
      expect(ownedCount).toBe(5);

      // Verify the DPS reflects 5 purchases.
      await page.locator("#show-stats").click();
      await expect(async () => {
        await expect(page.locator("#stat-dps")).toContainText("5.0"); // 5 owned * 1 DPS each
      }).toPass();
    });

    test("should correctly purchase a high-tier autoclicker", async ({
      page,
    }) => {
      // Start with enough Doros for a high-tier item.
      await resetGameState(page, { initialDoros: 50000 });
      const sirenDoroButton = page.locator('[data-id="6"]'); // Napping Siren Doro (costs 1500)

      // Get the exact cost before purchasing.
      const initialCost = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === 6).cost;
      });
      expect(initialCost).toBe(1500);

      // 1. Get the state immediately BEFORE the action.
      const dorosBefore = await page.evaluate(
        () => window.doroGame.state.doros
      );

      // 2. Perform the action.
      await sirenDoroButton.click();

      // 3. Assert that the UI has updated to reflect the purchase.
      // This is a robust way to wait for the state change to complete.
      await expect(page.locator("#score-display")).not.toContainText("50,000");

      // 4. Get the state immediately AFTER the action.
      const dorosAfter = await page.evaluate(() => window.doroGame.state.doros);

      // 5. Assert that the final state is close to the expected change.
      // This correctly ignores any passive income generated during the test.
      const expectedDoros = dorosBefore - initialCost;
      // FIX: Use a negative precision to round to the nearest 100.
      // This verifies the large deduction occurred while ignoring small DPS gains.
      expect(dorosAfter).toBeCloseTo(expectedDoros, -2);

      // Verify the item was purchased.
      const ownedCount = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === 6).purchased;
      });
      expect(ownedCount).toBe(1);
    });
  });
});
