import { upgrades } from "../../src/scripts/Systems/upgrades.js";

describe("Upgrades Data Module", () => {
  // Mock game state for visibility tests
  let mockGameState;

  beforeEach(() => {
    // Reset mock state and purchased counts before each test
    mockGameState = {
      autoclickers: [
        { id: "ac_lurking_doro", purchased: 0 }, // Lurking Doro
      ],
      upgrades: upgrades, // Provide the actual upgrades array
      getTotalDPS: jest.fn().mockReturnValue(0),
    };
    upgrades.forEach((u) => (u.purchased = 0));
  });

  describe("Doro Power (id: upg_doro_power)", () => {
    const upgrade = upgrades.find((u) => u.id === "upg_doro_power");

    it("should have correct basic properties", () => {
      expect(upgrade.name).toBe("Doro Power");
      expect(upgrade.type).toBe("clickMultiplier");
      expect(upgrade.baseCost).toBe(10);
      expect(upgrade.value).toBe(1);
      expect(upgrade.costFunction).toBe("simpleExponential");
    });

    it("should calculate cost exponentially", () => {
      upgrade.purchased = 0;
      expect(upgrade.cost).toBe(10);
      upgrade.purchased = 1;
      expect(upgrade.cost).toBe(100);
      upgrade.purchased = 2;
      expect(upgrade.cost).toBe(1000);
    });

    it("should generate correct effect description", () => {
      upgrade.purchased = 3;
      const desc = upgrade.effectDescription(upgrade.value, upgrade.purchased);
      expect(desc).toContain("Increases Doros per click by 1");
      expect(desc).toContain("Currently increasing click power by 3");
    });
  });

  describe("Lurking Doro Upgrades (Strengthening)", () => {
    const upgrade1 = upgrades.find((u) => u.id === "upg_strength_ac_lurking_doro_10");
    const upgrade2 = upgrades.find((u) => u.id === "upg_strength_ac_lurking_doro_25");

    it("Upgrade I should have correct properties", () => {
      expect(upgrade1.name).toBe("Lurking Doro Upgrade I");
      expect(upgrade1.type).toBe("dpsMultiplier");
      expect(upgrade1.maxPurchases).toBe(1);
    });

    it("Upgrade II should have correct properties", () => {
      expect(upgrade2.name).toBe("Lurking Doro Upgrade II");
    });

    it("Upgrade I should be visible when Lurking Doro reaches level 10", () => {
      mockGameState.autoclickers[0].purchased = 9;
      expect(upgrade1.isVisible(mockGameState)).toBe(false);

      mockGameState.autoclickers[0].purchased = 10;
      expect(upgrade1.isVisible(mockGameState)).toBe(true);
    });

    it("Upgrade I should become invisible after being purchased", () => {
      mockGameState.autoclickers[0].purchased = 10;
      upgrade1.purchased = 1; // Max purchases reached
      expect(upgrade1.isVisible(mockGameState)).toBe(false);
    });
  });

  describe("Motivating Doro (id: upg_motivating_doro)", () => {
    const upgrade = upgrades.find((u) => u.id === "upg_motivating_doro");

    it("should generate correct effect description", () => {
      const desc = upgrade.effectDescription();
      expect(desc).toBe("Adds 10% to the total DPS of all Doros");
    });

    describe("visibility conditions", () => {
      it("should be visible with sufficient DPS", () => {
        mockGameState.getTotalDPS.mockReturnValue(500);
        expect(upgrade.isVisible(mockGameState)).toBe(true);
      });

      it("should not be visible after purchase", () => {
        mockGameState.getTotalDPS.mockReturnValue(1000);
        upgrade.purchased = 1;
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });
    });
  });

  // Test that all upgrades have required properties
  describe("All upgrades", () => {
    upgrades.forEach((upgrade) => {
      it(`${upgrade.name} should have all required properties`, () => {
        expect(upgrade).toHaveProperty("id");
        expect(upgrade).toHaveProperty("name");
        expect(upgrade).toHaveProperty("type");
        expect(upgrade).toHaveProperty("baseCost");
        expect(upgrade).toHaveProperty("cost");
        // Check that cost is a number (since it's a getter)
        expect(typeof upgrade.cost).toBe("number");
      });
    });
  });
});
