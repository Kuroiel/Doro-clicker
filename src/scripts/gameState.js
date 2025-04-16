export class GameState {
  constructor() {
    this.doros = 0;
    this.autoclickers = 0;
    this.listeners = [];
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