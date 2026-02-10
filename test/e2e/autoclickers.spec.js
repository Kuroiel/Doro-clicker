import { test, expect } from "@playwright/test";
import { GamePage } from "./pages/GamePage";
import { UpgradePage } from "./pages/UpgradePage";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe("Autoclicker System", () => {
  let gamePage;
  let upgradePage;

  // runs before everything
  test.beforeEach(async ({ page, baseURL }) => {
    gamePage = new GamePage(page);
    upgradePage = new UpgradePage(page);

    await gamePage.navigate(baseURL);
    await waitForGameInitialization(page);
    // start with 1000 doros
    await resetGameState(page);
  });

  test.describe("Core Functionality", () => {
    test("should generate doros from autoclickers", async ({ page }) => {
      await expect(gamePage.scoreDisplay).toContainText("Doros: 1,000");

      await upgradePage.buyAutoclicker("ac_lurking_doro");

      // wait a bit
      await page.waitForTimeout(1100);
      const doros = await page.evaluate(() => window.doroGame.state.doros); // hope it actually generated

      const initialCost = 5;
      // check the math
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
        // keep goin
        expect(postPurchaseDoros).toBeGreaterThanOrEqual(1000 - 10 - 120); // close enough
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
        window.doroGame.state.notify(); // update ui
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

      await expect(tooltip).toContainText("Nice day out huh?"); // desc
      await expect(tooltip).toContainText("Final Value: 15.00 Doro/s"); // effect
    });
  });

  test.describe("Advanced Mechanics and Scaling", () => {
    test("should correctly handle multiple purchases of the same autoclicker", async ({
      page,
    }) => {
      // rich mode
      await resetGameState(page, { initialDoros: 50000 });

      // Purchase the same autoclicker 5 times.
      for (let i = 0; i < 5; i++) {
        await upgradePage.buyAutoclicker("ac_lurking_doro");
      }

      // check stuff
      await expect(async () => {
        const ownedCount = await page.evaluate(() => {
          return window.doroGame.autoclickers.find((a) => a.id === "ac_lurking_doro").purchased;
        });
        expect(ownedCount).toBe(5);
      }).toPass();

      // check dps
      await gamePage.openStats();
      await expect(async () => {
        await expect(gamePage.dpsStat).toContainText("0.5"); // 5 owned * 0.1 DPS each
      }).toPass();
    });

    test("should correctly purchase a high-tier autoclicker", async ({
      page,
    }) => {
      // rich mode again
      await resetGameState(page, { initialDoros: 50000 });

      // get costs
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
        // math checks
        expect(dorosAfter).toBeGreaterThanOrEqual(expectedDoros);
        expect(dorosAfter).toBeLessThan(expectedDoros + 100); // Reasonable upper bound

        // got it?
        const ownedCount = await page.evaluate(() => {
          return window.doroGame.autoclickers.find((a) => a.id === "ac_napping_siren_doro").purchased;
        });
        expect(ownedCount).toBe(1);
      }).toPass();
    });
  });
});

