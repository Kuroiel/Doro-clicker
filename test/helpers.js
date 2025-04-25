/**
 * Shared test utilities
 */
export async function resetGameState(page) {
  await page.evaluate(() => {
    window.doroGame.destroy();
    window.doroGame = new DoroClicker();
  });
}

export async function setDoros(page, amount) {
  await page.evaluate((amount) => {
    window.doroGame.state.doros = amount;
    window.doroGame.updateUI();
  }, amount);
}