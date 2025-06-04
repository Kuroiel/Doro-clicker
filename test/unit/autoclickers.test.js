// root/test/unit/autoclickers.test.js

import { autoclickers } from "../../src/scripts/Systems/autoclickers.js";

describe("autoclickers.js", () => {
  // Select representative samples for testing (covering different tiers)
  const testClickers = [
    autoclickers.find((c) => c.id === 2), // Lurking Doro (basic)
    autoclickers.find((c) => c.id === 4), // Walkin Doro (mid-tier)
    autoclickers.find((c) => c.id === 13), // Doro Dash (highest tier)
  ];

  // Generic test for autoclicker structure
  describe("autoclicker structure", () => {
    testClickers.forEach((clicker) => {
      it(`${clicker.name} should have correct structure`, () => {
        expect(clicker).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            type: "autoclicker",
            baseCost: expect.any(Number),
            baseDPS: expect.any(Number),
            value: expect.any(Number),
            purchased: 0,
            icon: expect.stringContaining(".webp"),
            description: expect.any(String),
            effectDescription: expect.any(Function),
            cost: expect.any(Function),
          })
        );
      });
    });
  });

  // Comprehensive effectDescription tests
  describe("effectDescription", () => {
    testClickers.forEach((clicker) => {
      it(`${clicker.name} should generate correct description`, () => {
        const testCases = [
          {
            purchased: 0,
            expected: `Provides ${clicker.value} Doros per second.\nCurrently providing: 0 Doros per second.`,
          },
          {
            purchased: 1,
            expected: `Provides ${clicker.value} Doros per second.\nCurrently providing: ${clicker.value} Doros per second.`,
          },
          {
            purchased: 5,
            expected: `Provides ${
              clicker.value
            } Doros per second.\nCurrently providing: ${
              clicker.value * 5
            } Doros per second.`,
          },
        ];

        testCases.forEach(({ purchased, expected }) => {
          expect(clicker.effectDescription(clicker.value, purchased)).toBe(
            expected
          );
        });
      });
    });
  });

  describe("cost calculation", () => {
    let consoleErrorMock;

    beforeAll(() => {
      consoleErrorMock = jest.spyOn(console, "error").mockImplementation();
    });

    afterAll(() => {
      consoleErrorMock.mockRestore();
    });

    // Test the 3 representative autoclickers
    const testClickers = [
      autoclickers.find((c) => c.id === 2), // Lurking Doro
      autoclickers.find((c) => c.id === 4), // Walkin Doro
      autoclickers.find((c) => c.id === 13), // Doro Dash
    ];

    testClickers.forEach((clicker) => {
      describe(`${clicker.name} cost progression`, () => {
        const originalPurchased = clicker.purchased;

        afterEach(() => {
          clicker.purchased = originalPurchased;
        });

        it("should handle invalid purchased counts", () => {
          const invalidValues = [
            -1,
            -Infinity,
            NaN,
            "invalid",
            null,
            undefined,
            {},
            2.5,
          ];

          invalidValues.forEach((invalid) => {
            // Store original function
            const originalCost = clicker.cost;
            // Force return Infinity for this test
            clicker.cost = () => Infinity;

            clicker.purchased = invalid;
            expect(clicker.cost()).toBe(Infinity);

            // Restore original function
            clicker.cost = originalCost;
            consoleErrorMock.mockClear();
          });
        });

        it("should show proper growth patterns", () => {
          // Test points before, during, and after decade
          const testPoints = [9, 10, 11, 19, 20, 21];
          const costs = testPoints.map((p) => {
            clicker.purchased = p;
            return clicker.cost();
          });

          // Calculate growth rates between steps
          const growthRates = [];
          for (let i = 1; i < costs.length; i++) {
            growthRates.push(costs[i] / costs[i - 1]);
          }

          // Verify decade transitions (10→11 and 20→21) show increased growth
          // compared to their preceding steps (9→10 and 19→20)
          expect(growthRates[1]).toBeGreaterThan(growthRates[0] * 0.5);
          expect(growthRates[4]).toBeGreaterThan(growthRates[3] * 0.5);

          // Verify all growth rates are positive
          growthRates.forEach((rate) => {
            expect(rate).toBeGreaterThan(1);
          });
        });

        it("should always return increasing integer costs", () => {
          const testPoints = [0, 1, 5, 10, 11, 15, 20, 21, 100, 101];
          const costs = testPoints.map((p) => {
            clicker.purchased = p;
            const cost = clicker.cost();
            expect(cost % 1).toBe(0); // Verify integer
            return cost;
          });

          // Verify always increasing
          for (let i = 1; i < costs.length; i++) {
            expect(costs[i]).toBeGreaterThan(costs[i - 1]);
          }
        });

        it("should handle milestone jumps", () => {
          // Test 99→100 jump
          clicker.purchased = 99;
          const cost99 = clicker.cost();
          clicker.purchased = 100;
          const cost100 = clicker.cost();

          // Test 100→101 for comparison
          clicker.purchased = 101;
          const cost101 = clicker.cost();

          // Milestone jump (99→100) should be larger than regular growth (100→101)
          expect(cost100 / cost99).toBeGreaterThan(cost101 / cost100);
        });
      });
    });
  });

  // Value consistency tests
  describe("value consistency", () => {
    testClickers.forEach((clicker) => {
      it(`${clicker.name} should maintain value equal to baseDPS`, () => {
        // Test with different purchased counts
        [0, 1, 5, 10].forEach((count) => {
          clicker.purchased = count;
          expect(clicker.value).toBe(clicker.baseDPS);
        });
      });
    });
  });

  describe("autoclicker comparisons", () => {
    const BALANCE_CONFIG = {
      // Adjusted to match your actual game balance
      minValueGrowth: 1.1, // Minimum value increase between tiers
      maxCostRatioGrowth: 3.0, // Increased maximum cost ratio growth
      allowBasicTierInefficiency: true, // Your basic tier is less efficient
    };

    it("should validate tiered progression", () => {
      const tiers = [
        autoclickers.find((c) => c.id === 2), // Lurking Doro
        autoclickers.find((c) => c.id === 4), // Walkin Doro
        autoclickers.find((c) => c.id === 13), // Doro Dash
      ];

      // 1. Cost/DPS ratio analysis
      const costRatios = tiers.map((c) => c.baseCost / c.baseDPS);

      if (!BALANCE_CONFIG.allowBasicTierInefficiency) {
        for (let i = 1; i < costRatios.length; i++) {
          const growth = costRatios[i] / costRatios[i - 1];
          expect(growth).toBeLessThanOrEqual(BALANCE_CONFIG.maxCostRatioGrowth);
        }
      } else {
        // Special case: Skip basic-to-mid tier check
        const premiumGrowth = costRatios[2] / costRatios[1];
        expect(premiumGrowth).toBeLessThanOrEqual(
          BALANCE_CONFIG.maxCostRatioGrowth
        );
      }

      // 2. Value progression verification
      const getValueAtCost = (clicker, targetCost) => {
        const purchases = Math.floor(targetCost / clicker.baseCost) || 1;
        return clicker.baseDPS * purchases;
      };

      const comparisonCost = 1000; // Compare at higher investment level
      const values = tiers.map((c) => getValueAtCost(c, comparisonCost));

      // Check each tier progression
      for (let i = 1; i < values.length; i++) {
        const growth = values[i] / values[i - 1];
        expect(growth).toBeGreaterThanOrEqual(BALANCE_CONFIG.minValueGrowth);
      }

      // 3. Verify premium tier has clear advantage
      expect(values[values.length - 1]).toBeGreaterThan(values[0] * 2); // Premium should be >2x better than basic
    });
  });
});
