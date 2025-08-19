export const CostCalculations = {
  // Standard exponential cost growth with decade jumps
  standardCost: (
    baseCost,
    purchased,
    baseGrowth = 1.1,
    decadeFactor = 1.7,
    milestones = []
  ) => {
    if (typeof purchased !== "number" || purchased < 0 || isNaN(purchased)) {
      console.error("Invalid purchased count:", purchased);
      return Infinity;
    }

    let cost = baseCost;
    cost *= Math.pow(baseGrowth, purchased);

    const decades = Math.floor(purchased / 10);
    cost *= Math.pow(decadeFactor, decades);

    // Apply milestone multipliers
    for (const [threshold, multiplier] of milestones) {
      if (purchased >= threshold) cost *= multiplier;
    }

    // Ensure cost always increases by at least 1
    if (purchased > 0) {
      let prevCost = baseCost;
      prevCost *= Math.pow(baseGrowth, purchased - 1);
      const prevDecades = Math.floor((purchased - 1) / 10);
      prevCost *= Math.pow(decadeFactor, prevDecades);

      for (const [threshold, multiplier] of milestones) {
        if (purchased - 1 >= threshold) prevCost *= multiplier;
      }

      cost = Math.max(cost, prevCost + 1);
    }

    return Math.round(cost);
  },

  // Simple exponential cost
  simpleExponential: (baseCost, purchased, growthRate = 10) => {
    return Math.round(baseCost * Math.pow(growthRate, purchased));
  },

  // Flat cost (for upgrades that don't change price)
  flatCost: (baseCost) => baseCost,
};
