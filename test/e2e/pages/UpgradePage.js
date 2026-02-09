import { BasePage } from "./BasePage";
import { expect } from "@playwright/test";

export class UpgradePage extends BasePage {
  constructor(page) {
    super(page);
  }

  getUpgradeButton(id) {
    return this.page.locator(`.upgrade-button[data-id="${id}"]`);
  }

  async buyUpgrade(id) {
    const button = this.page.locator(`[data-id="${id}"]`);
    // Ensure button is enabled before clicking, as disabled buttons ignores clicks in game logic
    // We add a timeout since we expect it to be enabled by resetGameState/ui updates
    await expect(button).toBeEnabled();
    await button.click({ force: true });
    // Verify purchase happened by checking cost increase or button state if checking specific logic
    // For now we assume click works, but let's add a small wait if the UI is slow to react
    // await this.page.waitForTimeout(50); 
  }

  async buyAutoclicker(id) {
    // Autoclickers share a similar structure, often identified by data-id
    const button = this.page.locator(`[data-id="${id}"]`);
    await expect(button).toBeEnabled();
    await button.click({ force: true });
  }
}
