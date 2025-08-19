import { expect } from "@playwright/test";

function getTestPath() {
  return process.env.CI ? "/Doro-clicker/" : "/";
}

export async function waitForGameInitialization(
  page,
  timeout = process.env.CI ? 5000 : 3000
) {
  const currentURL = await page.url();
  if (!currentURL.includes(getTestPath())) {
    await page.goto(getTestPath());
  }

  // Set test flag and disable saving
  await page.addInitScript(() => {
    window.__TEST_ENV__ = true;
  });
  await disableSaveSystem(page);

  // Core checks with explicit timeout
  await expect(page).toHaveTitle("Doro Clicker", { timeout: 3000 });
  await expect(page.locator("#doro-image")).toBeVisible({ timeout: 3000 });
  await page.waitForFunction(() => window.doroGame?.state, { timeout: 3000 });
}

export async function resetGameState(page, { initialDoros = 1000 } = {}) {
  await page.evaluate(() => {
    if (window.doroGame?.saveSystem) {
      window.doroGame.saveSystem.resetGame();
    }
  });

  // After resetting to a clean slate, set the specific doros count for the test.
  if (initialDoros !== 0) {
    await page.evaluate((doros) => {
      const game = window.doroGame;
      game.state.doros = doros;
      game.state.totalDoros = doros;
      // Manually notify the UI that the state has changed.
      game.state.notify();
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
