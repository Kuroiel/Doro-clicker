export class GameState {
    constructor() {
      this.doros = 0;
      this.upgrades = this.initializeUpgrades();
      this.autoclickers = 0;
      this.listeners = [];
    }
  
    initializeUpgrades() {
        return [
          { id: 1, name: "Double Click", cost: 10, type: 'multiplier', multiplier: 2, purchased: false },
          { id: 2, name: "Triple Click", cost: 50, type: 'multiplier', multiplier: 3, purchased: false },
          { id: 3, name: "Auto Clicker", cost: 100, type: 'autoclicker', value: 1, purchased: false }
        ];
      }

  addListener(callback) {
    this.listeners.push(callback);
  }
  
    notify() {
      this.listeners.forEach(cb => cb());
    }
  
    increment(amount = 1) {
      this.doros += amount;
      this.notify();
    }
  
    purchaseUpgrade(upgradeId) {
      const upgrade = this.upgrades.find(u => u.id === upgradeId);
      if (!upgrade.purchased && this.doros >= upgrade.cost) {
        this.doros -= upgrade.cost;
        upgrade.purchased = true;
        this.notify();
        return true;
      }
      return false;
    }
  }