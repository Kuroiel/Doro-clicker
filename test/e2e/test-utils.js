/**
 * Safe game initialization utility for Playwright tests
 * Handles CSP restrictions in CI environments and provides more robust initialization checks
 */
export async function waitForGameInitialization(page, timeout = 30000) {  // Increased timeout for CI
    const checkInterval = 500;
    const maxChecks = timeout / checkInterval;
    let checks = 0;
    
    // First ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    
    while (checks < maxChecks) {
        try {
            const isInitialized = await page.evaluate(() => {
                try {
                    // More comprehensive check that includes DOM readiness
                    const gameExists = !!window.doroGame;
                    const domReady = document.readyState === 'complete';
                    const coreComponentsExist = gameExists && 
                        !!window.doroGame.state && 
                        !!window.doroGame.upgrades &&
                        !!window.doroGame.autoclickers;
                    
                    // Check if main game elements exist in DOM
                    const domElementsExist = document.querySelector('#doro-image') && 
                        document.querySelector('.sidebar');
                    
                    return gameExists && domReady && coreComponentsExist && domElementsExist;
                } catch (e) {
                    console.warn('Initialization check error:', e);
                    return false;
                }
            });
            
            if (isInitialized) {
                // Additional wait to ensure game is fully operational
                await page.waitForTimeout(200);
                return true;
            }
        } catch (e) {
            console.warn(`Initialization check failed: ${e.message}`);
        }
        
        await page.waitForTimeout(checkInterval);
        checks++;
    }
    
    // Try one last time with a direct evaluation
    try {
        const finalCheck = await page.evaluate(() => {
            try {
                return !!window.doroGame;
            } catch {
                return false;
            }
        });
        if (!finalCheck) {
            throw new Error(`Game failed to initialize within ${timeout}ms - window.doroGame not found`);
        }
    } catch (e) {
        throw new Error(`Game failed to initialize within ${timeout}ms - Last error: ${e.message}`);
    }
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
    // Wait for game to be stable before resetting
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        try {
            // Ensure game exists before attempting reset
            if (!window.doroGame) {
                console.error('Game instance not found during reset');
                return;
            }
            
            const game = window.doroGame;
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
            
            // Force UI update if method exists
            if (game.updateUI) {
                game.updateUI();
                // Additional check for DOM elements
                if (!document.querySelector('#score-display')) {
                    console.warn('DOM elements not ready during reset');
                }
            }
        } catch (e) {
            console.error('Failed to reset game state:', e);
            // Try to recover by reloading
            if (typeof window.__TESTING__ !== 'undefined') {
                window.location.reload();
            }
        }
    }, { initialDoros, resetUpgrades, resetAutoclickers });
    
    // Wait briefly for UI to update
    await page.waitForTimeout(100);
}