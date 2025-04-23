export class GameState {
  constructor() {
    this.doros = 0;
    this.autoclickers = 0;
    this.manualClicks = 0; // Track manual clicks
    this.totalAutoDoros = 0; // Track auto-generated Doros
    this.totalDoros = 0; // Track all-time Doros
    this.listeners = [];
    this.globalDpsMultiplier = 1;
  }

  increment(amount = 1) {
    this.doros += amount;
    this.totalDoros += amount; // Track all Doros earned (manual + auto)
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
      this.listeners.forEach(cb => cb());
    }

    getTotalDPS() {
      // In a real implementation, you would sum (value * purchased) for all autoclickers
      // For now, we'll assume this is calculated elsewhere and stored in this.autoclickers
      return this.autoclickers * this.globalDpsMultiplier;
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