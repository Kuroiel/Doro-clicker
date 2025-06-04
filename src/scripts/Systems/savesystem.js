import { DOMHelper } from "../UI/dom.js";

export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.SAVE_INTERVAL_MS = 30000;
    this.saveInterval = null;
  }

  init() {
    if (window.__TEST_ENV__) return; // Skip initialization during tests

    this.loadGame();
    this.setupAutoSave();
    this.setupResetButton();
  }

  saveGame() {
    try {
      const saveData = {
        state: this.game.state.serialize(),
        autoclickers: this.game.autoclickers.map((a) => ({
          id: a.id,
          purchased: a.purchased,
        })),
        upgrades: this.game.upgrades.map((u) => ({
          id: u.id,
          purchased: u.purchased,
        })),
        clickMultiplier: this.game.mechanics.clickMultiplier,
      };
      localStorage.setItem("doroClickerSave", JSON.stringify(saveData));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  loadGame() {
    try {
      const saveData = JSON.parse(localStorage.getItem("doroClickerSave"));
      if (!saveData) return;

      this.game.state.deserialize(saveData.state);

      saveData.autoclickers?.forEach((savedClicker) => {
        const clicker = this.game.autoclickers.find(
          (a) => a.id === savedClicker.id
        );
        if (clicker) clicker.purchased = savedClicker.purchased || 0;
      });

      saveData.upgrades?.forEach((savedUpgrade) => {
        const upgrade = this.game.upgrades.find(
          (u) => u.id === savedUpgrade.id
        );
        if (upgrade) {
          upgrade.purchased = savedUpgrade.purchased || 0;
          this.game.mechanics.applyUpgrade(upgrade);
        }
      });

      this.game.mechanics.clickMultiplier = saveData.clickMultiplier || 1;
      this.game.ui.updateUI();
    } catch (error) {
      console.error("Failed to load game:", error);
    }
  }

  resetGame() {
    this.game.state.reset();
    this.game.autoclickers.forEach((clicker) => (clicker.purchased = 0));
    this.game.upgrades.forEach((upgrade) => (upgrade.purchased = 0));
    this.game.mechanics.clickMultiplier = 1;
    this.game.ui.updateUI();
    this.saveGame();
  }

  setupAutoSave() {
    if (this.saveInterval) clearInterval(this.saveInterval);
    this.saveInterval = setInterval(
      () => this.saveGame(),
      this.SAVE_INTERVAL_MS
    );
  }

  setupResetButton() {
    if (!document.getElementById("reset-button")) {
      const resetBtn = document.createElement("button");
      resetBtn.id = "reset-button";
      resetBtn.className = "reset-button";
      resetBtn.textContent = "Reset";
      document.body.appendChild(resetBtn);

      resetBtn.addEventListener("click", () => DOMHelper.showResetModal());

      document.addEventListener("click", (e) => {
        if (e.target.id === "confirm-reset") {
          this.resetGame();
          DOMHelper.hideResetModal();
        } else if (e.target.id === "cancel-reset") {
          DOMHelper.hideResetModal();
        }
      });
    }
  }

  cleanup() {
    if (this.saveInterval) clearInterval(this.saveInterval);
  }
}
