export class GameMechanics {
  constructor(game) {
    this.game = game;
    this.clickMultiplier = 1;
    // Remove excessive locks - we only need one for purchase processing
    this._processingPurchase = false;
  }

  handleClick() {
    // Simplified click handling without lock
    this.game.state.manualClicks += 1;
    this.game.state.increment(this.clickMultiplier);
    this.game.ui.updateScoreDisplay();
  }

  purchaseUpgrade(upgradeId) {
    // Skip if already processing (but don't block indefinitely)
    if (this._processingPurchase) return false;

    const upgrade =
      this.game.autoclickers.find((u) => u?.id === upgradeId) ||
      this.game.upgrades.find((u) => u?.id === upgradeId);

    if (!upgrade) {
      console.warn(`Upgrade ${upgradeId} not found`);
      return false;
    }

    // Fast affordability check before locking
    if (!this.canAfford(upgrade)) {
      return false;
    }

    this._processingPurchase = true;

    try {
      const cost =
        typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

      // Process purchase
      this.game.state.doros -= cost;
      upgrade.purchased += 1;
      this.applyUpgrade(upgrade);

      // Optimized UI updates:
      if (upgrade.type === "autoclicker") {
        // For autoclickers, just update the button directly
        requestAnimationFrame(() => {
          this.game.ui.refreshUpgradeButton(upgradeId);
          this.game.ui.updateScoreDisplay();
        });
      } else {
        // For other upgrades, mark for full refresh
        this.game.ui._needsUpgradeRender = true;
      }

      // Batch state notifications
      requestAnimationFrame(() => {
        this.game.state.notify();
      });

      return true;
    } finally {
      this._processingPurchase = false;
    }
  }

  applyUpgrade(upgrade) {
    // Simplified upgrade application
    switch (upgrade.type) {
      case "multiplier":
        this.clickMultiplier += upgrade.value;
        break;
      case "autoclicker":
        this.game.autoclickerSystem._lastDPS = 0; // Force recalc
        break;
      case "dpsMultiplier":
        const lurkingDoro = this.game.autoclickers.find((a) => a.id === 2);
        if (lurkingDoro) {
          lurkingDoro.value =
            lurkingDoro.baseDPS * Math.pow(upgrade.value, upgrade.purchased);
        }
        break;
    }
  }

  canAfford(upgrade) {
    // Simplified affordability check
    const cost =
      typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;
    return this.game.state.doros >= cost;
  }

  cleanup() {
    // Cleanup if needed
  }
}
