/**
 * Tests autoclicker functionality and scaling
 */
import { test, expect } from '@playwright/test';

test.describe('Autoclicker System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Set initial doros for autoclicker tests
    await page.evaluate(() => {
      window.doroGame.state.doros = 1000;
      window.doroGame.updateUI();
    });
  });

  test('should generate doros from autoclickers', async ({ page }) => {
    // Purchase autoclicker
    const autoClickerButton = page.locator('[data-id="2"]');
    await autoClickerButton.click();
    
    // Verify immediate state change
    const autoClickers = await page.evaluate(() => window.doroGame.state.autoclickers);
    expect(autoClickers).toBe(1);
    
    // Verify passive generation
    await page.waitForTimeout(1100); // Allow 1 interval to trigger
    const doros = await page.evaluate(() => window.doroGame.state.doros);
    expect(doros).toBeGreaterThan(1000 - 10); // Initial 1000 - cost + generation
  });

  test('should scale autoclicker costs', async ({ page }) => {
    const autoClickerButton = page.locator('[data-id="2"]');
    
    // Get initial cost
    const initialCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find(a => a.id === 2).cost();
    });
    
    // Purchase and verify cost increase
    await autoClickerButton.click();
    const newCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find(a => a.id === 2).cost();
    });
    expect(newCost).toBeGreaterThan(initialCost);
  });

  test('should handle multiple autoclicker types', async ({ page }) => {
    // Purchase different autoclickers
    await page.locator('[data-id="2"]').click(); // Lurking Doro
    await page.locator('[data-id="4"]').click(); // Walkin Doro
    
    // Verify combined effect
    const autoClickers = await page.evaluate(() => window.doroGame.state.autoclickers);
    expect(autoClickers).toBe(16); // 1 (id2) + 15 (id4)
    
    // Verify DPS display
    await page.locator('#show-stats').click();
    await expect(page.locator('#stat-dps')).toContainText('16');
  });
});