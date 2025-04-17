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
    this.totalDoros += amount; // Track all Doros earned
    this.notify();
  }

  // Add auto-generated Doros
  addAutoDoros(amount) {
    this.doros += amount;
    this.totalAutoDoros += amount;
    this.totalDoros += amount;
    this.notify();
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
  

  }