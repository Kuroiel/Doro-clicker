import { test, expect } from "@playwright/test";
import { GamePage } from "./pages/GamePage";
import { UpgradePage } from "./pages/UpgradePage";
import { waitForGameInitialization, resetGameState } from "./test-utils";

test.describe('Milestone Refresh E2E', () => {
  let gamePage;

  test.beforeEach(async ({ page, baseURL }) => {
    gamePage = new GamePage(page);
    await gamePage.navigate(baseURL);
    await waitForGameInitialization(page);
    await resetGameState(page); // start with 1000
  });

  test('should show Lurking Doro Upgrade I after buying 10 Lurking Doros', async ({ page }) => {
    // game ready?
    await page.waitForFunction(() => window.doroGame && window.doroGame.state && window.doroGame.ui);

    // 1. check it's hidden
    await page.click('button[data-view="upgrades"]');
    const upgradeSelector = '.upgrade-button:has-text("Lurking Doro Upgrade I")';
    await expect(page.locator(upgradeSelector)).not.toBeVisible();

    // 2. buy 10
    await page.click('button[data-view="autoclickers"]');
    
    // cheat for cash
    await page.evaluate(() => {
      window.doroGame.state.doros = 1000000;
      window.doroGame.state.notify();
    });

    const buyButton = page.locator('#autoclickers-container .upgrade-button:has-text("Lurking Doro")');
    // check if we can click
    await expect(buyButton).toBeEnabled({ timeout: 10000 });

    for (let i = 0; i < 10; i++) {
        await buyButton.click();
    }

    // 3. check visibility
    await page.click('button[data-view="upgrades"]');
    
    // wait for it
    await page.waitForSelector(upgradeSelector, { state: 'visible', timeout: 5000 });
    const upgrade = page.locator(upgradeSelector);
    await expect(upgrade).toBeVisible();
    await expect(upgrade).toContainText('Creepier creeps for more Doros.');
  });

  test('should NOT show Doro Power in autoclicker list', async ({ page }) => {
    await page.click('button[data-view="autoclickers"]');
    const doroPower = page.locator('#autoclickers-container .upgrade-button:has-text("Doro Power")');
    await expect(doroPower).not.toBeVisible();

    await page.click('button[data-view="upgrades"]');
    const doroPowerInUpgrades = page.locator('#upgrades-container .upgrade-button:has-text("Doro Power")');
    await expect(doroPowerInUpgrades).toBeVisible();
  });
});
