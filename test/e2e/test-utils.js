/**
 * Universal test utilities for Playwright tests
 * Simplified version with robust initialization checks
 */

/**
 * Waits for game to be fully initialized with basic sanity checks
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=30000] - Timeout in ms (longer for CI)
 */
export async function waitForGameInitialization(page, timeout = process.env.CI ? 45000 : 30000) {
    // First ensure page is fully loaded
    await page.waitForLoadState('networkidle', { timeout: process.env.CI ? 30000 : 15000 });

    // Set test environment flag
    await page.evaluate(() => {
        window.__TEST_ENV__ = true;
    });

    // Wait for game object to be available with basic validation
    await page.waitForFunction(() => {
        // Basic game object check
        if (!window.doroGame) return false;
        
        // Core component checks
        return !!window.doroGame.state && 
               typeof window.doroGame.state.doros === 'number' &&
               document.querySelector('#doro-image') &&
               document.querySelector('.sidebar');
    }, { timeout });

    // Additional short wait for UI stability
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
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
    // Ensure game is initialized
    await waitForGameInitialization(page);

    // Reset game state through direct access
    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        const game = window.doroGame;
        
        // Core state reset
        game.state.doros = initialDoros;
        game.clickMultiplier = 1;
        game.state.manualClicks = 0;
        
        // Upgrades reset
        if (resetUpgrades && game.upgrades) {
            game.upgrades.forEach(u => u.purchased = 0);
        }
        
        // Autoclickers reset
        if (resetAutoclickers && game.autoclickers) {
            game.autoclickers.forEach(a => {
                a.purchased = 0;
                a.value = a.baseDPS;
            });
        }
        
        // Trigger UI update if available
        if (typeof game.updateUI === 'function') {
            game.updateUI();
        }
    }, { initialDoros, resetUpgrades, resetAutoclickers });

    // Verify reset was successful
    await expect(page.locator('#score-display')).toContainText(`Doros: ${initialDoros}`);
}