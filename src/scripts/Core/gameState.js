export class GameState {
  constructor() {
    this.doros = 0;
    this.manualClicks = 0;
    this.totalAutoDoros = 0;
    this.totalDoros = 0;
    this.listeners = [];
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

    // Use full precision for internal state to avoid losing progress at low DPS
    this.doros += dpsAmount;
    this.totalAutoDoros += dpsAmount;
    this.totalDoros += dpsAmount;
    this.notify();
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => this.removeListener(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
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

    const globalMultiplier = window.doroGame?.modifierSystem?.getMultiplier(
      "global",
      "dps",
    );
    return total * (globalMultiplier || 1);
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
  }

  /**
   * Resets game to initial state
   */
  reset() {
    this.doros = 0;
    this.manualClicks = 0;
    this.totalAutoDoros = 0;
    this.totalDoros = 0;
    this.notify();
  }
}
