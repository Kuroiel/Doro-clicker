import { expect } from "@playwright/test";

function getTestPath() {
  return process.env.CI ? "/Doro-clicker/" : "/";
}

export async function waitForGameInitialization(
  page,
  timeout = process.env.CI ? 5000 : 3000
) {
  // Always set test flag and disable saving BEFORE navigation or on reload
  await page.addInitScript(() => {
    window.__TEST_ENV__ = true;
  });

  // Force a reload or navigate to ensure the init script takes effect
  const currentURL = await page.url();
  const targetURL = getTestPath();
  
  if (!currentURL.includes(targetURL)) {
    await page.goto(targetURL);
  } else {
    await page.reload();
  }

  // Ensure save system is disabled even after load
  await disableSaveSystem(page);

  // Core checks with explicit timeout
  await expect(page).toHaveTitle("Doro Clicker", { timeout });
  await expect(page.locator("#doro-image")).toBeVisible({ timeout });
  await page.waitForFunction(() => window.doroGame?.state, { timeout });
}

export async function resetGameState(page, { initialDoros = 1000 } = {}) {
  await page.evaluate(() => {
    if (window.doroGame?.saveSystem) {
      window.doroGame.saveSystem.resetGame();
    }
  });

  // After resetting to a clean slate, set the specific doros count for the test.
  if (initialDoros !== 0) {
    await page.evaluate(async (doros) => {
      const game = window.doroGame;
      game.state.doros = doros;
      game.state.totalDoros = doros;
      // Manually notify the UI that the state has changed.
      game.state.notify();
      
      // Since UI updates are using requestAnimationFrame, we should wait for at least one frame
      // to ensure the UI has a chance to reflect the changes.
      await new Promise(resolve => requestAnimationFrame(resolve));
    }, initialDoros);
  }

  // Verify the state was set correctly and the UI has updated.
  await expect(async () => {
    const displayedText = await page.locator("#score-display").textContent();
    const displayedNumber = parseInt(displayedText.replace(/[^0-9]/g, ""));
    expect(displayedNumber).toBe(initialDoros);
  }).toPass({ timeout: 2000 });
}

export async function disableSaveSystem(page) {
  await page.evaluate(() => {
    if (window.doroGame?.saveSystem) {
      // Disable auto-saving
      if (window.doroGame.saveSystem.saveInterval) {
        clearInterval(window.doroGame.saveSystem.saveInterval);
      }
      // Prevent any saves or loads during tests
      window.doroGame.saveSystem.saveGame = () => {};
      window.doroGame.saveSystem.loadGame = () => {};
    }
  });
}
