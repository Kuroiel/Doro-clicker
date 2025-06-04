export class GameState {
  constructor() {
    this.doros = 0;
    this.manualClicks = 0;
    this.totalAutoDoros = 0;
    this.totalDoros = 0;
    this.listeners = [];
    this.globalDpsMultiplier = 1;
    this._lastNotifiedDoros = 0;
    this._autoclickers = [];
  }

  increment(amount = 1) {
    if (typeof amount !== "number" || amount <= 0 || isNaN(amount)) {
      console.error("Invalid increment amount:", amount);
      return;
    }
    this.doros += amount;
    this.totalDoros += amount;
    this.notify();
  }

  addAutoDoros(dpsAmount) {
    if (typeof dpsAmount !== "number" || dpsAmount <= 0 || isNaN(dpsAmount)) {
      console.error("Invalid DPS amount:", dpsAmount);
      return;
    }

    // Round to 2 decimal places, treating very small numbers as 0
    const amountToAdd =
      dpsAmount < 0.005 ? 0 : parseFloat(dpsAmount.toFixed(2));

    this.doros += amountToAdd;
    this.totalAutoDoros += amountToAdd;
    this.totalDoros += amountToAdd;
    this.notify();
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  setAutoclickers(autoclickers) {
    this._autoclickers = autoclickers;
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (error) {
        console.error("State listener error:", error);
      }
    });
    this._lastNotifiedDoros = this.doros;
  }

  getTotalDPS() {
    if (!this._autoclickers || this._autoclickers.length === 0) return 0;

    let total = 0;
    this._autoclickers.forEach((clicker) => {
      if (
        clicker &&
        typeof clicker.value === "number" &&
        typeof clicker.purchased === "number"
      ) {
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

  // ======================
  // Save/Load Methods
  // ======================

  /**
   * Serializes game state for saving
   * @returns {Object} Serializable game state
   */
  serialize() {
    return {
      doros: this.doros,
      manualClicks: this.manualClicks,
      totalAutoDoros: this.totalAutoDoros,
      totalDoros: this.totalDoros,
      globalDpsMultiplier: this.globalDpsMultiplier,
      lastSaved: Date.now(),
    };
  }

  /**
   * Loads game state from serialized data
   * @param {Object} data - Serialized game state
   */
  deserialize(data) {
    if (!data) return;

    const safeNumber = (value, defaultValue) => {
      if (typeof value !== "number" || !isFinite(value)) {
        return defaultValue;
      }
      return value;
    };

    this.doros = safeNumber(data.doros, 0);
    this.manualClicks = safeNumber(data.manualClicks, 0);
    this.totalAutoDoros = safeNumber(data.totalAutoDoros, 0);
    this.totalDoros = safeNumber(data.totalDoros, 0);
    this.globalDpsMultiplier = safeNumber(data.globalDpsMultiplier, 1);
  }

  /**
   * Resets game to initial state
   */
  reset() {
    this.doros = 0;
    this.manualClicks = 0;
    this.totalAutoDoros = 0;
    this.totalDoros = 0;
    this.globalDpsMultiplier = 1;
    this.notify();
  }
}
