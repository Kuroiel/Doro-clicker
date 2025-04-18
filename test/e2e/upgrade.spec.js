import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers.js';

test.describe('Upgrades System', () => {
  test('upgrade button becomes affordable when player has enough doros', async ({ page }) => {
    await page.goto('/');
    
    // Click until we have 10 doros
    while ((await TestHelpers.getDorosCount(page)) < 10) {
        await page.click('#doro-image');
    }

    // Switch to upgrades view
    await TestHelpers.ensureUpgradesView(page);
    
    // Wait for affordable state
    await page.waitForSelector('[data-id="1"].affordable:not(:disabled)');
    
    const postState = await TestHelpers.getUpgradeState(page, 1);
    expect(postState.affordable).toBe(true);
    expect(postState.disabled).toBe(false);
});

test('purchasing upgrade affects game state', async ({ page }) => {
  await page.goto('/');
  
  // Earn enough for upgrade
  for (let i = 0; i < 10; i++) {
      await page.click('#doro-image');
  }
  
  // Switch to upgrades view
  await TestHelpers.ensureUpgradesView(page);
  
  // Purchase upgrade
  await page.click('[data-id="1"]');

  // Verify changes
  await page.waitForSelector('[data-id="1"]:has-text("Level 1")');
  const buttonText = await page.locator('[data-id="1"]').textContent();
  expect(buttonText).toContain("Level 1");
  
  // Verify multiplier effect
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
    const initial = await TestHelpers.getDorosCount(page); // Should be 0

    // Wait for at least 2 autoclicks (2 seconds)
    await expect.poll(async () => 
      await TestHelpers.getDorosCount(page)
    ).toBeGreaterThanOrEqual(2);
});

test('multiplier can be purchased multiple times', async ({ page }) => {
  await page.goto('/');
  
  // Switch to upgrades view first
  await page.click('[data-view="upgrades"]');

  // Buy first level
  for (let i = 0; i < 10; i++) await page.click('#doro-image');
  await page.click('[data-id="1"]');
  
  // Verify first purchase
  await expect(page.locator('[data-id="1"]'))
    .toContainText('Level 1');

  // Earn 100 doros (50 clicks * 2 doros each)
  for (let i = 0; i < 50; i++) {
    await page.click('#doro-image');
    // Add small delay to allow UI updates
    if (i % 10 === 0) await page.waitForTimeout(50);
  }

  // Ensure view remains active and button is ready
  await page.click('[data-view="upgrades"]'); // Re-assert view
  await page.waitForSelector('[data-id="1"]:not(:disabled)');
  
  // Purchase second level
  await page.click('[data-id="1"]');
  
  // Verify level 2
  await expect(page.locator('[data-id="1"]'))
    .toContainText('Level 2');
  await expect(page.locator('[data-id="1"]'))
    .toContainText('Cost: 1000 Doros');
});
});