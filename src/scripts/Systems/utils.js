export const CostCalculations = {
  // Standard exponential cost growth with decade jumps
  standardCost: (
    baseCost,
    purchased,
    baseGrowth = 1.1,
    milestones = [],
    rampUpThreshold = 50,
    rampUpGrowth = 1.15
  ) => {
    if (typeof purchased !== "number" || purchased < 0 || isNaN(purchased)) {
      console.error("Invalid purchased count:", purchased);
      return Infinity;
    }

    let cost = baseCost;

    // Scaling for in-between numbers
    if (purchased <= rampUpThreshold) {
      cost *= Math.pow(baseGrowth, purchased);
    } else {
      // Scale normally up to threshold, then use higher growth
      cost *= Math.pow(baseGrowth, rampUpThreshold);
      cost *= Math.pow(rampUpGrowth, purchased - rampUpThreshold);
    }

    // Apply milestone multipliers (jumps in price)
    for (const [threshold, multiplier] of milestones) {
      if (purchased >= threshold) cost *= multiplier;
    }

    // Ensure cost always increases by at least 1
    if (purchased > 0) {
      // Recursive call for simplicity to get prev cost, or just reuse logic
      // But let's avoid recursion for performance in loops
      let prevCost = baseCost;
      const prevPurchased = purchased - 1;
      if (prevPurchased <= rampUpThreshold) {
        prevCost *= Math.pow(baseGrowth, prevPurchased);
      } else {
        prevCost *= Math.pow(baseGrowth, rampUpThreshold);
        prevCost *= Math.pow(rampUpGrowth, prevPurchased - rampUpThreshold);
      }
      for (const [threshold, multiplier] of milestones) {
        if (prevPurchased >= threshold) prevCost *= multiplier;
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
