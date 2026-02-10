const { test, expect } = require('@playwright/test');

test.describe('Milestone Refresh E2E', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    await page.goto('http://localhost:5500');
    // Clear local storage if any
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show Lurking Doro Upgrade I after buying 10 Lurking Doros', async ({ page }) => {
    // Wait for game to be ready
    await page.waitForFunction(() => window.doroGame && window.doroGame.state && window.doroGame.ui);

    // 1. Check that "Lurking Doro Upgrade I" is NOT visible initially
    await page.click('button[data-view="upgrades"]');
    const upgradeSelector = '.upgrade-button:has-text("Lurking Doro Upgrade I")';
    await expect(page.locator(upgradeSelector)).not.toBeVisible();

    // 2. Buy 10 Lurking Doros
    await page.click('button[data-view="autoclickers"]');
    
    // Cheat a bit to get enough doros
    await page.evaluate(() => {
      window.doroGame.state.doros = 1000000;
      window.doroGame.state.notify();
    });

    const buyButton = page.locator('#autoclickers-container .upgrade-button:has-text("Lurking Doro")');
    // Ensure the button is enabled after cheating
    await expect(buyButton).toBeEnabled({ timeout: 10000 });

    for (let i = 0; i < 10; i++) {
        await buyButton.click();
    }

    // 3. Switch to upgrades view and check visibility
    await page.click('button[data-view="upgrades"]');
    
    // Wait for the specific upgrade to appear
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
