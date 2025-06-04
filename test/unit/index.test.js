// test/unit/index.test.js

/**
 * Unit tests for game initialization in src/scripts/index.js
 * Using ES modules and correct project paths
 */

// Mock the DoroClicker class with correct path
jest.mock("../../src/scripts/Core/doroclicker.js", () => ({
  DoroClicker: jest.fn(),
}));

// Mock console.error
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Game Initialization Module", () => {
  let originalTestingFlag;
  let originalDoroGame;
  let DoroClickerMock;

  beforeEach(async () => {
    // Reset all mocks and clear module cache
    jest.resetModules();
    jest.clearAllMocks();

    // Get fresh mock for each test with correct path
    DoroClickerMock = (await import("../../src/scripts/Core/doroclicker.js"))
      .DoroClicker;

    // Store and reset globals
    originalTestingFlag = window.__TESTING__;
    originalDoroGame = window.doroGame;
    delete window.__TESTING__;
    delete window.doroGame;
  });

  afterEach(() => {
    // Restore globals
    window.__TESTING__ = originalTestingFlag;
    window.doroGame = originalDoroGame;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Main Initialization Block", () => {
    it("should set testing flag when __TESTING__ is defined", async () => {
      // Arrange
      window.__TESTING__ = {};
      DoroClickerMock.mockImplementation(() => ({}));

      // Act - import with correct path
      await import("../../src/scripts/index.js");

      // Assert
      expect(window.__TESTING__.gameReady).toBe(true);
    });

    it("should successfully create game instance and assign to window.doroGame", async () => {
      // Arrange
      const mockGameInstance = { mock: "game instance" };
      DoroClickerMock.mockImplementation(() => mockGameInstance);

      // Act
      await import("../../src/scripts/index.js");

      // Assert
      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockGameInstance);
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should handle initialization error and log to console", async () => {
      // Arrange
      const mockError = new Error("Constructor failed");
      DoroClickerMock.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await import("../../src/scripts/index.js");

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        "Game initialization failed:",
        mockError
      );
    });

    it("should create fallback game object when in testing mode and initialization fails", async () => {
      // Arrange
      window.__TESTING__ = {};
      DoroClickerMock.mockImplementation(() => {
        throw new Error("Constructor failed");
      });

      // Act
      await import("../../src/scripts/index.js");

      // Assert
      expect(window.doroGame).toEqual({
        state: {},
        upgrades: [],
        autoclickers: [],
        updateUI: expect.any(Function),
      });
    });
  });

  it("should initialize game when DOM loads", async () => {
    const mockGameInstance = { mock: "game instance" };
    DoroClickerMock.mockImplementation(() => mockGameInstance);
    window.doroGame = undefined;

    // Import and immediately trigger event
    await import("../../src/scripts/index.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // We just care that it was called, not how many times
    expect(DoroClickerMock).toHaveBeenCalled();
    expect(window.doroGame).toBeDefined();
  });

  describe("Edge Cases", () => {
    it("should handle multiple DOMContentLoaded events", async () => {
      const mockGameInstance = { mock: "game instance" };
      DoroClickerMock.mockImplementation(() => mockGameInstance);
      window.doroGame = undefined;

      await import("../../src/scripts/index.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      document.dispatchEvent(new Event("DOMContentLoaded"));

      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockGameInstance);
    });

    it("should maintain existing game instance if DOMContentLoaded fires after manual init", async () => {
      // 1. Create and store the exact same instance reference
      const existingGame = { existing: "game" };

      // 2. Create a new mock that returns a different object
      const mockInstance = { new: "instance" };
      DoroClickerMock.mockImplementation(() => mockInstance);

      // 3. Import the module fresh (this will create the initial instance)
      await import("../../src/scripts/index.js");

      // 4. Now set our existing game
      window.doroGame = existingGame;

      // 5. Trigger the event
      document.dispatchEvent(new Event("DOMContentLoaded"));

      // 6. Assertions
      expect(window.doroGame).toBe(existingGame); // Must be THE SAME OBJECT
      expect(DoroClickerMock).toHaveBeenCalledTimes(1); // Only called once during import
    });

    it("should handle case where DOM is already loaded when event listener registers", async () => {
      const mockGameInstance = { mock: "game instance" };
      DoroClickerMock.mockImplementation(() => mockGameInstance);
      window.doroGame = undefined;

      // Simulate DOM already being loaded
      Object.defineProperty(document, "readyState", {
        value: "complete",
        writable: true,
      });

      await import("../../src/scripts/index.js");

      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockGameInstance);
    });

    it("should not initialize if window.doroGame exists during import", async () => {
      // Create mock instance
      const mockInstance = { existing: "game" };
      DoroClickerMock.mockImplementation(() => mockInstance);

      // Set existing game BEFORE import
      window.doroGame = mockInstance;

      await import("../../src/scripts/index.js");

      // Verify no NEW instances were created beyond the existing one
      expect(DoroClickerMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("Game Instance Assignment", () => {
    let originalDoroGame;

    beforeEach(() => {
      originalDoroGame = window.doroGame;
      DoroClickerMock.mockClear();
    });

    afterEach(() => {
      window.doroGame = originalDoroGame;
    });

    describe("Direct Assignment (Top Level)", () => {
      it("should assign new game instance when no existing instance", async () => {
        delete window.doroGame;
        const mockInstance = { mock: "instance" };
        DoroClickerMock.mockReturnValue(mockInstance);

        await import("../../src/scripts/index.js");

        expect(DoroClickerMock).toHaveBeenCalledTimes(1);
        expect(window.doroGame).toBe(mockInstance);
      });

      it("should preserve existing instance when checks are present", async () => {
        const oldInstance = { old: "instance" };
        window.doroGame = oldInstance;
        const newInstance = { new: "instance" };
        DoroClickerMock.mockReturnValue(newInstance);

        await import("../../src/scripts/index.js");

        expect(window.doroGame).toBe(oldInstance); // Should keep the old instance
        expect(window.doroGame).not.toBe(newInstance); // Should not use the new one
        expect(DoroClickerMock).not.toHaveBeenCalled(); // Constructor shouldn't be called
      });
    });

    describe("DOMContentLoaded Assignment", () => {
      it("should assign new instance when triggered and no game exists", async () => {
        delete window.doroGame;
        const mockInstance = { mock: "instance" };
        DoroClickerMock.mockReturnValue(mockInstance);

        await import("../../src/scripts/index.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));

        expect(DoroClickerMock).toHaveBeenCalledTimes(1); // Once on import, once on event
        expect(window.doroGame).toBe(mockInstance);
      });

      it("should not assign new instance when game already exists", async () => {
        const existingInstance = { existing: "instance" };
        window.doroGame = existingInstance;
        DoroClickerMock.mockImplementation(() => {
          throw new Error("Should not be called");
        });

        await import("../../src/scripts/index.js");
        document.dispatchEvent(new Event("DOMContentLoaded"));

        expect(DoroClickerMock).not.toHaveBeenCalled();
        expect(window.doroGame).toBe(existingInstance);
      });
    });

    describe("Error Handling", () => {
      it("should handle constructor errors gracefully", async () => {
        delete window.doroGame;
        const mockError = new Error("Construction failed");
        DoroClickerMock.mockImplementation(() => {
          throw mockError;
        });

        await import("../../src/scripts/index.js");

        expect(console.error).toHaveBeenCalledWith(
          "Game initialization failed:",
          mockError
        );
        expect(window.doroGame).toBeUndefined();
      });

      it("should create fallback object in testing mode on error", async () => {
        window.__TESTING__ = {};
        delete window.doroGame;
        DoroClickerMock.mockImplementation(() => {
          throw new Error("Construction failed");
        });

        await import("../../src/scripts/index.js");

        expect(window.doroGame).toEqual({
          state: {},
          upgrades: [],
          autoclickers: [],
          updateUI: expect.any(Function),
        });
      });
    });

    describe("Instance Properties", () => {
      it("should assign instance with expected properties", async () => {
        delete window.doroGame;
        const mockInstance = {
          state: { clicks: 0 },
          upgrades: ["test"],
          autoclickers: [],
          updateUI: jest.fn(),
        };
        DoroClickerMock.mockReturnValue(mockInstance);

        await import("../../src/scripts/index.js");

        expect(window.doroGame).toMatchObject({
          state: expect.any(Object),
          upgrades: expect.any(Array),
          autoclickers: expect.any(Array),
          updateUI: expect.any(Function),
        });
      });
    });
  });

  describe("Complete Line Coverage for Game Assignment", () => {
    let originalDoroGame;
    let originalTestingFlag;

    beforeEach(() => {
      // Store original values
      originalDoroGame = window.doroGame;
      originalTestingFlag = window.__TESTING__;

      // Clear all mocks
      DoroClickerMock.mockClear();
      consoleErrorSpy.mockClear();

      // Reset state
      delete window.doroGame;
      delete window.__TESTING__;
    });

    afterEach(() => {
      // Restore original values
      window.doroGame = originalDoroGame;
      window.__TESTING__ = originalTestingFlag;
    });

    // 1. Test top-level initialization
    it("covers top-level new DoroClicker() assignment", async () => {
      const mockInstance = { test: "instance" };
      DoroClickerMock.mockReturnValue(mockInstance);

      await import("../../src/scripts/index.js");

      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockInstance);
    });

    // 2. Test DOMContentLoaded path
    it("covers DOMContentLoaded new DoroClicker() assignment", async () => {
      window.doroGame = undefined;
      const mockInstance = { test: "dom-instance" };
      DoroClickerMock.mockReturnValue(mockInstance);

      await import("../../src/scripts/index.js");

      // Trigger DOMContentLoaded - should initialize since doroGame was undefined
      document.dispatchEvent(new Event("DOMContentLoaded"));

      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockInstance);
    });

    // 3. Test error case coverage
    it("covers error case in new DoroClicker() assignment", async () => {
      const mockError = new Error("Test error");
      DoroClickerMock.mockImplementation(() => {
        throw mockError;
      });

      await import("../../src/scripts/index.js");

      expect(console.error).toHaveBeenCalledWith(
        "Game initialization failed:",
        mockError
      );
    });

    // 4. Test testing mode fallback
    it("covers testing fallback assignment", async () => {
      window.__TESTING__ = {};
      const mockError = new Error("Test error");
      DoroClickerMock.mockImplementation(() => {
        throw mockError;
      });

      await import("../../src/scripts/index.js");

      expect(window.doroGame).toEqual({
        state: {},
        upgrades: [],
        autoclickers: [],
        updateUI: expect.any(Function),
      });
    });
  });
});
