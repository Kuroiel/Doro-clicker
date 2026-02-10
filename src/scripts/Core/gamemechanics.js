export class GameMechanics {
  constructor(game) {
    this.game = game;
    this.clickMultiplier = 1;
    this._processingPurchase = false;
  }

  handleClick() {
    this.game.state.manualClicks += 1;
    const clickPower = this.game.modifierSystem.apply(1, "player", "click");
    this.game.state.increment(clickPower);
    this.game.state.notify();
  }

  purchaseUpgrade(upgradeId) {
    if (this._processingPurchase) return false;
    this._processingPurchase = true;

    try {
      const item =
        this.game.autoclickers.find((u) => u.id === upgradeId) ||
        this.game.upgrades.find((u) => u.id === upgradeId);
      if (!item) return false;

      const cost = item.cost;
      if (this.game.state.doros < cost) return false;

      this.game.state.doros -= cost;
      item.purchased += 1;

      // New data-driven approach: just recalculate modifiers
      this.game.modifierSystem.recalculate();

      // Recalculate DPS if needed
      this.game.autoclickerSystem.recalculateDPS();

      this.game.state.notify();

      this.game.ui.refreshUpgradeButton(item.id);
      return true;
    } finally {
      this._processingPurchase = false;
    }
  }

  // These methods are now mostly redundant or simplified
  recalculateClickMultiplier() {
    // Redundant now, but kept for compatibility if needed
  }

  applyUpgrade(upgrade) {
    // Redundant now as purchaseUpgrade handles it via modifierSystem.recalculate()
  }

  recalculateDpsForAutoclicker(autoclickerId) {
    // Redundant now
  }

  recalculateGlobalDpsMultiplier() {
    // Redundant now
  }

  canAfford(item) {
    const cost = item.cost;
    return this.game.state.doros >= cost;
  }

  cleanup() {}
}
