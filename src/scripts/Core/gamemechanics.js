export class GameMechanics {
  constructor(game) {
    this.game = game;
    this.clickMultiplier = 1;
    this._processingPurchase = false;
    this._purchaseDebounce = false;
    this._clickLock = false;
  }

  handleClick() {
    if (this._clickLock) return; // Prevent double execution
    this._clickLock = true;

    try {
      this.game.state.manualClicks += 1; // Single increment
      this.game.state.increment(this.clickMultiplier);
      this.game.ui.updateScoreDisplay();
    } finally {
      this._clickLock = false;
    }
  }

  purchaseUpgrade(upgradeId) {
    if (this._processingPurchase) return false;
    this._processingPurchase = true;

    try {
      const upgrade =
        this.game.autoclickers.find((u) => u?.id === upgradeId) ||
        this.game.upgrades.find((u) => u?.id === upgradeId);

      if (!upgrade) {
        console.warn(`Upgrade ${upgradeId} not found`);
        return false;
      }

      if (!this.canAfford(upgrade)) {
        return false;
      }

      const cost =
        typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

      // Store previous values for comparison
      const previousPurchased = upgrade.purchased;
      const previousCost = cost;

      // Process purchase
      this.game.state.doros -= cost;
      upgrade.purchased += 1;
      this.applyUpgrade(upgrade);

      // Force complete UI refresh if purchased count changed
      if (upgrade.purchased !== previousPurchased) {
        this.game.ui._needsUpgradeRender = true;
      }

      // Special handling for autoclickers
      if (this.game.autoclickers.some((a) => a.id === upgradeId)) {
        requestAnimationFrame(() => {
          this.game.ui.refreshAutoclickerButtons();
        });
      }

      this.game.state.notify();
      return true;
    } finally {
      this._processingPurchase = false;
    }
  }

  applyUpgrade(upgrade) {
    if (upgrade.type === "multiplier") {
      this.clickMultiplier += upgrade.value;
    } else if (upgrade.type === "autoclicker") {
      // Force DPS recalculation on autoclicker purchase
      this.game.autoclickerSystem._lastDPS = 0;
    } else if (upgrade.type === "dpsMultiplier") {
      const lurkingDoro = this.game.autoclickers.find((a) => a.id === 2);
      if (lurkingDoro) {
        lurkingDoro.value =
          lurkingDoro.baseDPS * Math.pow(upgrade.value, upgrade.purchased);
      }
    }
  }

  canAfford(upgrade) {
    try {
      const cost =
        typeof upgrade.cost === "function" ? upgrade.cost() : upgrade.cost;

      if (isNaN(cost)) {
        console.warn(`Invalid cost calculation for upgrade ${upgrade.id}`);
        return false;
      }

      return Math.floor(this.game.state.doros) >= Math.ceil(cost);
    } catch (error) {
      console.error("Error in canAfford:", error);
      return false;
    }
  }

  debouncePurchase(upgradeId) {
    if (this._purchaseDebounce) return;
    this._purchaseDebounce = true;

    setTimeout(() => {
      this.purchaseUpgrade(upgradeId);
      this._purchaseDebounce = false;
    }, 50);
  }

  cleanup() {
    // Cleanup if needed
  }
}
