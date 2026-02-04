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
    
    // Mock window.doroGame
    // Ensure window exists (it should in jsdom environment)
    if (typeof window !== 'undefined') {
        window.doroGame = {
            modifierSystem: {
                getMultiplier: jest.fn().mockImplementation(() => {
                    console.log("Mock getMultiplier called");
                    return 1;
                })
            }
        };
    } else {
        console.error("Window is undefined in test setup!");
    }
    
    // Fallback to global if window mismatch
    global.doroGame = window.doroGame;

    gameState = new GameState();
  });

  afterEach(() => {
    // Restore original console functions
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    if (typeof window !== 'undefined') {
        delete window.doroGame;
    }
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.totalDoros).toBe(0);
      // Removed globalDpsMultiplier check as it is not a property anymore
      expect(gameState._lastNotifiedDoros).toBe(0);
      expect(gameState._autoclickers).toEqual([]);
    });
  });

  // ... (increment tests remain the same) ...

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
      
      // Mock global multiplier to 2
      window.doroGame.modifierSystem.getMultiplier = jest.fn().mockReturnValue(2);
      expect(gameState.getTotalDPS()).toBe(4);

      // Mock global multiplier to 0.5
      window.doroGame.modifierSystem.getMultiplier = jest.fn().mockReturnValue(0.5);
      expect(gameState.getTotalDPS()).toBe(1);
    });
  // ...
  });
  
  describe("Serialization", () => {
    it("should serialize game state correctly", () => {
      gameState.increment(5);
      gameState.addAutoDoros(3);
      // Removed applyGlobalDpsMultiplier(2)

      const serialized = gameState.serialize();

      expect(serialized).toEqual({
        doros: 8,
        manualClicks: 0,
        totalAutoDoros: 3,
        totalDoros: 8,
        // Removed globalDpsMultiplier
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
        globalDpsMultiplier: 1.5, // Even if present in save, it might be ignored or handled differently
        lastSaved: Date.now(),
      };

      gameState.deserialize(testData);

      expect(gameState.doros).toBe(10);
      expect(gameState.manualClicks).toBe(5);
      expect(gameState.totalAutoDoros).toBe(7);
      expect(gameState.totalDoros).toBe(12);
      // expect(gameState.globalDpsMultiplier).toBe(1.5); // Removed check
    });

    // ...
  });
  
  describe("reset()", () => {
    it("should reset all game state to initial values", () => {
      // Modify state
      gameState.increment(10);
      gameState.addAutoDoros(5);
      
      // Reset and verify
      gameState.reset();

      expect(gameState.doros).toBe(0);
      expect(gameState.manualClicks).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      expect(gameState.totalDoros).toBe(0);
      // expect(gameState.globalDpsMultiplier).toBe(1); // Removed check
    });
    // ...
  });

  describe("Global Multiplier Edge Cases", () => {
    beforeEach(() => {
      gameState.setAutoclickers(createMockAutoclickers(2, 1));
    });

    it("should handle zero multiplier", () => {
      window.doroGame.modifierSystem.getMultiplier.mockReturnValue(0);
      expect(gameState.getTotalDPS()).toBe(0);
    });

    it("should handle negative multiplier", () => {
       window.doroGame.modifierSystem.getMultiplier.mockReturnValue(-1);
       // Total base = 2 * 1 = 2. With -1, should be -2
      expect(gameState.getTotalDPS()).toBe(-2);
    });

    it("should handle decimal multipliers", () => {
      window.doroGame.modifierSystem.getMultiplier.mockReturnValue(0.333);
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
      // Initial DPS = 4, modifier 1
      window.doroGame.modifierSystem.getMultiplier.mockReturnValue(1);
      const initialDPS = gameState.getTotalDPS(); // 4
      gameState.addAutoDoros(initialDPS);

      // Add half DPS
      gameState.addAutoDoros(initialDPS * 0.5); // 2

      // "Apply multiplier" - simulate change in system
      window.doroGame.modifierSystem.getMultiplier.mockReturnValue(1.5);

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
      // expect(gameState.globalDpsMultiplier).toBe(1); // Removed
    });
    
    it("should handle infinity values during deserialization", () => {
      gameState.deserialize({
        doros: Infinity,
        totalAutoDoros: -Infinity,
        globalDpsMultiplier: Infinity,
      });

      expect(gameState.doros).toBe(0);
      expect(gameState.totalAutoDoros).toBe(0);
      // expect(gameState.globalDpsMultiplier).toBe(1); // Removed
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
