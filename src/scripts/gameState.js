export class GameState {
  constructor() {
    this.doros = 0;
    this.autoclickers = 0;
    this.manualClicks = 0; // Track manual clicks
    this.totalAutoDoros = 0; // Track auto-generated Doros
    this.totalDoros = 0; // Track all-time Doros
    this.listeners = [];
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

    getCurrentDPSMultiplier() {
      // This would normally come from your game instance,
      // but for simplicity we'll assume it's tracked here
      // In a real implementation, you might want to move this to the main game class
      return 1; // Default multiplier
  }

  }