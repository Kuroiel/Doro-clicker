/**
 * Safe game initialization utility for Playwright tests
 * Handles CSP restrictions in CI environments
 */
export async function waitForGameInitialization(page, timeout = 10000) {
    const checkInterval = 500;
    const maxChecks = timeout / checkInterval;
    let checks = 0;
    
    while (checks < maxChecks) {
        try {
            const isInitialized = await page.evaluate(() => {
                try {
                    return !!window.doroGame?.state && !!window.doroGame?.upgrades;
                } catch (e) {
                    return false;
                }
            });
            
            if (isInitialized) return true;
        } catch (e) {
            console.warn(`Initialization check failed: ${e.message}`);
        }
        
        await page.waitForTimeout(checkInterval);
        checks++;
    }
    
    throw new Error(`Game failed to initialize within ${timeout}ms`);
}

/**
 * Safe game state reset utility
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
    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        try {
            const game = window.doroGame;
            if (!game) return;
            
            game.state.doros = initialDoros;
            game.clickMultiplier = 1;
            game.state.autoclickers = 0;
            
            if (resetUpgrades && game.upgrades) {
                game.upgrades.forEach(u => u.purchased = 0);
            }
            
            if (resetAutoclickers && game.autoclickers) {
                game.autoclickers.forEach(a => {
                    a.purchased = 0;
                    a.value = a.baseDPS;
                });
            }
            
            if (game.updateUI) game.updateUI();
        } catch (e) {
            console.error('Failed to reset game state:', e);
        }
    }, { initialDoros, resetUpgrades, resetAutoclickers });
}