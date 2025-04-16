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

  // Add this test to verify multiplier stacking
  test('multiplier upgrade increases click value cumulatively', async ({ page }) => {
    // Buy first level (cost=10)
    for (let i = 0; i < 10; i++) await page.click('#doro-image');
    await page.click('[data-id="1"]');
    
    // Verify first level works
    let initial = await getScore(page);
    await page.click('#doro-image');
    expect(await getScore(page)).toBe(initial + 2); // 1 base + 1 level
    
    // Buy second level (cost=100)
    for (let i = 0; i < 90; i++) await page.click('#doro-image');
    await page.click('[data-id="1"]');
    
    // Verify second level works
    initial = await getScore(page);
    await page.click('#doro-image');
    expect(await getScore(page)).toBe(initial + 3); // 1 base + 2 levels
  });
});