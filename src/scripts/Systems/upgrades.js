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
    this.modifiers = config.modifiers || [];
    this.maxPurchases = config.maxPurchases || Infinity;
    this.prerequisiteUpgradeId = config.prerequisiteUpgradeId || null;
  }

  get cost() {
    if (typeof this.costFunction === "function") {
      return this.costFunction(this.baseCost, this.purchased);
    }
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
      if (!prereq || prereq.purchased === 0) {
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
        case "MIN_TOTAL_DPS":
          return gameState.getTotalDPS() >= condition.threshold;
        default:
          return true;
      }
    });
  }
}

class StrengtheningUpgrade extends Upgrade {
  constructor(config) {
    super(config);
    this.autoclickerId = config.autoclickerId;
    this.milestone = config.milestone;
    this.bonusValue = config.bonusValue;
    this.value = this.bonusValue; // Ensure value is set for the tooltip
    this.modifiers = [
      {
        target: this.autoclickerId,
        type: "dps",
        action: "addMultiplier",
        value: this.bonusValue,
      },
    ];
  }

  get cost() {
    const ac = window.doroGame?.autoclickers?.find(
      (a) => a.id === this.autoclickerId
    );
    if (!ac) return Infinity;
    // Price of the 11th one if milestone is 10.
    // standardCost(..., 10) is the cost of the 11th one.
    const nextAcCost = CostCalculations.standardCost(
      ac.baseCost,
      this.milestone,
      ac.template.baseGrowth,
      ac.template.milestones,
      ac.template.rampUpThreshold,
      ac.template.rampUpGrowth
    );
    return Math.round(nextAcCost * 5);
  }

  isVisible(gameState) {
    if (this.purchased >= this.maxPurchases) return false;
    const ac = gameState.autoclickers.find((a) => a.id === this.autoclickerId);
    return ac && ac.purchased >= this.milestone;
  }
}

/**
 * Metadata for specific milestones for better flavor text and icons
 */
const UPGRADE_METADATA = {
  ac_lurking_doro: {
    10: {
      description: "Creepier creeps for more Doros.",
      icon: "./src/assets/dorocreep.webp",
    },
    25: {
      description: "Shadow stalking tactics.",
    },
  },
  ac_napping_siren_doro: {
    10: {
      description: "Better lullabies for Siren.",
      icon: "./src/assets/SirenDoroSleep.webp",
    },
  },
};

const STATIC_UPGRADES = [
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
    id: "upg_motivating_doro",
    name: "Motivating Doro",
    type: "globalDpsMultiplier",
    baseCost: 10000,
    value: 1.1,
    icon: "./src/assets/dorowhip.webp",
    description: 'A "motivating" Doro to make all Doros work harder.',
    effectDescription: () => "Adds 10% to the total DPS of all Doros",
    visibilityConditions: [{ type: "MIN_TOTAL_DPS", threshold: 500 }],
    priority: 1,
    maxPurchases: 1,
    modifiers: [{ target: "global", type: "dps", action: "multiply", value: 1.1 }],
  }),
];

function toRoman(num) {
  const map = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let result = "";
  for (let key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result;
}

function generateStrengtheningUpgrades(autoclickers) {
  const dynamicUpgrades = [];
  const bonusTable = {
    10: 0.1,
    25: 0.15,
    50: 0.25,
    100: 0.4,
    200: 0.6,
    500: 0.8,
    1000: 1.0,
  };

  autoclickers.forEach((ac) => {
    let levelCounter = 1;

    // Generate milestone upgrades
    ac.template.milestones.forEach(([threshold]) => {
      let bonus = bonusTable[threshold] || 1.0;
      if (ac.id === "ac_napping_siren_doro") {
        bonus *= 1.5; // Siren gets 50% more bonus
      }

      const meta = UPGRADE_METADATA[ac.id]?.[threshold] || {};

      dynamicUpgrades.push(
        new StrengtheningUpgrade({
          id: `upg_strength_${ac.id}_${threshold}`,
          name: `${ac.name} Upgrade ${toRoman(levelCounter++)}`,
          autoclickerId: ac.id,
          milestone: threshold,
          bonusValue: bonus,
          value: bonus, // pass value explicitly too
          type: "dpsMultiplier",
          icon: meta.icon || ac.icon,
          description:
            meta.description ||
            `Strengthen your ${ac.name}s after reaching ${threshold} of them.`,
          effectDescription: (value) =>
            `Adds ${value.toFixed(2)} to the ${ac.name} multiplier base.`,
          maxPurchases: 1,
        })
      );
    });

    // Generate 10x milestones (10k, 100k, etc.)
    const extraMilestones = [10000, 100000, 1000000];
    extraMilestones.forEach((threshold) => {
      let bonus = 1.0;
      if (ac.id === "ac_napping_siren_doro") {
        bonus *= 1.5;
      }

      dynamicUpgrades.push(
        new StrengtheningUpgrade({
          id: `upg_strength_${ac.id}_${threshold}`,
          name: `${ac.name} Upgrade ${toRoman(levelCounter++)}`,
          autoclickerId: ac.id,
          milestone: threshold,
          bonusValue: bonus,
          value: bonus,
          type: "dpsMultiplier",
          icon: ac.icon,
          description: `Massively strengthen your ${ac.name}s after reaching ${threshold} of them.`,
          effectDescription: (value) =>
            `Adds ${value.toFixed(2)} to the ${ac.name} multiplier base.`,
          maxPurchases: 1,
        })
      );
    });
  });

  return dynamicUpgrades;
}

// We need to import autoclickers to generate these
import { autoclickers } from "./autoclickers.js";

// Instantiate and export upgrades directly
export const upgrades = [
  ...STATIC_UPGRADES,
  ...generateStrengtheningUpgrades(autoclickers),
];
