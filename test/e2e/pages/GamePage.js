import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class GamePage extends BasePage {
  constructor(page) {
    super(page);
    this.doroImage = page.locator("#doro-image");
    this.scoreDisplay = page.locator("#score-display");
    this.titleText = page.locator(".title");
    this.autoDorosButton = page.locator('[data-view="autoclickers"]');
    this.doroUpgradesButton = page.locator('[data-view="upgrades"]');
    this.autoclickersContainer = page.locator("#autoclickers-container");
    this.upgradesContainer = page.locator("#upgrades-container");
    this.showStatsButton = page.locator("#show-stats");
    this.closeStatsButton = page.locator("#close-stats");
    this.statsOverlay = page.locator("#stats-overlay");
    this.dpsStat = page.locator("#stat-dps");
    this.totalStat = page.locator("#stat-total");
    this.resetButton = page.locator("#reset-button");
    this.confirmResetButton = page.locator("#confirm-reset");
  }

  async clickDoro() {
    await this.doroImage.click();
  }

  async getScore() {
    return this.scoreDisplay.textContent();
  }

  async switchToAutoclickers() {
    await this.autoDorosButton.click();
    await expect(this.autoclickersContainer).toBeVisible();
    await expect(this.autoclickersContainer).toHaveClass(/active-view/);
  }

  async switchToUpgrades() {
    await this.doroUpgradesButton.click();
    await expect(this.upgradesContainer).toBeVisible();
    await expect(this.upgradesContainer).toHaveClass(/active-view/);
  }

  async openStats() {
    await this.showStatsButton.click();
  }

  async closeStats() {
    await this.closeStatsButton.click();
  }

  async resetGame() {
    await this.resetButton.click();
    await this.confirmResetButton.click();
  }

  async getManualClicks() {
    return await this.page.evaluate(() => window.doroGame.state.manualClicks);
  }

  async getClickMultiplier() {
    return await this.page.evaluate(
      () => window.doroGame.modifierSystem.apply(1, "player", "click")
    );
  }
}
