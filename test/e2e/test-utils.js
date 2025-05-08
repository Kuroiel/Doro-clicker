/**
 * Universal test utilities for Playwright tests
 * Maintains CI/local detection while simplifying initialization
 */
import { expect } from '@playwright/test';
/**
 * Waits for game to be fully initialized with environment awareness
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=30000] - Timeout in ms (longer for CI)
 */
export async function waitForGameInitialization(page, timeout = process.env.CI ? 45000 : 30000) {
    // Set environment flags before loading
    await page.addInitScript(() => {
        window.__TEST_ENV__ = true;
    });

    try {
        // Wait for page to fully load
        await page.waitForLoadState('networkidle', { timeout: process.env.CI ? 30000 : 15000 });

        // Core game check
        await page.waitForFunction(() => {
            return window.doroGame && 
                   window.doroGame.state && 
                   document.querySelector('#doro-image');
        }, { timeout });

        // Short stability wait
        await page.waitForTimeout(500);
    } catch (error) {
        if (process.env.CI) {
            console.warn('Initialization failed, retrying...');
            await page.reload();
            return waitForGameInitialization(page, timeout);
        }
        throw error;
    }
}

/**
 * Resets game state to known test conditions
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {object} [options] - Reset options
 * @param {number} [options.initialDoros=1000] - Initial doros count
 * @param {boolean} [options.resetUpgrades=true] - Whether to reset upgrades
 * @param {boolean} [options.resetAutoclickers=true] - Whether to reset autoclickers
 */
export async function resetGameState(page, {
    initialDoros = 1000,
    resetUpgrades = true,
    resetAutoclickers = true
} = {}) {
    // Ensure game is initialized with environment-appropriate timeout
    await waitForGameInitialization(page);

    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        const game = window.doroGame;
        game.state.doros = initialDoros;
        
        if (resetUpgrades && game.upgrades) {
            game.upgrades.forEach(u => u.purchased = 0);
        }
        if (resetAutoclickers && game.autoclickers) {
            game.autoclickers.forEach(a => {
                a.purchased = 0;
                a.value = a.baseDPS;
            });
        }
        
        if (typeof game.updateUI === 'function') {
            game.updateUI();
        }
    }, { initialDoros, resetUpgrades, resetAutoclickers });

    // Verify reset - now using properly imported expect
    await expect(page.locator('#score-display')).toContainText(`Doros: ${initialDoros}`);
}