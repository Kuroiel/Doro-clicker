/**
 * Tests core game functionality and baseline interactions
 */
import { test, expect } from '@playwright/test';

test.describe('Basic Game Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
        
    await expect.poll(async () => {
      return await page.evaluate(() => {
        try {
          const game = window.doroGame;
          return game && game.state && game.upgrades;
        } catch (e) {
          return false;
        }
      });
    }, { 
      timeout: 10000,
      message: 'Game failed to initialize within 10 seconds'
    }).toBeTruthy();
    
    // Reset game state
    await page.evaluate(() => {
        const game = window.doroGame;
        game.state.doros = 0;
        game.clickMultiplier = 1;
        game.state.autoclickers = 0;
        
        game.upgrades.forEach(u => u.purchased = 0);
        game.autoclickers.forEach(a => {
            a.purchased = 0;
            a.value = a.baseDPS;
        });
    });

    // Explicitly click the upgrades view button and wait for view to be active
    const upgradesButton = page.locator('[data-view="upgrades"]');
    await upgradesButton.click();
    await expect(page.locator('#upgrades-container.active-view')).toBeVisible();
  });

  test('should load game with initial state', async ({ page }) => {
    // Verify core elements exist
    await expect(page).toHaveTitle('Doro Clicker');
    await expect(page.locator('.title')).toHaveText('Doro Clicker');
    await expect(page.locator('#doro-image')).toBeVisible();
    await expect(page.locator('#score-display')).toContainText('Doros: 0');
    
    // Verify initial upgrade state
    const upgradeButton = page.locator('.upgrade-button').first();
    await expect(upgradeButton).toBeDisabled();
  });

  test('should increment score on manual click', async ({ page }) => {
    // Initial click
    await page.locator('#doro-image').click();
    
    // Verify state updates
    const manualClicks = await page.evaluate(() => window.doroGame.state.manualClicks);
    expect(manualClicks).toBe(1);
    
    // Verify UI reflects changes
    await expect(page.locator('#score-display')).toContainText('Doros: 1');
    await expect(page.locator('#stat-clicks')).toContainText('1');
  });

  test('should handle stats overlay visibility', async ({ page }) => {
    // Verify overlay starts hidden
    await expect(page.locator('.stats-overlay')).toBeHidden();
    
    // Open and verify content
    await page.locator('#show-stats').click();
    await expect(page.locator('.stats-overlay')).toBeVisible();
    await expect(page.locator('#stat-dps')).toContainText('0');
    
    // Close overlay
    await page.locator('#close-stats').click();
    await expect(page.locator('.stats-overlay')).toBeHidden();
  });
});