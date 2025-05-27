import { test, expect } from '@playwright/test';
import { waitForGameInitialization, resetGameState } from './test-utils';

test.describe('Autoclicker System', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
        
    await waitForGameInitialization(page);
  
    await resetGameState(page);

  });

  test('should generate doros from autoclickers', async ({ page }) => {
  // Verify initial doros
    await expect(page.locator('#score-display')).toContainText('Doros: 1,000');
  
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
    await page.locator('[data-id="2"]').click(); 
    await page.waitForTimeout(100);
    await page.locator('[data-id="4"]').click(); 
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