import { DOMHelper } from "../UI/dom.js";

export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.SAVE_INTERVAL_MS = 30000;
    this.saveInterval = null;
  }

  init() {
    if (!window.__TEST_ENV__) {
      this.loadGame();
      this.setupAutoSave();
    }
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
      };
      localStorage.setItem("doroClickerSave", JSON.stringify(saveData));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  loadGame() {
    try {
      const saveData = JSON.parse(localStorage.getItem("doroClickerSave"));
      
      // ALWAYS reset purchased counts first to avoid leakage from previous sessions
      this.game.autoclickers.forEach(a => a.purchased = 0);
      this.game.upgrades.forEach(u => u.purchased = 0);

      if (!saveData) {
        // If no save data, do an initial UI render and exit
        this.game.modifierSystem.recalculate();
        this.game.autoclickerSystem.recalculateDPS();
        this.game.ui.renderAllItems();
        return;
      }

      // Load base state data
      this.game.state.deserialize(saveData.state);

      // Load purchased counts for autoclickers
      saveData.autoclickers?.forEach((savedClicker) => {
        const clicker = this.game.autoclickers.find(
          (a) => a.id === savedClicker.id,
        );
        if (clicker) clicker.purchased = savedClicker.purchased || 0;
      });

      // Load purchased counts for upgrades
      saveData.upgrades?.forEach((savedUpgrade) => {
        const upgrade = this.game.upgrades.find(
          (u) => u.id === savedUpgrade.id,
        );
        if (upgrade) {
          upgrade.purchased = savedUpgrade.purchased || 0;
        }
      });

      // Recalculate everything based on loaded data
      this.game.modifierSystem.recalculate();
      this.game.autoclickerSystem.recalculateDPS();

      this.game.ui.forceFullUpdate();
    } catch (error) {
      console.error("Failed to load game:", error);
      // Fallback to a clean state if loading fails
      this.resetGame();
    }
  }

  resetGame() {
    // Reset all state and purchase counts
    localStorage.removeItem("doroClickerSave");

    this.game.state.reset();
    this.game.autoclickers.forEach((clicker) => (clicker.purchased = 0));
    this.game.upgrades.forEach((upgrade) => (upgrade.purchased = 0));

    this.game.modifierSystem.recalculate();
    this.game.autoclickerSystem.recalculateDPS();

    this.game.ui.forceFullUpdate();

    this.saveGame();
  }

  setupAutoSave() {
    if (this.saveInterval) clearInterval(this.saveInterval);
    this.saveInterval = setInterval(
      () => this.saveGame(),
      this.SAVE_INTERVAL_MS,
    );
  }

  setupResetButton() {
    const existingButton = DOMHelper.getResetButton();
    if (existingButton) return; // Already setup

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

  cleanup() {
    if (this.saveInterval) clearInterval(this.saveInterval);
  }
}
