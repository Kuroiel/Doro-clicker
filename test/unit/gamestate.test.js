import { GameState } from "../../src/scripts/Core/gameState.js";

describe("GameState", () => {
  let gameState;
  let originalConsoleError;
  let originalConsoleWarn;

  // Helper function to create mock autoclickers
  const createMockAutoclickers = (count, value) => {
    return Array(count)
      .fill()
      .map(() => ({
        value: value,
        purchased: 1,
      }));
  };

  beforeEach(() => {
    // Store original console functions
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    // Mock all console output by default
    console.error = jest.fn();
    console.warn = jest.fn();
    gameState = new GameState();
  });

  afterEach(() => {
    // Restore original console functions
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.totalDoros).toBe(0);
      expect(gameState.globalDpsMultiplier).toBe(1);
      expect(gameState._lastNotifiedDoros).toBe(0);
      expect(gameState._autoclickers).toEqual([]);
    });
  });

  describe("increment()", () => {
    it("should increase doros and totalDoros by default amount (1)", () => {
      gameState.increment();
      expect(gameState.doros).toBe(1);
      expect(gameState.totalDoros).toBe(1);
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should increase doros and totalDoros by specified amount", () => {
      gameState.increment(5);
      expect(gameState.doros).toBe(5);
      expect(gameState.totalDoros).toBe(5);
    });

    it("should handle multiple increments correctly", () => {
      gameState.increment(2);
      gameState.increment(3);
      expect(gameState.doros).toBe(5);
      expect(gameState.totalDoros).toBe(5);
    });

    it("should not increment with invalid amounts", () => {
      const originalDoros = gameState.doros;

      gameState.increment(0);
      gameState.increment(-1);
      gameState.increment("invalid");
      gameState.increment(NaN);

      expect(gameState.doros).toBe(originalDoros);
      expect(console.error).toHaveBeenCalledTimes(4);
    });

    it("should reject NaN values specifically", () => {
      const originalDoros = gameState.doros;
      gameState.increment(NaN);
      expect(gameState.doros).toBe(originalDoros);
      expect(console.error).toHaveBeenCalledWith(
        "Invalid increment amount:",
        NaN
      );
    });
  });

  describe("addAutoDoros()", () => {
    it("should add DPS amount to doros and autoDoros totals", () => {
      gameState.addAutoDoros(1.5);
      expect(gameState.doros).toBe(1.5);
      expect(gameState.totalAutoDoros).toBe(1.5);
      expect(gameState.totalDoros).toBe(1.5);
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should handle floating point precision correctly", () => {
      gameState.addAutoDoros(0.1 + 0.2);
      expect(gameState.doros).toBeCloseTo(0.3);
      expect(gameState.totalAutoDoros).toBeCloseTo(0.3);
    });

    it("should round to 2 decimal places", () => {
      gameState.addAutoDoros(1.23456);
      expect(gameState.doros).toBe(1.23);
    });

    it("should not add with invalid DPS amounts", () => {
      const originalDoros = gameState.doros;

      gameState.addAutoDoros(0);
      gameState.addAutoDoros(-1);
      gameState.addAutoDoros("invalid");
      gameState.addAutoDoros(NaN);

      expect(gameState.doros).toBe(originalDoros);
      expect(console.error).toHaveBeenCalledTimes(4);
    });
  });

  describe("Listener System", () => {
    it("should register and notify listeners", () => {
      const mockListener = jest.fn();
      gameState.addListener(mockListener);

      gameState.increment();
      expect(mockListener).toHaveBeenCalledTimes(1);

      gameState.addAutoDoros(1);
      expect(mockListener).toHaveBeenCalledTimes(2);
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = () => {
        throw new Error("Test error");
      };
      const goodListener = jest.fn();

      gameState.addListener(errorListener);
      gameState.addListener(goodListener);

      gameState.increment();

      expect(goodListener).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "State listener error:",
        expect.any(Error)
      );
    });

    it("should not notify if doros value has not changed", () => {
      const mockListener = jest.fn();
      gameState.addListener(mockListener);

      gameState.increment(0); // Invalid, doesn't change value
      expect(mockListener).not.toHaveBeenCalled();

      gameState.increment(1);
      expect(mockListener).toHaveBeenCalledTimes(1);

      gameState._lastNotifiedDoros = gameState.doros;
      gameState.increment(0); // Invalid, doesn't change value
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Autoclicker Management", () => {
    it("should set autoclickers correctly", () => {
      const mockAutoclickers = createMockAutoclickers(3, 1);
      gameState.setAutoclickers(mockAutoclickers);
      expect(gameState._autoclickers).toEqual(mockAutoclickers);
    });

    it("should calculate total DPS correctly", () => {
      const mockAutoclickers = [
        { value: 1, purchased: 2 },
        { value: 2, purchased: 3 },
      ];
      gameState.setAutoclickers(mockAutoclickers);

      // (1*2 + 2*3) * 1 (global multiplier)
      expect(gameState.getTotalDPS()).toBe(8);
    });

    it("should apply global DPS multiplier correctly", () => {
      const mockAutoclickers = createMockAutoclickers(2, 1);
      gameState.setAutoclickers(mockAutoclickers);

      gameState.applyGlobalDpsMultiplier(2);
      expect(gameState.getTotalDPS()).toBe(4);

      gameState.applyGlobalDpsMultiplier(0.5);
      expect(gameState.getTotalDPS()).toBe(2);
    });

    it("should return 0 DPS with no autoclickers", () => {
      expect(gameState.getTotalDPS()).toBe(0);
      gameState.setAutoclickers([]);
      expect(gameState.getTotalDPS()).toBe(0);
    });

    it("should handle invalid autoclicker objects gracefully", () => {
      gameState.setAutoclickers([
        { value: "invalid", purchased: 1 },
        null,
        undefined,
        { value: 1, purchased: "invalid" },
      ]);

      expect(gameState.getTotalDPS()).toBe(0);
    });
  });

  describe("Serialization", () => {
    it("should serialize game state correctly", () => {
      gameState.increment(5);
      gameState.addAutoDoros(3);
      gameState.applyGlobalDpsMultiplier(2);

      const serialized = gameState.serialize();

      expect(serialized).toEqual({
        doros: 8,
        manualClicks: 0,
        totalAutoDoros: 3,
        totalDoros: 8,
        globalDpsMultiplier: 2,
        lastSaved: expect.any(Number),
      });

      expect(serialized.lastSaved).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it("should deserialize game state correctly", () => {
      const testData = {
        doros: 10,
        manualClicks: 5,
        totalAutoDoros: 7,
        totalDoros: 12,
        globalDpsMultiplier: 1.5,
        lastSaved: Date.now(),
      };

      gameState.deserialize(testData);

      expect(gameState.doros).toBe(10);
      expect(gameState.manualClicks).toBe(5);
      expect(gameState.totalAutoDoros).toBe(7);
      expect(gameState.totalDoros).toBe(12);
      expect(gameState.globalDpsMultiplier).toBe(1.5);
    });

    it("should handle incomplete or invalid deserialization data", () => {
      const originalState = gameState.serialize();

      // Test with various invalid inputs
      gameState.deserialize(null);
      gameState.deserialize(undefined);
      gameState.deserialize({});
      gameState.deserialize("invalid");

      // State should remain unchanged or set to defaults
      expect(gameState.doros).toBe(0);
      expect(gameState.globalDpsMultiplier).toBe(1);
    });
  });

  describe("reset()", () => {
    it("should reset all game state to initial values", () => {
      // Modify state
      gameState.increment(10);
      gameState.addAutoDoros(5);
      gameState.applyGlobalDpsMultiplier(2);

      // Reset and verify
      gameState.reset();

      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.totalDoros).toBe(0);
      expect(gameState.globalDpsMultiplier).toBe(1);
    });

    it("should notify listeners after reset", () => {
      const mockListener = jest.fn();
      gameState.addListener(mockListener);

      gameState.reset();
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Extreme Value Handling", () => {
    it("should handle very large numbers correctly", () => {
      const largeNumber = Number.MAX_SAFE_INTEGER / 2;
      gameState.increment(largeNumber);
      gameState.addAutoDoros(largeNumber);
      expect(gameState.doros).toBe(largeNumber * 2);
    });

    it("should treat very small decimal numbers as 0", () => {
      const tinyNumber = 0.0000001;
      gameState.addAutoDoros(tinyNumber);
      expect(gameState.doros).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
    });

    it("should properly round numbers above threshold", () => {
      gameState.addAutoDoros(0.005); // Boundary case
      expect(gameState.doros).toBe(0.01); // Rounds up

      gameState.addAutoDoros(0.004); // Below threshold
      expect(gameState.doros).toBe(0.01);
    });
  });

  describe("Precision Accumulation", () => {
    it("should maintain precision with many small additions", () => {
      const iterations = 1000;
      const smallValue = 0.01;

      for (let i = 0; i < iterations; i++) {
        gameState.addAutoDoros(smallValue);
      }

      expect(gameState.doros).toBeCloseTo(iterations * smallValue, 2);
      expect(gameState.totalAutoDoros).toBeCloseTo(iterations * smallValue, 2);
    });
  });

  describe("Autoclicker Edge Cases", () => {
    it("should handle autoclickers with zero value", () => {
      gameState.setAutoclickers([
        { value: 0, purchased: 10 },
        { value: 1, purchased: 2 },
      ]);
      expect(gameState.getTotalDPS()).toBe(2); // Only the second clicker contributes
    });

    it("should handle autoclickers with zero purchased", () => {
      gameState.setAutoclickers([
        { value: 1, purchased: 0 },
        { value: 2, purchased: 3 },
      ]);
      expect(gameState.getTotalDPS()).toBe(6); // Only the second clicker contributes
    });

    it("should handle very large autoclicker values", () => {
      const largeValue = Number.MAX_SAFE_INTEGER;
      gameState.setAutoclickers([{ value: largeValue, purchased: 1 }]);
      expect(gameState.getTotalDPS()).toBe(largeValue);
    });
  });

  describe("Global Multiplier Edge Cases", () => {
    beforeEach(() => {
      gameState.setAutoclickers(createMockAutoclickers(2, 1));
    });

    it("should handle zero multiplier", () => {
      gameState.applyGlobalDpsMultiplier(0);
      expect(gameState.getTotalDPS()).toBe(0);
    });

    it("should handle negative multiplier", () => {
      gameState.applyGlobalDpsMultiplier(-1);
      expect(gameState.getTotalDPS()).toBe(-2);
    });

    it("should handle decimal multipliers", () => {
      gameState.applyGlobalDpsMultiplier(0.333);
      expect(gameState.getTotalDPS()).toBeCloseTo(0.666, 3);
    });
  });

  describe("Consecutive Operations", () => {
    it("should handle consecutive operations correctly", () => {
      // Initial manual clicks (5 + 3)
      gameState.increment(5);
      gameState.increment(3);

      // Set up autoclickers (2 @ 1 DPS + 1 @ 2 DPS)
      gameState.setAutoclickers([
        { value: 1, purchased: 2 },
        { value: 2, purchased: 1 },
      ]);

      // Add auto doros (full DPS)
      const initialDPS = gameState.getTotalDPS(); // 4 (1*2 + 2*1)
      gameState.addAutoDoros(initialDPS);

      // Add half DPS
      gameState.addAutoDoros(initialDPS * 0.5);

      // Apply multiplier (1.5x)
      gameState.applyGlobalDpsMultiplier(1.5);

      // Add final auto doros (should use multiplied DPS)
      const multipliedDPS = gameState.getTotalDPS(); // 4 * 1.5 = 6
      gameState.addAutoDoros(multipliedDPS);

      // Verify final state
      expect(gameState.doros).toBeCloseTo(
        8 + // manual (5+3)
          4 + // first auto
          2 + // half auto
          6, // final multiplied auto
        2
      );
    });
  });

  describe("Serialization Edge Cases", () => {
    it("should handle NaN values during deserialization", () => {
      gameState.deserialize({
        doros: NaN,
        manualClicks: NaN,
        totalAutoDoros: NaN,
        totalDoros: NaN,
        globalDpsMultiplier: NaN,
      });

      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.totalDoros).toBe(0);
      expect(gameState.globalDpsMultiplier).toBe(1);
    });

    it("should handle infinity values during deserialization", () => {
      gameState.deserialize({
        doros: Infinity,
        totalAutoDoros: -Infinity,
        globalDpsMultiplier: Infinity,
      });

      expect(gameState.doros).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.globalDpsMultiplier).toBe(1);
    });

    it("should handle non-number values", () => {
      gameState.deserialize({
        doros: "100",
        manualClicks: null,
        totalAutoDoros: undefined,
      });
      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of autoclickers efficiently", () => {
      const largeAutoclickers = Array(10000)
        .fill()
        .map((_, i) => ({
          value: i % 10,
          purchased: (i % 5) + 1,
        }));

      const startTime = performance.now();
      gameState.setAutoclickers(largeAutoclickers);
      const dps = gameState.getTotalDPS();
      const duration = performance.now() - startTime;

      expect(dps).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it("should handle rapid state changes efficiently", () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        gameState.increment(1);
        gameState.addAutoDoros(0.5);
      }

      const duration = performance.now() - startTime;
      expect(gameState.doros).toBe(iterations * 1.5);
      expect(duration).toBeLessThan(50); // Should complete in <50ms
    });
  });
});
