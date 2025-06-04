// root/test/unit/GameMechanics.test.js

import { GameMechanics } from "../../src/scripts/Core/gamemechanics.js";

describe("GameMechanics", () => {
  // Mock game object with minimal required properties
  let mockGame;
  let mockAutoclickers;
  let mockUpgrades;
  let consoleWarn;
  let consoleError;

  beforeEach(() => {
    // Reset mocks before each test
    mockAutoclickers = [
      {
        id: 1,
        type: "autoclicker",
        purchased: 0,
        cost: 10,
        value: 1,
      },
      {
        id: 2, // Special case for dpsMultiplier
        type: "autoclicker",
        purchased: 0,
        cost: 25,
        value: 1,
        baseDPS: 1,
      },
    ];

    mockUpgrades = [
      {
        id: 3,
        type: "multiplier",
        purchased: 0,
        cost: 50,
        value: 2,
      },
      {
        id: 4,
        type: "dpsMultiplier",
        purchased: 0,
        cost: () =>
          100 * Math.pow(1.15, mockUpgrades.find((u) => u.id === 4).purchased),
        value: 1.15,
      },
    ];

    mockGame = {
      state: {
        manualClicks: 0,
        doros: 100, // Start with enough for most purchases
        increment: jest.fn(),
        notify: jest.fn(),
      },
      autoclickers: mockAutoclickers,
      upgrades: mockUpgrades,
      ui: {
        updateScoreDisplay: jest.fn(),
        _needsUpgradeRender: false,
        refreshAutoclickerButtons: jest.fn(),
      },
      autoclickerSystem: {
        _lastDPS: 0,
      },
    };
    // Store original implementations
    consoleWarn = console.warn;
    consoleError = console.error;

    // Mock all warnings/errors by default
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original implementations
    console.warn = consoleWarn;
    console.error = consoleError;
  });

  describe("constructor", () => {
    it("should initialize with default values", () => {
      const mechanics = new GameMechanics(mockGame);
      expect(mechanics.game).toBe(mockGame);
      expect(mechanics.clickMultiplier).toBe(1);
      expect(mechanics._processingPurchase).toBe(false);
      expect(mechanics._purchaseDebounce).toBe(false);
      expect(mechanics._clickLock).toBe(false);
    });
  });

  describe("handleClick", () => {
    let mechanics;

    beforeEach(() => {
      mechanics = new GameMechanics(mockGame);
    });

    it("should increment manual clicks and call increment with multiplier", () => {
      mechanics.handleClick();
      expect(mockGame.state.manualClicks).toBe(1);
      expect(mockGame.state.increment).toHaveBeenCalledWith(1);
      expect(mockGame.ui.updateScoreDisplay).toHaveBeenCalled();
    });

    it("should respect click lock to prevent double execution", () => {
      mechanics._clickLock = true;
      mechanics.handleClick();
      expect(mockGame.state.manualClicks).toBe(0); // Shouldn't increment
    });

    it("should always release click lock even if error occurs", () => {
      mockGame.state.increment.mockImplementation(() => {
        throw new Error("Test error");
      });
      expect(() => mechanics.handleClick()).toThrow("Test error");
      expect(mechanics._clickLock).toBe(false); // Lock should be released
    });
  });

  describe("purchaseUpgrade", () => {
    let mechanics;

    beforeEach(() => {
      jest.useFakeTimers();
      mechanics = new GameMechanics(mockGame);
      mockGame.state.doros = 1000;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should successfully purchase an autoclicker upgrade", () => {
      const autoclicker = mockAutoclickers[0];
      const initialDoros = mockGame.state.doros;

      const result = mechanics.purchaseUpgrade(1);

      expect(result).toBe(true);
      expect(autoclicker.purchased).toBe(1);
      expect(mockGame.state.doros).toBe(initialDoros - autoclicker.cost);

      // Advance timers to execute the requestAnimationFrame callback
      jest.runAllTimers();

      expect(mockGame.ui.refreshAutoclickerButtons).toHaveBeenCalled();
      expect(mockGame.state.notify).toHaveBeenCalled();
    });

    it("should successfully purchase a multiplier upgrade", () => {
      const upgrade = mockUpgrades[0];
      const initialDoros = mockGame.state.doros;

      const result = mechanics.purchaseUpgrade(3);

      expect(result).toBe(true);
      expect(upgrade.purchased).toBe(1);
      expect(mockGame.state.doros).toBe(initialDoros - upgrade.cost);
      expect(mechanics.clickMultiplier).toBe(3); // 1 + 2
      expect(mockGame.ui._needsUpgradeRender).toBeTruthy();
    });

    it("should successfully purchase an upgrade with dynamic cost", () => {
      const upgrade = mockUpgrades[1];
      const initialCost = upgrade.cost();

      const result = mechanics.purchaseUpgrade(4);

      expect(result).toBe(true);
      expect(upgrade.purchased).toBe(1);
      expect(mockGame.state.doros).toBe(1000 - initialCost);
    });

    it("should return false when upgrade not found", () => {
      const result = mechanics.purchaseUpgrade(999);
      expect(result).toBe(false);
    });

    it("should return false when cannot afford upgrade", () => {
      mockGame.state.doros = 1; // Not enough
      const result = mechanics.purchaseUpgrade(3);
      expect(result).toBe(false);
    });

    it("should prevent concurrent purchases", () => {
      mechanics._processingPurchase = true;
      const result = mechanics.purchaseUpgrade(1);
      expect(result).toBe(false);
    });

    it("should handle purchase errors gracefully", () => {
      // Force an error in cost calculation
      mockUpgrades[0].cost = () => {
        throw new Error("Cost calc error");
      };
      const result = mechanics.purchaseUpgrade(3);
      expect(result).toBe(false);
      expect(mechanics._processingPurchase).toBe(false); // Should be reset
    });

    it("should warn when upgrade not found", () => {
      mechanics.purchaseUpgrade(999);
      expect(console.warn).toHaveBeenCalledWith("Upgrade 999 not found");
    });

    it("should handle cost calculation errors", () => {
      mockUpgrades[0].cost = () => {
        throw new Error("Cost calc error");
      };
      mechanics.purchaseUpgrade(3);
      expect(console.error).toHaveBeenCalledWith(
        "Error in canAfford:",
        expect.any(Error)
      );
    });
  });

  describe("applyUpgrade", () => {
    let mechanics;

    beforeEach(() => {
      mechanics = new GameMechanics(mockGame);
    });

    it("should apply multiplier upgrade correctly", () => {
      const upgrade = { type: "multiplier", value: 2, purchased: 1 };
      mechanics.applyUpgrade(upgrade);
      expect(mechanics.clickMultiplier).toBe(3); // 1 + 2
    });

    it("should reset DPS cache for autoclicker upgrade", () => {
      const upgrade = { type: "autoclicker", id: 1 };
      mechanics.applyUpgrade(upgrade);
      expect(mockGame.autoclickerSystem._lastDPS).toBe(0);
    });

    it("should update DPS for special autoclicker with dpsMultiplier", () => {
      const upgrade = {
        type: "dpsMultiplier",
        value: 1.15,
        purchased: 1,
      };
      const lurkingDoro = mockAutoclickers[1];
      lurkingDoro.value = 1; // Reset to base

      mechanics.applyUpgrade(upgrade);

      expect(lurkingDoro.value).toBe(1 * Math.pow(1.15, 1));
    });

    it("should ignore unknown upgrade types", () => {
      const initialMultiplier = mechanics.clickMultiplier;
      const upgrade = { type: "unknown", value: 100 };
      mechanics.applyUpgrade(upgrade);
      expect(mechanics.clickMultiplier).toBe(initialMultiplier);
    });
  });

  describe("canAfford", () => {
    let mechanics;

    beforeEach(() => {
      mechanics = new GameMechanics(mockGame);
      mockGame.state.doros = 100;
    });

    it("should return true when can afford fixed cost", () => {
      const upgrade = { cost: 50 };
      expect(mechanics.canAfford(upgrade)).toBe(true);
    });

    it("should return false when cannot afford fixed cost", () => {
      const upgrade = { cost: 150 };
      expect(mechanics.canAfford(upgrade)).toBe(false);
    });

    it("should handle dynamic cost functions", () => {
      const upgrade = { cost: () => 75 };
      expect(mechanics.canAfford(upgrade)).toBe(true);
    });

    it("should return false for NaN costs", () => {
      const upgrade = { cost: () => NaN };
      expect(mechanics.canAfford(upgrade)).toBe(false);
    });

    it("should handle cost calculation errors", () => {
      const upgrade = {
        cost: () => {
          throw new Error("Test error");
        },
        id: "test", // For error message
      };
      expect(mechanics.canAfford(upgrade)).toBe(false);
    });
  });

  describe("debouncePurchase", () => {
    let mechanics;

    beforeEach(() => {
      jest.useFakeTimers();
      mechanics = new GameMechanics(mockGame);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce purchase calls", () => {
      mechanics.purchaseUpgrade = jest.fn();

      // First call
      mechanics.debouncePurchase(1);
      expect(mechanics._purchaseDebounce).toBe(true);
      expect(mechanics.purchaseUpgrade).not.toHaveBeenCalled();

      // Second call while debouncing
      mechanics.debouncePurchase(1);
      expect(mechanics.purchaseUpgrade).not.toHaveBeenCalled();

      // After timer
      jest.advanceTimersByTime(50);
      expect(mechanics.purchaseUpgrade).toHaveBeenCalledWith(1);
      expect(mechanics._purchaseDebounce).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should have no-op cleanup method", () => {
      const mechanics = new GameMechanics(mockGame);
      expect(() => mechanics.cleanup()).not.toThrow();
    });
  });
});
