import { test, expect } from "@playwright/test";
import { GamePage } from "./pages/GamePage";
import { UpgradePage } from "./pages/UpgradePage";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Autoclicker System", () => {
  let gamePage;
  let upgradePage;

  // This block runs before each test in this describe block.
  test.beforeEach(async ({ page, baseURL }) => {
    gamePage = new GamePage(page);
    upgradePage = new UpgradePage(page);

    await gamePage.navigate(baseURL);
    await waitForGameInitialization(page);
    // Reset to a known state with 1000 Doros by default.
    await resetGameState(page);
  });

  test.describe("Core Functionality", () => {
    test("should generate doros from autoclickers", async ({ page }) => {
      await expect(gamePage.scoreDisplay).toContainText("Doros: 1,000");

      await upgradePage.buyAutoclicker("ac_lurking_doro");

      // Wait for at least one full generation interval (1.1 seconds)
      await page.waitForTimeout(1100);
      const doros = await page.evaluate(() => window.doroGame.state.doros);

      const initialCost = 5;
      // After 1 purchase (cost 5) and 1.1s of generation (0.1 dps), doros should be ~995.1
      expect(doros).toBeGreaterThan(1000 - initialCost);
      expect(doros).toBeLessThan(1000 - initialCost + 1); // Narrower margin since DPS is lower
    });

    test("should scale autoclicker costs after purchase", async ({ page }) => {
      const autoClickerButton = upgradePage.getUpgradeButton("ac_lurking_doro");

      const initialCost = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === "ac_lurking_doro").cost;
      });

      await upgradePage.buyAutoclicker("ac_lurking_doro");

      await expect(async () => {
        const newCost = await page.evaluate(() => {
          return window.doroGame.autoclickers.find((a) => a.id === "ac_lurking_doro").cost;
        });
        expect(newCost).toBeGreaterThan(initialCost);
      }).toPass();
    });

    test("should handle multiple different autoclicker types", async ({
      page,
    }) => {
      await upgradePage.buyAutoclicker("ac_lurking_doro");
      await upgradePage.buyAutoclicker("ac_walkin_doro");

      await expect(async () => {
        const postPurchaseDoros = await page.evaluate(
          () => window.doroGame.state.doros
        );
        // Doros will continue to increment as autoclickers are active.
        expect(postPurchaseDoros).toBeGreaterThanOrEqual(1000 - 10 - 120);
      }).toPass();

      await gamePage.openStats();

      await expect(async () => {
        await expect(gamePage.dpsStat).toContainText("15.1"); // 0.1 DPS from Lurking Doro + 15 DPS from Walkin Doro
      }).toPass();
    });
  });

  test.describe("UI State and Feedback", () => {
    test("should disable button when unaffordable and enable when affordable", async ({
      page,
    }) => {
      await resetGameState(page, { initialDoros: 2 });
      const lurkingDoroButton = upgradePage.getUpgradeButton("ac_lurking_doro"); // Costs 5
      await expect(lurkingDoroButton).toBeDisabled();

      await page.evaluate(() => {
        window.doroGame.state.doros = 15;
        window.doroGame.state.notify(); // Manually trigger UI update
      });

      await expect(lurkingDoroButton).toBeEnabled();
    });

    test("should display a correct and informative tooltip on hover", async ({
      page,
    }) => {
      const walkinDoroButton = upgradePage.getUpgradeButton("ac_walkin_doro"); // Walkin Doro (15 DPS)

      await walkinDoroButton.hover();

      const tooltip = walkinDoroButton.locator(".upgrade-tooltip");
      await expect(tooltip).toBeVisible();

      await expect(tooltip).toContainText("Nice day out huh?"); // Description
      await expect(tooltip).toContainText("Final Value: 15.00 Doro/s"); // Effect
    });
  });

  test.describe("Advanced Mechanics and Scaling", () => {
    test("should correctly handle multiple purchases of the same autoclicker", async ({
      page,
    }) => {
      // Start with a large amount of Doros to afford multiple purchases
      await resetGameState(page, { initialDoros: 50000 });

      // Purchase the same autoclicker 5 times.
      for (let i = 0; i < 5; i++) {
        await upgradePage.buyAutoclicker("ac_lurking_doro");
      }

      // Verify the final state of the autoclicker.
      await expect(async () => {
        const ownedCount = await page.evaluate(() => {
          return window.doroGame.autoclickers.find((a) => a.id === "ac_lurking_doro").purchased;
        });
        expect(ownedCount).toBe(5);
      }).toPass();

      // Verify the DPS reflects 5 purchases.
      await gamePage.openStats();
      await expect(async () => {
        await expect(gamePage.dpsStat).toContainText("0.5"); // 5 owned * 0.1 DPS each
      }).toPass();
    });

    test("should correctly purchase a high-tier autoclicker", async ({
      page,
    }) => {
      // Start with enough Doros for a high-tier item.
      await resetGameState(page, { initialDoros: 50000 });

      // Get the exact cost before purchasing.
      const initialCost = await page.evaluate(() => {
        return window.doroGame.autoclickers.find((a) => a.id === "ac_napping_siren_doro").cost;
      });
      
      const dorosBefore = await page.evaluate(
        () => window.doroGame.state.doros
      );

      await upgradePage.buyAutoclicker("ac_napping_siren_doro");

      await expect(async () => {
        const dorosAfter = await page.evaluate(() => window.doroGame.state.doros);
        const expectedDoros = dorosBefore - initialCost;
        // The doros should be at least (before - cost), and potentially a bit more due to generation.
        expect(dorosAfter).toBeGreaterThanOrEqual(expectedDoros);
        expect(dorosAfter).toBeLessThan(expectedDoros + 100); // Reasonable upper bound

        // Verify the item was purchased.
        const ownedCount = await page.evaluate(() => {
          return window.doroGame.autoclickers.find((a) => a.id === "ac_napping_siren_doro").purchased;
        });
        expect(ownedCount).toBe(1);
      }).toPass();
    });
  });
});

