/**
 * Universal test utilities for Playwright tests
 * Works in both local and GitHub Pages CI environments
 * Handles game initialization and state management
 */

/**
 * Safe game initialization utility
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=30000] - Timeout in ms (longer for CI)
 */
export async function waitForGameInitialization(page, timeout = process.env.CI ? 45000 : 30000) {
    const checkInterval = 500;
    const maxChecks = timeout / checkInterval;
    let checks = 0;
    
    // First ensure page is fully loaded with environment-appropriate timeout
    await page.waitForLoadState('networkidle', { timeout: process.env.CI ? 30000 : 15000 });

    // Environment-specific initialization script
    await page.addInitScript(() => {
        // Flag for test environment detection
        window.__TEST_ENV__ = true;
        
        // GitHub Pages specific handling
        if (window.location.hostname.includes('github.io')) {
            window.__GITHUB_PAGES__ = true;
        }
    });

    while (checks < maxChecks) {
        try {
            const isInitialized = await page.evaluate(() => {
                try {
                    // Handle GitHub Pages 404 cases
                    if (window.__GITHUB_PAGES__ && 
                        (document.title.includes('404') || 
                         document.body.textContent.includes('There isn\'t a GitHub Pages site here'))) {
                        return false;
                    }

                    // Check for existing game instance or try to create one
                    if (!window.doroGame) {
                        // Attempt to create game instance if constructor exists
                        if (typeof window.DoroClicker === 'function') {
                            try {
                                window.doroGame = new window.DoroClicker();
                            } catch (e) {
                                console.warn('Game constructor failed:', e);
                                return false;
                            }
                        }
                        return false;
                    }

                    // Verify core game components
                    return !!window.doroGame.state && 
                           !!window.doroGame.upgrades &&
                           !!window.doroGame.autoclickers &&
                           document.querySelector('#doro-image') &&
                           document.querySelector('.sidebar');
                } catch (e) {
                    console.warn('Initialization check error:', e);
                    return false;
                }
            });
            
            if (isInitialized) {
                // Additional stability wait
                await page.waitForTimeout(process.env.CI ? 2000 : 500);
                return true;
            }
        } catch (e) {
            console.warn(`Initialization check failed: ${e.message}`);
            // Only attempt reload in CI environment
            if (process.env.CI && checks > maxChecks / 2) {
                await page.reload();
                await page.waitForLoadState('networkidle');
            }
        }
        
        await page.waitForTimeout(checkInterval);
        checks++;
    }
    
    throw new Error(`Game failed to initialize within ${timeout}ms in ${process.env.CI ? 'CI' : 'local'} environment`);
}

/**
 * Universal game state reset utility
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
    // First ensure game is initialized
    await waitForGameInitialization(page);
    
    // Environment-appropriate wait
    await page.waitForLoadState('networkidle', { timeout: process.env.CI ? 20000 : 10000 });

    await page.evaluate(({ initialDoros, resetUpgrades, resetAutoclickers }) => {
        try {
            // Fallback for test environment
            if (!window.doroGame && window.__TEST_ENV__) {
                if (typeof window.DoroClicker === 'function') {
                    window.doroGame = new window.DoroClicker();
                } else {
                    console.error('DoroClicker constructor not available');
                    return;
                }
            }

            const game = window.doroGame;
            if (!game) {
                console.error('Game instance not found during reset');
                return;
            }
            
            // Core state reset
            game.state.doros = initialDoros;
            game.clickMultiplier = 1;
            game.state.autoclickers = 0;
            
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
            
            // UI update with fallback
            if (game.updateUI) {
                game.updateUI();
            } else if (window.__TEST_ENV__) {
                console.warn('updateUI method not available - forcing reload');
                window.location.reload();
            }
        } catch (e) {
            console.error('Failed to reset game state:', e);
            if (window.__TEST_ENV__) {
                window.location.reload();
            }
        }
    }, { initialDoros, resetUpgrades, resetAutoclickers });
    
    // Wait for UI to stabilize
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
    
    // Verify reset was successful
    const currentDoros = await page.evaluate(() => window.doroGame?.state?.doros);
    if (currentDoros !== initialDoros) {
        console.warn(`Reset verification failed (expected ${initialDoros}, got ${currentDoros})`);
        if (process.env.CI) {
            await page.reload();
            await waitForGameInitialization(page);
            await resetGameState(page, { initialDoros, resetUpgrades, resetAutoclickers });
        }
    }
}