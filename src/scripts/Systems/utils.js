export const CostCalculations = {
  // price math
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

    // scaling stuff
    if (purchased <= rampUpThreshold) {
      cost *= Math.pow(baseGrowth, purchased);
    } else {
      // price goes up fast here
      cost *= Math.pow(baseGrowth, rampUpThreshold);
      cost *= Math.pow(rampUpGrowth, purchased - rampUpThreshold);
    }

    // big jumps
    for (const [threshold, multiplier] of milestones) {
      if (purchased >= threshold) cost *= multiplier;
    }

    // make sure it actually costs more
    if (purchased > 0) {
      // loop is better than recursion i guess
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

  // simple price math
  simpleExponential: (baseCost, purchased, growthRate = 10) => {
    return Math.round(baseCost * Math.pow(growthRate, purchased));
  },

  // fixed price
  flatCost: (baseCost) => baseCost,
};
