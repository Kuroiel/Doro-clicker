/**
 * Handles all mathematical modifiers for the game.
 * Centralizes the calculation of bonuses to avoid scattered logic.
 */
export class ModifierSystem {
  constructor(game) {
    this.game = game;
    this.modifiers = new Map();
  }

  /**
   * Recalculates all active modifiers based on purchased items.
   */
  recalculate() {
    this.modifiers.clear();

    const allItems = [...this.game.autoclickers, ...this.game.upgrades];

    allItems.forEach((item) => {
      if (item.purchased > 0 && item.modifiers) {
        item.modifiers.forEach((mod) => {
          this.addModifier(mod, item.purchased);
        });
      }
    });
  }

  /**
   * Adds a modifier to the system.
   * @param {Object} mod - The modifier definition
   * @param {number} purchasedCount - How many times the source was purchased
   */
  addModifier(mod, purchasedCount) {
    const key = `${mod.target}:${mod.type}`;
    const current = this.modifiers.get(key) || { multiplier: 1, add: 0 };

    if (mod.action === "multiply") {
      // Multiplicative modifiers: result = base * (value ^ count)
      current.multiplier *= Math.pow(mod.value, purchasedCount);
    } else if (mod.action === "addMultiplier") {
      // Additive multiplier bonuses: result = base * (multiplier + value * count)
      current.multiplier += mod.value * purchasedCount;
    } else if (mod.action === "add") {
      // Additive modifiers: result = base + (value * count)
      current.add += mod.value * purchasedCount;
    }

    this.modifiers.set(key, current);
  }

  /**
   * Gets the total multiplier for a specific target and type.
   */
  getMultiplier(target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    return mod ? mod.multiplier : 1;
  }

  /**
   * Gets the total additive bonus for a specific target and type.
   */
  getAdd(target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    return mod ? mod.add : 0;
  }

  /**
   * Applies modifiers to a base value.
   */
  apply(baseValue, target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    if (!mod) return baseValue;
    return (baseValue + mod.add) * mod.multiplier;
  }
}
