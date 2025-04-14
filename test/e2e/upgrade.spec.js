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
    expect(postState.affordable).toBe(true);
    expect(postState.disabled).toBe(false);
  });

  test('purchasing upgrade affects game state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Earn enough for upgrade
    for (let i = 0; i < 10; i++) {
      await page.click('#doro-image');
    }
    
    // Purchase upgrade
    await page.click('[data-testid="upgrade-1"]');
    
    // Verify purchase
    const postState = await TestHelpers.getUpgradeState(page, 1);
    expect(postState.purchased).toBe(true);
    expect(postState.disabled).toBe(true);
    
    // Verify click multiplier
    const initialScore = await TestHelpers.getDorosCount(page);
    await page.click('#doro-image');
    expect(await TestHelpers.getDorosCount(page)).toBe(initialScore + 2);
  });
});