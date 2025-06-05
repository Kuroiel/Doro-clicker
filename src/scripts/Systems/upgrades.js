// upgrades.js - Add the new upgrade to the array
export const upgrades = [
  {
    id: 1,
    name: "Doro Power",
    type: "multiplier",
    baseCost: 10,
    value: 1,
    purchased: 0,
    icon: "./src/assets/dorostare.webp",
    description: "More Doros?",
    effectDescription: (value, purchased) =>
      `Increases Doros per click by ${value}.\nCurrently increasing click power by ${
        value * purchased
      }.\n(${purchased} × ${value} per level)`,
    cost: function () {
      return Math.round(this.baseCost * Math.pow(10, this.purchased));
    },
  },

  {
    id: 3,
    name: "Lurking Doro Upgrade",
    type: "dpsMultiplier",
    baseCost: 500,
    value: 1.15,
    purchased: 0,
    icon: "./src/assets/dorocreep.webp",
    description: "Upgrade the Lurking Doros to lurk better.",
    effectDescription: (value, purchased) =>
      `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(
        value,
        purchased
      ).toFixed(2)}x`,
    cost: function () {
      const costLevels = [500, 10000, 3000000, 10000000];
      return costLevels[Math.min(this.purchased, costLevels.length - 1)];
    },
    isVisible: function (gameState) {
      // Get the Lurking Doro autoclicker
      const lurkingDoro = gameState.autoclickers.find((a) => a.id === 2);
      if (!lurkingDoro) return false;

      // Define thresholds for each upgrade level
      const thresholds = [10, 20, 50, 100];

      // If all upgrades are purchased, don't show
      if (this.purchased >= thresholds.length) return false;

      // Check if we've reached the threshold for the next purchase
      const nextThreshold = thresholds[this.purchased];
      const hasReachedThreshold = lurkingDoro.purchased >= nextThreshold;

      // Only show if we're at the threshold AND either:
      // 1. We haven't purchased this level yet, OR
      // 2. We're seeing if we should show the next level
      return hasReachedThreshold;
    },
    priority: 1,
  },
  {
    id: 5,
    name: "Motivating Doro",
    type: "globalDpsMultiplier",
    baseCost: 10000,
    value: 1.1, // 10% boost
    purchased: 0,
    icon: "./src/assets/dorowhip.webp",
    description: 'A "motivating" Doro to make all Doros work harder.',
    effectDescription: () => "Adds 10% to the base value of all Doros",
    cost: function () {
      return this.baseCost;
    },
    // AC1 & AC2: Only show when total DPS > 500
    isVisible: function (gameState) {
      // Calculate total DPS by summing (value * purchased) for all autoclickers
      const totalDPS = gameState.getTotalDPS();
      return totalDPS >= 500 && this.purchased < 1;
    },
    // AC7 & AC7.1: Control rendering order by priority
    priority: 1, // Higher priority than other hidden upgrades
  },
];
