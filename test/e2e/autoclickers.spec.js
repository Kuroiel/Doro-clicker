import { test, expect } from "@playwright/test";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Autoclicker System", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page);

    // Clear any existing saves
    await page.evaluate(() => {
      localStorage.removeItem("doroClickerSave");
    });
  });

  test("should generate doros from autoclickers", async ({ page }) => {
    // Verify initial doros
    await expect(page.locator("#score-display")).toContainText("Doros: 1,000");

    // Purchase autoclicker
    const autoClickerButton = page.locator('[data-id="2"]');
    await autoClickerButton.click();

    // Verify passive generation
    await page.waitForTimeout(1100); // Allow 1 interval to trigger
    const doros = await page.evaluate(() => window.doroGame.state.doros);

    // Check if doros increased (initial 1000 - cost + generation)
    const initialCost = 10;
    await page.waitForTimeout(100);
    expect(doros).toBeGreaterThan(1000 - initialCost);
    expect(doros).toBeLessThan(1000 + 2);
  });

  test("should scale autoclicker costs", async ({ page }) => {
    const autoClickerButton = page.locator('[data-id="2"]');

    // Get initial cost
    const initialCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find((a) => a.id === 2).cost();
    });

    // Purchase and verify cost increase
    await autoClickerButton.click();
    await page.waitForTimeout(100);
    const newCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find((a) => a.id === 2).cost();
    });
    expect(newCost).toBeGreaterThan(initialCost);
  });

  test("should handle multiple autoclicker types", async ({ page }) => {
    await expect(page.locator("#score-display")).toContainText("Doros: 1,000");

    // Purchase first autoclicker with verification
    const clicker1 = page.locator('[data-id="2"]');
    await clicker1.click();

    // Wait for purchase to process and UI to update
    await expect(async () => {
      const doros = await page.evaluate(() => window.doroGame.state.doros);
      expect(doros).toBeLessThan(1000); // Verify we spent doros
    }).toPass();

    // Purchase second autoclicker with verification
    const clicker2 = page.locator('[data-id="4"]');
    await clicker2.click();

    await expect(async () => {
      const doros = await page.evaluate(() => window.doroGame.state.doros);
      expect(doros).toBeLessThan(990); // Verify we spent more doros
    }).toPass();

    // Open stats panel and verify DPS
    await page.locator("#show-stats").click();
    await expect(page.locator("#stat-dps")).toContainText("16.0");

    // Verify passive generation
    const postPurchaseDoros = await page.evaluate(
      () => window.doroGame.state.doros
    );

    // Wait for at least one full second of generation
    await page.waitForTimeout(1100);

    await expect(async () => {
      const newDoros = await page.evaluate(() => window.doroGame.state.doros);
      expect(newDoros).toBeGreaterThan(postPurchaseDoros + 15.5);
    }).toPass();
  });
});
