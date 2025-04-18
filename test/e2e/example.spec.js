import { test, expect } from '@playwright/test';

test.describe('Doro Clicker', () => {
  test.beforeEach(async ({ page }) => {
    // Use relative path to leverage baseURL configuration
    await page.goto('/');
  });

  const getScore = async (page) => {
    const text = await page.locator('#score-display').innerText();
    const score = parseInt(text.split(' ')[1]);
    if (isNaN(score)) throw new Error('Score display format invalid');
    return score;
  };

  test('initial score should be 0', async ({ page }) => {
    expect(await getScore(page)).toBe(0);
  });

  test('score increments by 1 on click', async ({ page }) => {
    const initial = await getScore(page);
    await page.click('#doro-image');
    expect(await getScore(page)).toBe(initial + 1);
  });

  test('multiple clicks accumulate score', async ({ page }) => {
    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      await page.click('#doro-image');
    }
    expect(await getScore(page)).toBe(clicks);
  });

  test('multiplier upgrade increases click value cumulatively', async ({ page }) => {
    // Switch to upgrades view first
    await page.click('[data-view="upgrades"]');
    
    // Buy first level (cost=10)
    for (let i = 0; i < 10; i++) await page.click('#doro-image');
    await page.click('[data-id="1"]');
    
    // Verify first level works
    let initial = await getScore(page);
    await page.click('#doro-image');
    expect(await getScore(page)).toBe(initial + 2);

    // Earn 100 more doros (50 clicks * 2 doros each)
    for (let i = 0; i < 50; i++) await page.click('#doro-image');
    
    // Ensure upgrade is clickable again
    await page.click('[data-view="upgrades"]'); // Re-assert view
    await page.waitForSelector('[data-id="1"]:not(:disabled)');
    await page.click('[data-id="1"]');

    // Verify second level works
    initial = await getScore(page);
    await page.click('#doro-image');
    expect(await getScore(page)).toBe(initial + 3);
});
});