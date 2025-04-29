export class GameState {
  constructor() {
    this.doros = 0;
    this.autoclickers = 0; // Track total autoclickers count
    this.manualClicks = 0;
    this.totalAutoDoros = 0;
    this.totalDoros = 0;
    this.listeners = [];
    this.globalDpsMultiplier = 1;
    this._lastNotifiedDoros = 0;
    this._autoclickers = [];
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
  
  setAutoclickers(autoclickers) {
    this._autoclickers = autoclickers;
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
      if (!this._autoclickers || this._autoclickers.length === 0) return 0;
    
      let total = 0;
      this._autoclickers.forEach(clicker => {
        if (clicker && typeof clicker.value === 'number' && typeof clicker.purchased === 'number') {
          total += clicker.value * clicker.purchased;
        }
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