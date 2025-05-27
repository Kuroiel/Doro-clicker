import { expect } from '@playwright/test';

function getTestPath() {
    return process.env.CI ? '/Doro-clicker/' : '/';
}


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
      
      // Set initial doros through the state object
      game.state.doros = initialDoros;
      game.state.totalDoros = initialDoros;
      
      // Reset upgrades if requested
      if (resetUpgrades && game.upgrades) {
          game.upgrades.forEach(u => {
              u.purchased = 0;
              // Re-apply upgrade effects if needed
              game.mechanics.applyUpgrade(u);
          });
      }
      
      // Reset autoclickers if requested
      if (resetAutoclickers && game.autoclickers) {
          game.autoclickers.forEach(a => {
              a.purchased = 0;
              // Reset to base value
              if (a.baseDPS) {
                  a.value = a.baseDPS;
              }
          });
      }
      
      // Reset click multiplier
      game.mechanics.clickMultiplier = 1;
      
      // Force UI update
      game.ui.updateUI();
  }, { initialDoros, resetUpgrades, resetAutoclickers });

  // Verify the state was set correctly
  await expect(async () => {
      const displayedText = await page.locator('#score-display').textContent();
      const displayedNumber = displayedText.replace(/[^0-9]/g, '');
      expect(parseInt(displayedNumber)).toBe(initialDoros);
  }).toPass({ timeout: 2000 });
}