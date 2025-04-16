import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers.js';

test.describe('Upgrades System', () => {
  test('upgrade button becomes affordable when player has enough doros', async ({ page }) => {
    await page.goto('/');
    
    // Initial state check
    const initialState = await TestHelpers.getUpgradeState(page, 1);
    expect(initialState.affordable).toBe(false);
    
    // Click until we can afford the upgrade
    while ((await TestHelpers.getDorosCount(page)) < 10) {
      await page.click('#doro-image');
    }
    
    // Verify button becomes affordable
    const postState = await TestHelpers.getUpgradeState(page, 1);
// Change to check actual affordability logic
expect(postState.affordable).toBe(true);
expect(postState.disabled).toBe(false); 
  });

  test('purchasing upgrade affects game state', async ({ page }) => {
    await page.goto('/');
    
    // Earn enough for upgrade
    for (let i = 0; i < 10; i++) {
      await page.click('#doro-image');
    }
    
    // Purchase upgrade
    await page.click('[data-id="1"]');

    await page.waitForSelector('[data-id="1"]:has-text("Level 1")');
    
    // Verify purchase
    const buttonText = await page.locator('[data-id="1"]').textContent();
    expect(buttonText).toContain("Level 1");
    expect(buttonText).toContain("Cost: 100 Doros");
    
    // Verify click multiplier
    const initialScore = await TestHelpers.getDorosCount(page);
    await page.click('#doro-image');
    expect(await TestHelpers.getDorosCount(page)).toBeGreaterThanOrEqual(initialScore + 2);
  });

  test('autoclicker upgrade adds automatic income', async ({ page }) => {
    await page.goto('/');
    
    // Earn 100 doros
    while ((await TestHelpers.getDorosCount(page)) < 100) {
      await page.click('#doro-image');
    }
    
    // Buy autoclicker
    await page.click('[data-id="3"]');
    
    // Wait 2 seconds and check income
    const initial = await TestHelpers.getDorosCount(page);
    await page.waitForTimeout(2100); // 2 seconds + buffer
    const post = await TestHelpers.getDorosCount(page);
    
    expect(post).toBeGreaterThan(initial);
  });

  test('multiplier can be purchased multiple times', async ({ page }) => {
    await page.goto('/');
    
    // Buy first level
    for (let i = 0; i < 10; i++) await page.click('#doro-image');
    await page.click('[data-id="1"]');
    
    // Buy second level
    for (let i = 0; i < 50; i++) await page.click('#doro-image');
    await page.waitForSelector(`text=/Doros: 100/`);
    await page.click('[data-id="1"]');
    await page.waitForSelector('[data-id="1"]:has-text("Level 2")');
  
    // Verify level 2
    const buttonText = await page.locator('[data-id="1"]').textContent();
    expect(buttonText).toContain("Level 2");
    expect(buttonText).toContain("Cost: 1000 Doros");
  });
});