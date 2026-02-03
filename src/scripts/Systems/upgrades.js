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
    this.modifiers = config.modifiers || []; // New property
    this.maxPurchases = config.maxPurchases || Infinity;
    this.prerequisiteUpgradeId = config.prerequisiteUpgradeId || null;
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
        (u) => u.id === this.prerequisiteUpgradeId,
      );
      if (!prereq || prereq.purchased === 0) {
        return false;
      }
    }

    // Check all other visibility conditions
    return this.visibilityConditions.every((condition) => {
      switch (condition.type) {
        case "MIN_AUTOCLICKER_LEVEL":
          const ac = gameState.autoclickers.find(
            (a) => a.id === condition.autoclickerId,
          );
          return ac && ac.purchased >= condition.level;
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
    id: "upg_doro_power",
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
    modifiers: [{ target: "player", type: "click", action: "add", value: 1 }],
  }),
  new Upgrade({
    id: "upg_lurking_1",
    name: "Lurking Doro Upgrade I",
    type: "dpsMultiplier",
    baseCost: 500,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased,
      ).toFixed(2)}x`,
    visibilityConditions: [
      {
        type: "MIN_AUTOCLICKER_LEVEL",
        autoclickerId: "ac_lurking_doro",
        level: 10,
      },
    ],
    priority: 1,
    maxPurchases: 1,
    modifiers: [
      {
        target: "ac_lurking_doro",
        type: "dps",
        action: "multiply",
        value: 1.15,
      },
    ],
  }),
  new Upgrade({
    id: "upg_lurking_2",
    name: "Lurking Doro Upgrade II",
    type: "dpsMultiplier",
    baseCost: 10000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased,
      ).toFixed(2)}x`,
    visibilityConditions: [
      {
        type: "MIN_AUTOCLICKER_LEVEL",
        autoclickerId: "ac_lurking_doro",
        level: 20,
      },
    ],
    priority: 1,
    maxPurchases: 1,
    prerequisiteUpgradeId: "upg_lurking_1",
    modifiers: [
      {
        target: "ac_lurking_doro",
        type: "dps",
        action: "multiply",
        value: 1.15,
      },
    ],
  }),
  new Upgrade({
    id: "upg_lurking_3",
    name: "Lurking Doro Upgrade III",
    type: "dpsMultiplier",
    baseCost: 3000000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased,
      ).toFixed(2)}x`,
    visibilityConditions: [
      {
        type: "MIN_AUTOCLICKER_LEVEL",
        autoclickerId: "ac_lurking_doro",
        level: 50,
      },
    ],
    priority: 1,
    maxPurchases: 1,
    prerequisiteUpgradeId: "upg_lurking_2",
    modifiers: [
      {
        target: "ac_lurking_doro",
        type: "dps",
        action: "multiply",
        value: 1.15,
      },
    ],
  }),
  new Upgrade({
    id: "upg_lurking_4",
    name: "Lurking Doro Upgrade IV",
    type: "dpsMultiplier",
    baseCost: 10000000,
    value: 1.15,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased,
      ).toFixed(2)}x`,
    visibilityConditions: [
      {
        type: "MIN_AUTOCLICKER_LEVEL",
        autoclickerId: "ac_lurking_doro",
        level: 100,
      },
    ],
    priority: 1,
    maxPurchases: 1,
    prerequisiteUpgradeId: "upg_lurking_3",
    modifiers: [
      {
        target: "ac_lurking_doro",
        type: "dps",
        action: "multiply",
        value: 1.15,
      },
    ],
  }),
  new Upgrade({
    id: "upg_motivating_doro",
    name: "Motivating Doro",
    type: "globalDpsMultiplier",
    baseCost: 10000,
    value: 1.1,
    icon: "./src/assets/dorowhip.webp",
    description: 'A "motivating" Doro to make all Doros work harder.',
    effectDescription: () => "Adds 10% to the base value of all Doros",
    visibilityConditions: [{ type: "MIN_TOTAL_DPS", threshold: 500 }],
    priority: 1,
    maxPurchases: 1,
    modifiers: [
      { target: "global", type: "dps", action: "multiply", value: 1.1 },
    ],
  }),
];
