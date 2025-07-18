import { CostCalculations } from "./utils.js";

class Upgrade {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.baseCost = config.baseCost;
    this.value = config.value;
    this.purchased = 0;
    this.icon = config.icon;
    this.description = config.description;
    this.effectDescription = config.effectDescription;
    this.costFunction = config.costFunction || "flatCost";
    this.visibilityConditions = config.visibilityConditions || [];
    this.priority = config.priority || 0;
    this.targetAutoclickerId = config.targetAutoclickerId || null;
    this.maxPurchases = config.maxPurchases || Infinity; // New property
    this.prerequisiteUpgradeId = config.prerequisiteUpgradeId || null; // Renamed for clarity
  }

  get cost() {
    return CostCalculations[this.costFunction](this.baseCost, this.purchased);
  }

  canPurchase() {
    return this.purchased < this.maxPurchases;
  }

  isVisible(gameState) {
    // Hide if we've reached max purchases
    if (this.purchased >= this.maxPurchases) {
      return false;
    }

    // Check prerequisite upgrade
    if (this.prerequisiteUpgradeId) {
      const prereq = gameState.upgrades.find(
        (u) => u.id === this.prerequisiteUpgradeId
      );
      if (!prereq || prereq.purchased < prereq.maxPurchases) {
        return false;
      }
    }

    // Check all other visibility conditions
    return this.visibilityConditions.every((condition) => {
      switch (condition.type) {
        case "MIN_AUTOCLICKER_LEVEL":
          const ac = gameState.autoclickers.find(
            (a) => a.id === condition.autoclickerId
          );
          return ac && ac.purchased >= condition.level;
        case "MAX_UPGRADE_LEVEL":
          return this.purchased < condition.maxLevel;
        case "MIN_TOTAL_DPS":
          return gameState.getTotalDPS() >= condition.threshold;
        default:
          return true;
      }
    });
  }
}

// Instantiate and export upgrades directly
export const upgrades = [
  new Upgrade({
    id: 1,
    name: "Doro Power",
    type: "clickMultiplier",
    baseCost: 10,
    value: 1,
    icon: "./src/assets/dorostare.webp",
    description: "More Doros?",
    effectDescription: (value, purchased) =>
      `Increases Doros per click by ${value}.\nCurrently increasing click power by ${
        value * purchased
      }.\n(${purchased} × ${value} per level)`,
    costFunction: "simpleExponential",
  }),
  new Upgrade({
    id: 3,
    name: "Lurking Doro Upgrade I",
    type: "dpsMultiplier",
    baseCost: 500,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased
      ).toFixed(2)}x`,
    visibilityConditions: [
      { type: "MIN_AUTOCLICKER_LEVEL", autoclickerId: 2, level: 10 },
    ],
    priority: 1,
    targetAutoclickerId: 2,
    maxPurchases: 1,
  }),
  new Upgrade({
    id: 14,
    name: "Lurking Doro Upgrade II",
    type: "dpsMultiplier",
    baseCost: 10000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased + 1
      ).toFixed(2)}x`,
    visibilityConditions: [
      { type: "MIN_AUTOCLICKER_LEVEL", autoclickerId: 2, level: 20 },
    ],
    priority: 1,
    targetAutoclickerId: 2,
    maxPurchases: 1,
    prerequisiteUpgradeId: 3,
  }),
  new Upgrade({
    id: 15,
    name: "Lurking Doro Upgrade III",
    type: "dpsMultiplier",
    baseCost: 3000000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased + 2
      ).toFixed(2)}x`,
    visibilityConditions: [
      { type: "MIN_AUTOCLICKER_LEVEL", autoclickerId: 2, level: 50 },
      { type: "MAX_UPGRADE_LEVEL", maxLevel: 1 },
    ],
    priority: 1,
    targetAutoclickerId: 2,
    maxPurchases: 1,
    prerequisiteUpgradeId: 14,
  }),
  new Upgrade({
    id: 16,
    name: "Lurking Doro Upgrade IV",
    type: "dpsMultiplier",
    baseCost: 10000000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased + 3
      ).toFixed(2)}x`,
    visibilityConditions: [
      { type: "MIN_AUTOCLICKER_LEVEL", autoclickerId: 2, level: 100 },
      { type: "MAX_UPGRADE_LEVEL", maxLevel: 1 },
    ],
    priority: 1,
    targetAutoclickerId: 2,
    maxPurchases: 1,
    prerequisiteUpgradeId: 15,
  }),
  new Upgrade({
    id: 5,
    name: "Motivating Doro",
    type: "globalDpsMultiplier",
    baseCost: 10000,
    value: 1.1,
    icon: "./src/assets/dorowhip.webp",
    description: 'A "motivating" Doro to make all Doros work harder.',
    effectDescription: () => "Adds 10% to the base value of all Doros",
    visibilityConditions: [
      { type: "MIN_TOTAL_DPS", threshold: 500 },
      { type: "MAX_UPGRADE_LEVEL", maxLevel: 1 },
    ],
    priority: 1,
  }),
];
