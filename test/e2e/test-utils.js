/**
 * Optimized test utilities with fast-fail behavior
 * Maintains core functionality while reducing wait times
 */
import { expect } from '@playwright/test';

function getTestPath() {
    return process.env.CI ? '/Doro-clicker/' : '/';
  }

/**
 * Fast initialization check with minimal waits
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=10000] - Aggressive timeout (5s for CI)
 */
export async function waitForGameInitialization(page, timeout = process.env.CI ? 5000 : 3000) {
    const currentURL = await page.url();
    if (!currentURL.includes(getTestPath())) {
      await page.goto(getTestPath());
    }

    // Set test flag
    await page.addInitScript(() => {
        window.__TEST_ENV__ = true;
    });

    // Core checks with explicit timeout
    await expect(page).toHaveTitle('Doro Clicker', { timeout: 3000 });
    await expect(page.locator('#doro-image')).toBeVisible({ timeout: 3000 });
    await page.waitForFunction(() => window.doroGame?.state, { timeout: 3000 });
}

/**
 * Optimized state reset with immediate validation
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {object} [options] - Reset options
 */
export async function resetGameState(page, {
  initialDoros = 1000,
  resetUpgrades = true,
  resetAutoclickers = true
} = {}) {
  // Verify we're starting from initialized state
  const currentURL = await page.url();
  if (!currentURL.includes(getTestPath())) {
    await page.goto(getTestPath());
  }

  // Execute reset with immediate verification
  await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
      const game = window.doroGame;
      game.state.doros = initialDoros;
      
      if (resetUpgrades) game.upgrades?.forEach(u => u.purchased = 0);
      if (resetAutoclickers) game.autoclickers?.forEach(a => a.purchased = 0);
      
      game.updateUI?.();
  }, { initialDoros, resetUpgrades, resetAutoclickers });

  // Updated verification to handle formatted numbers with thousand separators
  const formattedDoros = new Intl.NumberFormat().format(initialDoros);
  await expect(page.locator('#score-display')).toContainText(`Doros: ${formattedDoros}`, { timeout: 2000 });
}