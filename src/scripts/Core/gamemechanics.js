export class GameMechanics {
  constructor(game) {
    this.game = game;
    this.clickMultiplier = 1;
    this._processingPurchase = false;
  }

  handleClick() {
    this.game.state.manualClicks += 1;
    this.game.state.increment(this.clickMultiplier);
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
      this.applyUpgrade(item);

      this.game.state.notify();

      requestAnimationFrame(() => {
        this.game.ui.refreshUpgradeButton(item.id);
      });

      return true;
    } finally {
      this._processingPurchase = false;
    }
  }

  recalculateClickMultiplier() {
    let totalMultiplier = 1;
    const clickUpgrades = this.game.upgrades.filter(
      (u) => u.type === "clickMultiplier" && u.purchased > 0
    );
    for (const upgrade of clickUpgrades) {
      totalMultiplier += upgrade.value * upgrade.purchased;
    }
    this.clickMultiplier = totalMultiplier;
  }

  applyUpgrade(upgrade) {
    switch (upgrade.type) {
      case "clickMultiplier":
        this.recalculateClickMultiplier();
        break;

      case "globalDpsMultiplier":
        this.recalculateGlobalDpsMultiplier();
        this.game.autoclickerSystem.recalculateDPS();
        break;

      case "autoclicker":
        this.game.autoclickerSystem.recalculateDPS();
        break;

      case "dpsMultiplier":
        if (upgrade.targetAutoclickerId !== null) {
          this.recalculateDpsForAutoclicker(upgrade.targetAutoclickerId);
        }
        break;
    }
  }

  recalculateDpsForAutoclicker(autoclickerId) {
    const autoclicker = this.game.autoclickers.find(
      (a) => a.id === autoclickerId
    );
    if (!autoclicker) return;

    const dpsUpgrades = this.game.upgrades.filter(
      (u) =>
        u.type === "dpsMultiplier" &&
        u.targetAutoclickerId === autoclickerId &&
        u.purchased > 0
    );

    let multiplier = 1;
    for (const upgrade of dpsUpgrades) {
      multiplier *= Math.pow(upgrade.value, upgrade.purchased);
    }

    autoclicker.value = autoclicker.baseDPS * multiplier;
    this.game.autoclickerSystem.recalculateDPS();
  }

  recalculateGlobalDpsMultiplier() {
    let totalMultiplier = 1;
    const globalUpgrades = this.game.upgrades.filter(
      (u) => u.type === "globalDpsMultiplier" && u.purchased > 0
    );

    for (const upgrade of globalUpgrades) {
      totalMultiplier *= Math.pow(upgrade.value, upgrade.purchased);
    }

    this.game.state.globalDpsMultiplier = totalMultiplier;
  }

  canAfford(item) {
    const cost = item.cost;
    return this.game.state.doros >= cost;
  }

  cleanup() {}
}
