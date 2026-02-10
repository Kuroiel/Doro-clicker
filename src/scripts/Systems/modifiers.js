// math stuff for bonuses
export class ModifierSystem {
  constructor(game) {
    this.game = game;
    this.modifiers = new Map();
  }

  // redo all the math
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

  // recalibrating the universe
  addModifier(mod, purchasedCount) {
    const key = `${mod.target}:${mod.type}`;
    const current = this.modifiers.get(key) || { multiplier: 1, add: 0 };

    if (mod.action === "multiply") {
      // result = base * (value ^ count)
      current.multiplier *= Math.pow(mod.value, purchasedCount);
    } else if (mod.action === "addMultiplier") {
      // result = base * (multiplier + value * count)
      current.multiplier += mod.value * purchasedCount;
    } else if (mod.action === "add") {
      // result = base + (value * count)
      current.add += mod.value * purchasedCount;
    }

    this.modifiers.set(key, current);
  }

  // helpers
  getMultiplier(target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    return mod ? mod.multiplier : 1;
  }

  getAdd(target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    return mod ? mod.add : 0;
  }

  // the moment of truth
  apply(baseValue, target, type) {
    const mod = this.modifiers.get(`${target}:${type}`);
    if (!mod) return baseValue;
    return (baseValue + mod.add) * mod.multiplier;
  }
}
