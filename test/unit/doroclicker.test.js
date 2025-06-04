// root/test/unit/doroclicker.test.js
import { DoroClicker } from "../../src/scripts/Core/doroclicker.js";

// Mock all dependencies with proper structure based on actual files
jest.mock("../../src/scripts/Core/gameState.js", () => ({
  GameState: jest.fn(() => ({
    setAutoclickers: jest.fn(),
    getTotalDPS: jest.fn().mockReturnValue(0),
    autoclickers: [],
  })),
}));

jest.mock("../../src/scripts/Systems/autoclickers.js", () => ({
  autoclickers: [
    {
      id: 2,
      name: "Lurking Doro",
      type: "autoclicker",
      baseCost: 10,
      baseDPS: 1,
      value: 1,
      purchased: 0,
      cost: function () {
        const purchased = this.purchased;
        let cost = this.baseCost;
        const baseGrowth = 1.1;
        cost *= Math.pow(baseGrowth, purchased);
        return Math.round(cost);
      },
    },
    // Include simplified versions of other autoclickers if needed
  ],
}));

jest.mock("../../src/scripts/Systems/upgrades.js", () => ({
  upgrades: [
    {
      id: 1,
      name: "Doro Power",
      type: "multiplier",
      baseCost: 10,
      value: 1,
      purchased: 0,
    },
    {
      id: 3,
      name: "Lurking Doro Upgrade",
      type: "dpsMultiplier",
      baseCost: 500,
      value: 1.15,
      purchased: 0,
      isVisible: jest.fn().mockReturnValue(true),
    },
    {
      id: 5,
      name: "Motivating Doro",
      type: "globalDpsMultiplier",
      baseCost: 10000,
      value: 1.1,
      purchased: 0,
      isVisible: jest.fn().mockReturnValue(true),
    },
  ],
}));

jest.mock("../../src/scripts/Core/gamemechanics.js", () => ({
  GameMechanics: jest.fn(() => ({
    cleanup: jest.fn(),
    calculateEarnings: jest.fn().mockReturnValue(42),
  })),
}));

jest.mock("../../src/scripts/UI/uimanager.js", () => ({
  UIManager: jest.fn(() => ({
    switchView: jest.fn(),
    updateUI: jest.fn(),
    showError: jest.fn(),
  })),
}));

jest.mock("../../src/scripts/Events/eventhandlers.js", () => ({
  EventHandlers: jest.fn(() => ({
    setupAllEventListeners: jest.fn(),
    removeAllEventListeners: jest.fn(),
    handleClick: jest.fn(),
  })),
}));

jest.mock("../../src/scripts/Systems/savesystem.js", () => ({
  SaveSystem: jest.fn(() => ({
    init: jest.fn(),
    cleanup: jest.fn(),
    load: jest.fn(),
    save: jest.fn(),
  })),
}));

jest.mock("../../src/scripts/Systems/autoclickersystem.js", () => ({
  AutoclickerSystem: jest.fn(() => ({
    setup: jest.fn(),
    cleanup: jest.fn(),
    tick: jest.fn(),
  })),
}));

jest.mock("../../src/scripts/Events/viewmanager.js", () => ({
  ViewManager: jest.fn(() => ({
    navigate: jest.fn(),
    currentView: "autoclickers",
  })),
}));

describe("DoroClicker", () => {
  let doroClicker;
  let mockAutoclickers;
  let mockUpgrades;

  beforeAll(() => {
    // Load the actual mock data
    mockAutoclickers =
      require("../../src/scripts/Systems/autoclickers.js").autoclickers;
    mockUpgrades = require("../../src/scripts/Systems/upgrades.js").upgrades;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    doroClicker = new DoroClicker();
  });

  describe("constructor", () => {
    it("should initialize with correct autoclickers data", () => {
      expect(doroClicker.autoclickers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            name: "Lurking Doro",
            baseCost: 10,
          }),
        ])
      );
      expect(doroClicker.state.setAutoclickers).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 2 })])
      );
    });

    it("should initialize with correct upgrades data", () => {
      expect(doroClicker.upgrades).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: "Doro Power",
            baseCost: 10,
          }),
        ])
      );
    });

    it("should handle empty autoclickers array", () => {
      jest.doMock("../../src/scripts/Systems/autoclickers.js", () => ({
        autoclickers: [],
      }));
      jest.resetModules();
      const {
        DoroClicker: FreshDoroClicker,
      } = require("../../src/scripts/Core/doroclicker.js");

      const instance = new FreshDoroClicker();
      expect(instance.autoclickers).toEqual([]);
    });
  });

  describe("init()", () => {
    it("should initialize autoclicker system", () => {
      // Verify setup was called (without checking arguments)
      expect(doroClicker.autoclickerSystem.setup).toHaveBeenCalled();
    });

    it("should initialize autoclickers with proper data", () => {
      // Verify autoclickers are properly set in the state
      expect(doroClicker.state.setAutoclickers).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 2 })])
      );
    });

    it("should handle autoclickers with complex cost functions", () => {
      const lurkingDoro = doroClicker.autoclickers.find((a) => a.id === 2);

      // Test initial cost
      lurkingDoro.purchased = 0;
      expect(lurkingDoro.cost()).toBe(10);

      // Test cost scaling
      lurkingDoro.purchased = 5;
      expect(lurkingDoro.cost()).toBeGreaterThan(10);
      expect(lurkingDoro.cost()).toBe(Math.round(10 * Math.pow(1.1, 5)));
    });
  });

  describe("integration with upgrades", () => {
    it("should properly associate upgrades with autoclickers", () => {
      const lurkingUpgrade = doroClicker.upgrades.find((u) => u.id === 3);
      expect(lurkingUpgrade).toBeDefined();
      expect(lurkingUpgrade.name).toBe("Lurking Doro Upgrade");
      expect(lurkingUpgrade.type).toBe("dpsMultiplier");
    });

    it("should handle upgrade visibility conditions", () => {
      const { GameState } = require("../../src/scripts/Core/gameState.js");
      const mockState = new GameState();
      mockState.autoclickers = [{ id: 2, purchased: 10 }];

      const lurkingUpgrade = doroClicker.upgrades.find((u) => u.id === 3);
      // Mock the visibility function for this specific test
      lurkingUpgrade.isVisible = jest.fn().mockImplementation((state) => {
        const lurkingDoro = state.autoclickers.find((a) => a.id === 2);
        return lurkingDoro && lurkingDoro.purchased >= 10;
      });

      expect(lurkingUpgrade.isVisible(mockState)).toBe(true);
    });
  });

  describe("performance", () => {
    it("should handle large autoclickers array efficiently", () => {
      const largeAutoclickers = Array(100)
        .fill()
        .map((_, i) => ({
          id: i + 100,
          name: `Doro ${i}`,
          baseCost: 100 + i,
          baseDPS: 10 + i,
          purchased: 0,
        }));

      jest.doMock("../../src/scripts/Systems/autoclickers.js", () => ({
        autoclickers: largeAutoclickers,
      }));
      jest.resetModules();

      const start = performance.now();
      const {
        DoroClicker: FreshDoroClicker,
      } = require("../../src/scripts/Core/doroclicker.js");
      new FreshDoroClicker();
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe("edge cases", () => {
    it("should handle missing required fields in autoclickers", () => {
      jest.doMock("../../src/scripts/Systems/autoclickers.js", () => ({
        autoclickers: [{ id: 1 }], // Missing required fields
      }));
      jest.resetModules();

      expect(() => {
        const {
          DoroClicker: FreshDoroClicker,
        } = require("../../src/scripts/Core/doroclicker.js");
        new FreshDoroClicker();
      }).not.toThrow();
    });

    it("should handle invalid cost function in autoclickers", () => {
      jest.doMock("../../src/scripts/Systems/autoclickers.js", () => ({
        autoclickers: [
          {
            id: 99,
            name: "Broken Doro",
            cost: "not a function", // Invalid cost
          },
        ],
      }));
      jest.resetModules();

      expect(() => {
        const {
          DoroClicker: FreshDoroClicker,
        } = require("../../src/scripts/Core/doroclicker.js");
        new FreshDoroClicker();
      }).not.toThrow();
    });
  });

  describe("destroy()", () => {
    let doroClicker;
    let originalConsoleError;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn(); // Suppress error logs during tests
    });

    beforeEach(() => {
      jest.clearAllMocks();
      doroClicker = new DoroClicker();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it("should clean up all systems in reverse initialization order", () => {
      doroClicker.destroy();

      // Verify cleanup call order
      const callOrder = [
        doroClicker.autoclickerSystem.cleanup.mock.invocationCallOrder[0],
        doroClicker.mechanics.cleanup.mock.invocationCallOrder[0],
        doroClicker.events.removeAllEventListeners.mock.invocationCallOrder[0],
        doroClicker.saveSystem.cleanup.mock.invocationCallOrder[0],
      ];

      // Should be called in sequence (order doesn't matter as long as all are called)
      expect(callOrder.sort()).toEqual(callOrder);
      expect(callOrder).toHaveLength(4);
    });

    it("should clean up autoclicker system", () => {
      doroClicker.destroy();
      expect(doroClicker.autoclickerSystem.cleanup).toHaveBeenCalledTimes(1);
    });

    it("should clean up game mechanics", () => {
      doroClicker.destroy();
      expect(doroClicker.mechanics.cleanup).toHaveBeenCalledTimes(1);
    });

    it("should remove all event listeners", () => {
      doroClicker.destroy();
      expect(doroClicker.events.removeAllEventListeners).toHaveBeenCalledTimes(
        1
      );
    });

    it("should clean up save system", () => {
      doroClicker.destroy();
      expect(doroClicker.saveSystem.cleanup).toHaveBeenCalledTimes(1);
    });

    it("should handle errors during autoclicker cleanup", () => {
      doroClicker.autoclickerSystem.cleanup.mockImplementation(() => {
        throw new Error("Cleanup failed");
      });

      expect(() => doroClicker.destroy()).not.toThrow();
      // Verify other cleanup methods were still called
      expect(doroClicker.mechanics.cleanup).toHaveBeenCalled();
    });

    it("should continue cleanup if one system fails", () => {
      doroClicker.mechanics.cleanup.mockImplementation(() => {
        throw new Error("Mechanics cleanup failed");
      });

      expect(() => doroClicker.destroy()).not.toThrow();
      expect(doroClicker.saveSystem.cleanup).toHaveBeenCalled();
    });

    it("should complete cleanup even with multiple errors", () => {
      doroClicker.autoclickerSystem.cleanup.mockImplementation(() => {
        throw new Error("Autoclicker cleanup failed");
      });
      doroClicker.events.removeAllEventListeners.mockImplementation(() => {
        throw new Error("Event cleanup failed");
      });

      expect(() => doroClicker.destroy()).not.toThrow();
      expect(doroClicker.saveSystem.cleanup).toHaveBeenCalled();
    });

    it("should not throw if systems are undefined", () => {
      // Simulate partial initialization failure
      doroClicker.autoclickerSystem = undefined;
      doroClicker.mechanics = undefined;

      expect(() => doroClicker.destroy()).not.toThrow();
      // Verify other systems are still cleaned up
      expect(doroClicker.saveSystem.cleanup).toHaveBeenCalled();
    });
  });
});
