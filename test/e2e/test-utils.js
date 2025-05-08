/**
 * Optimized test utilities with fast-fail behavior
 * Maintains core functionality while reducing wait times
 */
import { expect } from '@playwright/test';

/**
 * Fast initialization check with minimal waits
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=10000] - Aggressive timeout (5s for CI)
 */
export async function waitForGameInitialization(page, timeout = process.env.CI ? 5000 : 3000) {
    // Set test flag immediately
    await page.addInitScript(() => {
        window.__TEST_ENV__ = true;
    });

    // Fast load check with hard timeout
    try {
        await Promise.race([
            page.waitForLoadState('networkidle'),
            new Promise((_, reject) => setTimeout(
                () => reject(new Error('Page load timeout')),
                timeout
            ))
        ]);

        // Direct game check without excessive waiting
        await expect(page.locator('#doro-image')).toBeVisible({ timeout });
        await expect(page).toHaveTitle('Doro Clicker', { timeout });

        // Verify core game state exists
        await page.waitForFunction(() => window.doroGame?.state, null, { timeout });
        
    } catch (error) {
        console.error(`Initialization failed: ${error.message}`);
        throw error; // Fail fast
    }
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
    await expect(page.locator('#doro-image')).toBeVisible();

    // Execute reset with immediate verification
    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        const game = window.doroGame;
        game.state.doros = initialDoros;
        
        if (resetUpgrades) game.upgrades?.forEach(u => u.purchased = 0);
        if (resetAutoclickers) game.autoclickers?.forEach(a => a.purchased = 0);
        
        game.updateUI?.();
    }, { initialDoros, resetUpgrades, resetAutoclickers });

    // Immediate state verification
    await expect(page.locator('#score-display')).toContainText(`Doros: ${initialDoros}`, { timeout: 2000 });
}