import { test, expect } from '@playwright/test';

test.describe('Doro Clicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
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
});