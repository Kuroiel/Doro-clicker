import { Formatters } from "../../src/scripts/UI/formatters.js";

describe("Formatters", () => {
  let formatters;

  beforeEach(() => {
    formatters = new Formatters();
  });

  describe("formatNumber", () => {
    it("should handle invalid inputs gracefully", () => {
      expect(formatters.formatNumber(null)).toBe("0");
      expect(formatters.formatNumber(undefined)).toBe("0");
      expect(formatters.formatNumber(NaN)).toBe("0");
      expect(formatters.formatNumber("string")).toBe("0");
    });

    it("should format small integers correctly", () => {
      expect(formatters.formatNumber(123)).toBe("123");
      expect(formatters.formatNumber(0)).toBe("0");
    });

    it("should format large integers with commas", () => {
      expect(formatters.formatNumber(123456)).toBe("123,456");
      expect(formatters.formatNumber(1000)).toBe("1,000");
    });

    it("should format decimal numbers according to decimalPlaces", () => {
      expect(formatters.formatNumber(1.234, 2)).toBe("1.23");
      expect(formatters.formatNumber(1.236, 2)).toBe("1.24");
      expect(formatters.formatNumber(1.2, 2)).toBe("1.20");
    });

    it("should respecting roundDown option", () => {
      expect(formatters.formatNumber(1.9, 0, null, true)).toBe("1");
    });

    it("should switch to scientific notation above threshold", () => {
      // Default threshold is 1,000,000
      expect(formatters.formatNumber(999999)).toBe("999,999");
      expect(formatters.formatNumber(1000000)).toBe("1.00e+6");
    });

    it("should handle context-specific thresholds", () => {
      // DPS: 100,000
      expect(formatters.formatNumber(99999, 0, null, false, "dps")).toBe("99,999");
      expect(formatters.formatNumber(100000, 0, null, false, "dps")).toBe("1.00e+5");

      // Score: 1,000,000,000
      expect(formatters.formatNumber(1000000, 0, null, false, "score")).toBe("1,000,000");
      expect(formatters.formatNumber(1000000000, 0, null, false, "score")).toBe("1.00e+9");
    });
  });

  describe("formatUpgradeCost", () => {
    it("should format number costs", () => {
        expect(formatters.formatUpgradeCost(1000)).toBe("1,000");
    });

    it("should handle function costs (getters)", () => {
        const costFn = () => 5000;
        expect(formatters.formatUpgradeCost(costFn)).toBe("5,000");
    });

    it("should handle errors in cost function", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const errorFn = () => { throw new Error("test"); };
        expect(formatters.formatUpgradeCost(errorFn)).toBe("0");
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
  });
});
