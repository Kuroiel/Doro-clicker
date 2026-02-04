import { CostCalculations } from "../../src/scripts/Systems/utils.js";

describe("CostCalculations", () => {
  describe("standardCost", () => {
    it("should calculate base cost for 0 purchased", () => {
      expect(CostCalculations.standardCost(10, 0)).toBe(10);
    });

    it("should apply growth factor", () => {
      // 10 * 1.1^1 = 11
      expect(CostCalculations.standardCost(10, 1)).toBe(11);
      // 10 * 1.1^2 = 12.1 -> 12
      expect(CostCalculations.standardCost(10, 2)).toBe(12);
    });

    it("should apply decade jumps", () => {
      // 10 purchased. decades = 1. factor = 1.7.
      // 10 * 1.1^10 * 1.7^1
      const base = 10 * Math.pow(1.1, 10);
      const expected = Math.round(base * 1.7);
      expect(CostCalculations.standardCost(10, 10)).toBe(expected);
    });

    it("should apply milestones", () => {
      const milestones = [[5, 2]]; // At 5 purchased, multiply by 2
      // 10 * 1.1^5 * 2
      const base = 10 * Math.pow(1.1, 5);
      const expected = Math.round(base * 2);
      expect(CostCalculations.standardCost(10, 5, 1.1, 1.7, milestones)).toBe(expected);
    });

    it("should always increase cost by at least 1", () => {
        // Growth 1.0 would mean no change, but logic forces +1
        expect(CostCalculations.standardCost(10, 1, 1.0)).toBe(11);
    });

    it("should handle invalid inputs", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(CostCalculations.standardCost(10, -1)).toBe(Infinity);
        expect(CostCalculations.standardCost(10, "invalid")).toBe(Infinity);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
  });

  describe("simpleExponential", () => {
    it("should calculate simple exponential cost", () => {
      expect(CostCalculations.simpleExponential(100, 0)).toBe(100);
      expect(CostCalculations.simpleExponential(100, 1, 10)).toBe(1000);
    });
  });

  describe("flatCost", () => {
    it("should return base cost regardless of purchased count", () => {
        expect(CostCalculations.flatCost(500)).toBe(500);
    });
  });
});
