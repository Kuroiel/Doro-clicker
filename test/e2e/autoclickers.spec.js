/**
 * Tests autoclicker functionality and scaling
 * Updated to match current game mechanics
 */
import { test, expect } from '@playwright/test';

test.describe('Autoclicker System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
        
    // Wait for game to be fully initialized
    await page.waitForFunction(() => {
        const game = window.doroGame;
        return game && game.state && game.upgrades;
    }, { timeout: 10000 });
    
    // Reset game state
    await page.evaluate(() => {
        const game = window.doroGame;
        game.state.doros = 1000;
        game.clickMultiplier = 1;
        
        // Reset all upgrades and autoclickers
        game.upgrades.forEach(u => u.purchased = 0);
        game.autoclickers.forEach(a => {
            a.purchased = 0;
            a.value = a.baseDPS;
        });
        game.updateUI();
    });
  });

  test('should generate doros from autoclickers', async ({ page }) => {
    // Purchase autoclicker
    const autoClickerButton = page.locator('[data-id="2"]');
    await autoClickerButton.click();
    
    // Verify passive generation
    await page.waitForTimeout(1100); // Allow 1 interval to trigger
    const doros = await page.evaluate(() => window.doroGame.state.doros);
    
    // Check if doros increased (initial 1000 - cost + generation)
    const initialCost = 10; // Base cost of Lurking Doro
    expect(doros).toBeGreaterThan(1000 - initialCost); // Should have at least (initial - cost)
    expect(doros).toBeLessThan(1000 + 2); // Shouldn't gain more than 1 DPS in 1 second
  });

  test('should scale autoclicker costs', async ({ page }) => {
    const autoClickerButton = page.locator('[data-id="2"]');
    
    // Get initial cost
    const initialCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find(a => a.id === 2).cost();
    });
    
    // Purchase and verify cost increase
    await autoClickerButton.click();
    await page.waitForTimeout(100);
    const newCost = await page.evaluate(() => {
      return window.doroGame.autoclickers.find(a => a.id === 2).cost();
    });
    expect(newCost).toBeGreaterThan(initialCost);
  });

  test('should handle multiple autoclicker types', async ({ page }) => {
    // Purchase different autoclickers
    await page.locator('[data-id="2"]').click(); // Lurking Doro (1 DPS)
    await page.waitForTimeout(100);
    await page.locator('[data-id="4"]').click(); // Walkin Doro (15 DPS)
    await page.waitForTimeout(100);
    
    // Verify DPS display (1 + 15 = 16 DPS)
    await page.locator('#show-stats').click();
    await expect(page.locator('#stat-dps')).toContainText('16.0');
    
    // Verify passive generation after 1 second
    const initialDoros = await page.evaluate(() => window.doroGame.state.doros);
    await page.waitForTimeout(1100);
    const newDoros = await page.evaluate(() => window.doroGame.state.doros);
    expect(newDoros).toBeGreaterThan(initialDoros + 15); // Should gain at least 16 doros (DPS)
  });
});