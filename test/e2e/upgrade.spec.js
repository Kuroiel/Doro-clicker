/**
 * Tests upgrade purchasing and effects
 */
import { test, expect } from '@playwright/test';

test.describe('Upgrade System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set initial doros for upgrade tests
    await page.evaluate(() => {
      window.doroGame.state.doros = 1000;
      window.doroGame.updateUI();
    });
  });

  test('should purchase click multiplier upgrade', async ({ page }) => {
    const upgradeButton = page.locator('[data-id="1"]');
    
    // Verify initial state
    await expect(upgradeButton).toContainText('Cost: 10 Doros');
    
    // Purchase upgrade
    await upgradeButton.click();
    
    // Verify state changes
    const clickMultiplier = await page.evaluate(() => window.doroGame.clickMultiplier);
    expect(clickMultiplier).toBe(2);
    
    // Verify cost scaling
    await expect(upgradeButton).toContainText('Cost: 100 Doros');
  });

  test('should handle upgrade visibility conditions', async ({ page }) => {
    // Verify motivating doro is hidden initially
    await page.locator('[data-view="upgrades"]').click();
    const motivatingDoro = page.locator('[data-id="5"]');
    await expect(motivatingDoro).toBeHidden();
    
    // Meet visibility requirements
    await page.evaluate(() => {
      window.doroGame.state.autoclickers = 500;
      window.doroGame.updateUI();
    });
    
    // Verify upgrade appears
    await expect(motivatingDoro).toBeVisible();
  });

  test('should prevent unaffordable purchases', async ({ page }) => {
    // Reset to low funds
    await page.evaluate(() => {
      window.doroGame.state.doros = 5;
      window.doroGame.updateUI();
    });
    
    const upgradeButton = page.locator('[data-id="1"]');
    await expect(upgradeButton).toBeDisabled();
    await expect(upgradeButton).not.toHaveClass(/affordable/);
  });
});