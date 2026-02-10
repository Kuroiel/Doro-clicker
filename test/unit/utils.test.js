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

    it("should apply ramp up after threshold", () => {
      // base=10, growth=1.1, threshold=2. rampUpGrowth=1.2
      // p=0: 10
      // p=1: 10 * 1.1 = 11
      // p=2: 10 * 1.1^2 = 12.1 -> 12
      // p=3: 10 * 1.1^2 * 1.2^1 = 14.52 -> 15
      expect(CostCalculations.standardCost(10, 0, 1.1, [], 2, 1.2)).toBe(10);
      expect(CostCalculations.standardCost(10, 1, 1.1, [], 2, 1.2)).toBe(11);
      expect(CostCalculations.standardCost(10, 2, 1.1, [], 2, 1.2)).toBe(12);
      expect(CostCalculations.standardCost(10, 3, 1.1, [], 2, 1.2)).toBe(15);
    });

    it("should apply milestones as jumps", () => {
      // base=10, growth=1.0 (flat), milestones=[[2, 2]]
      // p=1: 10
      // p=2: 10 * 2 = 20
      expect(CostCalculations.standardCost(10, 1, 1.0, [[2, 2]], 10, 1.0)).toBe(11);
      expect(CostCalculations.standardCost(10, 2, 1.0, [[2, 2]], 10, 1.0)).toBe(20);
    });

    it("should always increase cost by at least 1", () => {
        // Growth 1.0 would mean no change, but logic forces +1
        expect(CostCalculations.standardCost(10, 1, 1.0, [], 10, 1.0)).toBe(11);
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
