import { expect } from "@playwright/test";

function getTestPath() {
  return process.env.CI ? "/Doro-clicker/" : "/";
}

// waiting for the house of cards to stand up
export async function waitForGameInitialization(
  page,
  timeout = process.env.CI ? 5000 : 3000
) {
  // no saving allowed
  await page.addInitScript(() => {
    window.__TEST_ENV__ = true;
  });

  // refresh
  const currentURL = await page.url();
  const targetURL = getTestPath();
  
  if (!currentURL.includes(targetURL)) {
    await page.goto(targetURL);
  } else {
    await page.reload();
  }

  // no saves
  await disableSaveSystem(page);

  // basic checks
  await expect(page).toHaveTitle("Doro Clicker", { timeout });
  await expect(page.locator("#doro-image")).toBeVisible({ timeout });
  await page.waitForFunction(() => window.doroGame?.state, { timeout });
}

// turning it off and on again
export async function resetGameState(page, { initialDoros = 1000 } = {}) {
  await page.evaluate(() => {
    if (window.doroGame?.saveSystem) {
      window.doroGame.saveSystem.resetGame();
    }
  });

  // set the numbers
  if (initialDoros !== 0) {
    await page.evaluate(async (doros) => {
      const game = window.doroGame;
      game.state.doros = doros;
      game.state.totalDoros = doros;
      game.state.notify(); // tell ui
      
      // wait a frame
      await new Promise(resolve => requestAnimationFrame(resolve));
    }, initialDoros);
  }

  // check if it worked
  await expect(async () => {
    const displayedText = await page.locator("#score-display").textContent();
    const displayedNumber = parseInt(displayedText.replace(/[^0-9]/g, ""));
    expect(displayedNumber).toBe(initialDoros);
  }).toPass({ timeout: 2000 });
}

export async function disableSaveSystem(page) {
  await page.evaluate(() => {
    if (window.doroGame?.saveSystem) {
      // stop auto save
      if (window.doroGame.saveSystem.saveInterval) {
        clearInterval(window.doroGame.saveSystem.saveInterval);
      }
      // kill saves
      window.doroGame.saveSystem.saveGame = () => {};
      window.doroGame.saveSystem.loadGame = () => {};
    }
  });
}
