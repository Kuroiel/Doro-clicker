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
    if (typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid increment amount:', amount);
      return;
    }
    this.doros += amount;
    this.totalDoros += amount;
    this.notify();
  }

  addAutoDoros(dpsAmount) {
    if (typeof dpsAmount !== 'number' || dpsAmount <= 0) {
        console.error('Invalid DPS amount:', dpsAmount);
        return;
    }
    
    // Add the full DPS amount each second
    this.doros += dpsAmount;
    this.totalAutoDoros += dpsAmount;
    this.totalDoros += dpsAmount;
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
    lastSaved: Date.now()
  };
}

/**
 * Loads game state from serialized data
 * @param {Object} data - Serialized game state
 */
deserialize(data) {
  if (!data) return;
  
  this.doros = data.doros || 0;
  this.manualClicks = data.manualClicks || 0;
  this.totalAutoDoros = data.totalAutoDoros || 0;
  this.totalDoros = data.totalDoros || 0;
  this.globalDpsMultiplier = data.globalDpsMultiplier || 1;
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