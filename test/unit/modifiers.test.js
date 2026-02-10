import { ModifierSystem } from "../../src/scripts/Systems/modifiers.js";

describe("ModifierSystem", () => {
  let modifierSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      autoclickers: [],
      upgrades: [],
    };
    modifierSystem = new ModifierSystem(mockGame);
  });

  describe("addModifier", () => {
    it("should add a multiplicative modifier", () => {
      const mod = {
        target: "player",
        type: "click",
        action: "multiply",
        value: 2,
      };
      modifierSystem.addModifier(mod, 1);
      
      expect(modifierSystem.getMultiplier("player", "click")).toBe(2);
    });

    it("should add an additive modifier", () => {
      const mod = {
        target: "player",
        type: "click",
        action: "add",
        value: 5,
      };
      modifierSystem.addModifier(mod, 2); // 5 * 2 = 10
      
      expect(modifierSystem.getAdd("player", "click")).toBe(10);
    });

    it("should stack multiple multipliers correctly", () => {
        const mod = {
            target: "player",
            type: "click",
            action: "multiply",
            value: 2,
        };
        modifierSystem.addModifier(mod, 3); // 2^3 = 8
        expect(modifierSystem.getMultiplier("player", "click")).toBe(8);
    });

    it("should add an additive multiplier modifier", () => {
      const mod = {
        target: "test",
        type: "dps",
        action: "addMultiplier",
        value: 0.1,
      };
      modifierSystem.addModifier(mod, 2); // 1.0 + 0.1 * 2 = 1.2
      expect(modifierSystem.getMultiplier("test", "dps")).toBeCloseTo(1.2);
    });
  });

  describe("recalculate", () => {
    it("should recalculate modifiers from game items", () => {
      mockGame.autoclickers = [
        {
          id: 1,
          purchased: 2,
          modifiers: [
            { target: "global", type: "dps", action: "multiply", value: 1.1 },
          ],
        },
      ];
      mockGame.upgrades = [
        {
          id: 2,
          purchased: 1,
          modifiers: [
            { target: "player", type: "click", action: "add", value: 10 },
          ],
        },
      ];

      modifierSystem.recalculate();

      // Autoclicker: 1.1^2 = 1.21
      expect(modifierSystem.getMultiplier("global", "dps")).toBeCloseTo(1.21);
      
      // Upgrade: 10 * 1 = 10
      expect(modifierSystem.getAdd("player", "click")).toBe(10);
    });

    it("should clear old modifiers before recalculating", () => {
        // Manually add something
        modifierSystem.addModifier({target: "test", type: "test", action: "add", value: 1}, 1);
        expect(modifierSystem.getAdd("test", "test")).toBe(1);

        // Recalculate with empty game items
        modifierSystem.recalculate();
        expect(modifierSystem.getAdd("test", "test")).toBe(0);
    });
  });

  describe("apply", () => {
    it("should apply modifiers correctly to a base value", () => {
      // Add +10 and *2
      const addMod = { target: "test", type: "test", action: "add", value: 10 };
      const mulMod = { target: "test", type: "test", action: "multiply", value: 2 };

      modifierSystem.addModifier(addMod, 1);
      modifierSystem.addModifier(mulMod, 1);

      // (100 + 10) * 2 = 220
      expect(modifierSystem.apply(100, "test", "test")).toBe(220);
    });

    it("should return base value if no modifiers exist", () => {
        expect(modifierSystem.apply(100, "none", "none")).toBe(100);
    });
  });
});
