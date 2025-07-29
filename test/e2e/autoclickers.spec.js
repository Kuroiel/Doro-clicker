import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Autoclicker System", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // Uses the new, robust reset function
  });

  test("should generate doros from autoclickers", async ({ page }) => {
    await expect(page.locator("#score-display")).toContainText("Doros: 1,000");

    const autoClickerButton = page.locator('[data-id="2"]');
    await autoClickerButton.click();

    await page.waitForTimeout(1100); // Allow for one full second of generation
    const doros = await page.evaluate(() => window.doroGame.state.doros);

    const initialCost = 10;
    // After 1 purchase (cost 10) and 1.1s of generation (1 dps), doros should be ~991.1
    expect(doros).toBeGreaterThan(1000 - initialCost);
    expect(doros).toBeLessThan(1000 - initialCost + 2); // Give a small margin for timing
  });

  test("should scale autoclicker costs", async ({ page }) => {
    const autoClickerButton = page.locator('[data-id="2"]');

    // Get initial cost
    const initialCost = await page.evaluate(() => {
      // FIXED: .cost is now a getter property, not a function.
      return window.doroGame.autoclickers.find((a) => a.id === 2).cost;
    });

    await autoClickerButton.click();
    await page.waitForTimeout(100); // Allow UI to process

    const newCost = await page.evaluate(() => {
      // FIXED: .cost is now a getter property, not a function.
      return window.doroGame.autoclickers.find((a) => a.id === 2).cost;
    });
    expect(newCost).toBeGreaterThan(initialCost);
  });

  test("should handle multiple autoclicker types", async ({ page }) => {
    await expect(page.locator("#score-display")).toContainText("Doros: 1,000");

    await page.locator('[data-id="2"]').click();
    await page.locator('[data-id="4"]').click();

    const postPurchaseDoros = await page.evaluate(
      () => window.doroGame.state.doros
    );
    expect(postPurchaseDoros).toBeCloseTo(1000 - 10 - 120, 0);

    await page.locator("#show-stats").click();

    // Add a toPass wrapper to wait for the throttled UI update
    await expect(async () => {
      await expect(page.locator("#stat-dps")).toContainText("16.0"); // 1 dps + 15 dps
    }).toPass();

    await page.waitForTimeout(1100); // Wait for 1.1 seconds of generation

    await expect(async () => {
      const newDoros = await page.evaluate(() => window.doroGame.state.doros);
      // Doros should increase by ~16
      expect(newDoros).toBeGreaterThan(postPurchaseDoros + 15.5);
    }).toPass();
  });
});
