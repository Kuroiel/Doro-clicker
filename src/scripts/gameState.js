export class GameState {
  constructor() {
    this.doros = 0;
    this.autoclickers = 0;
    this.manualClicks = 0; // Track manual clicks
    this.totalAutoDoros = 0; // Track auto-generated Doros
    this.totalDoros = 0; // Track all-time Doros
    this.listeners = [];
    this.globalDpsMultiplier = 1;
    this._lastNotifiedDoros = 0;
  }

  increment(amount = 1) {
    if (typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid increment amount:', amount);
      return;
    }
    this.doros += amount;
    this.totalDoros += amount;
    this.notify();
  }

  // Add auto-generated Doros
  addAutoDoros(amount) {
    // Get the actual DPS value from the autoclicker definition
    const actualAmount = amount * this.getCurrentDPSMultiplier();
    this.doros += actualAmount;
    this.totalAutoDoros += actualAmount;
    this.totalDoros += actualAmount;
    this.notify();
}
  

  addListener(callback) {
    this.listeners.push(callback);
  }
  
  notify() {
    // Check if Doros have changed (any difference)
    const dorosChanged = this.doros !== this._lastNotifiedDoros;
    
    // Notify listeners if:
    // 1. Doros changed, OR
    // 2. This is the first notification (initial state)
    if (dorosChanged || !this._lastNotifiedDoros) {
        this._lastNotifiedDoros = this.doros; // Update last notified value
        this.listeners.forEach(cb => cb()); // Trigger all UI updates
    }
    }

    getTotalDPS() {
      let total = 0;
      window.doroGame.autoclickers.forEach(clicker => {
        total += clicker.value * clicker.purchased;
      });
      return total * this.globalDpsMultiplier;
    }
  
    // AC6: Add method to apply global DPS multiplier
    applyGlobalDpsMultiplier(multiplier) {
      this.globalDpsMultiplier *= multiplier;
    }
  
    // Modify getCurrentDPSMultiplier to include global multiplier
    getCurrentDPSMultiplier() {
      return this.globalDpsMultiplier;
    }




  }