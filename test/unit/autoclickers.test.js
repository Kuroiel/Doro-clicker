import { autoclickers } from "../../src/scripts/Systems/autoclickers.js";
import { CostCalculations } from "../../src/scripts/Systems/utils.js";

describe("Autoclickers Data Module", () => {
  const testClickers = [
    autoclickers.find((c) => c.id === "ac_lurking_doro"),
    autoclickers.find((c) => c.id === "ac_walkin_doro"),
    autoclickers.find((c) => c.id === "ac_napping_siren_doro"),
  ];

  describe("Autoclicker Structure", () => {
    testClickers.forEach((clicker) => {
      it(`${clicker.name} should have correct structure`, () => {
        expect(clicker).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            type: "autoclicker",
            baseCost: expect.any(Number),
            baseDPS: expect.any(Number),
            purchased: 0,
            icon: expect.stringContaining(".webp"),
            description: expect.any(String),
          })
        );

        expect(typeof clicker.effectDescription).toBe("string");
        expect(typeof clicker.cost).toBe("number");
      });
    });
  });

  describe("effectDescription", () => {
    it("should generate a correct description string", () => {
      const clicker = autoclickers.find((c) => c.id === "ac_lurking_doro");
      clicker.purchased = 5;

      const desc = clicker.effectDescription;
      expect(desc).toContain(`Provides ${clicker.value.toFixed(1)} Doros per second.`);
      expect(desc).toContain(
        `Currently providing: ${(clicker.value * 5).toFixed(1)} Doros per second.`
      );
    });
  });

  describe("Cost Calculation", () => {
    const clicker = autoclickers.find((c) => c.id === "ac_lurking_doro");

    beforeEach(() => {
      clicker.purchased = 0; // Reset before each test
    });

    it("should return the base cost when zero are purchased", () => {
      clicker.purchased = 0;
      expect(clicker.cost).toBe(clicker.baseCost);
    });

    it("should return an increased cost when one is purchased", () => {
      clicker.purchased = 1;
      const expectedCost = CostCalculations.standardCost(
        clicker.baseCost,
        1,
        clicker.template.baseGrowth
      );
      expect(clicker.cost).toBe(expectedCost);
      expect(clicker.cost).toBeGreaterThan(clicker.baseCost);
    });

    it("should always return an increasing integer cost", () => {
      const testPoints = [0, 1, 5, 10, 11, 15, 20, 21, 100, 101];
      let lastCost = -1;

      testPoints.forEach((p) => {
        clicker.purchased = p;
        const currentCost = clicker.cost; // Access as getter
        expect(Number.isInteger(currentCost)).toBe(true);
        if (lastCost !== -1) {
          expect(currentCost).toBeGreaterThan(lastCost);
        }
        lastCost = currentCost;
      });
    });

    it("should handle milestone jumps correctly", () => {
      // Test 99 -> 100 jump where a milestone multiplier is applied
      clicker.purchased = 99;
      const cost99 = clicker.cost;
      clicker.purchased = 100;
      const cost100 = clicker.cost;

      // Test 100 -> 101 for comparison (no new milestone)
      clicker.purchased = 101;
      const cost101 = clicker.cost;

      const jumpGrowth = cost100 / cost99;
      const normalGrowth = cost101 / cost100;

      // The growth rate when hitting a milestone should be significantly larger
      expect(jumpGrowth).toBeGreaterThan(normalGrowth);
    });
  });
});
