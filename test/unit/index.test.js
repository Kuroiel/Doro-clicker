// test/unit/index.test.js - Final Corrected and Robust Version

// We mock the dependency at the top level.
// This mock will be used by all tests in this file.
jest.mock("../../src/scripts/Core/doroclicker.js", () => ({
  DoroClicker: jest.fn(),
}));

// Mock console.error to keep test output clean.
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Game Initialization (index.js)", () => {
  beforeEach(() => {
    // Before each test, we clear any previous mock calls and reset the global state.
    jest.clearAllMocks();
    delete window.doroGame;
  });

  afterAll(() => {
    // Restore console after all tests are done.
    consoleErrorSpy.mockRestore();
  });

  it("should NOT initialize the game immediately upon script execution", () => {
    // Arrange: Reset modules to ensure we get a fresh, un-executed index.js
    jest.resetModules();
    // FIX: Explicitly set the readyState to 'loading' to test the deferred path.
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // Act: Run the script's code.
    require("../../src/scripts/index.js");
    const { DoroClicker } = require("../../src/scripts/Core/doroclicker.js");

    // Assert: The constructor should not have been called yet.
    expect(DoroClicker).not.toHaveBeenCalled();
  });

  it("should initialize the game immediately if the DOM is already ready", () => {
    // Arrange: Reset modules and set the readyState to 'complete'.
    jest.resetModules();
    Object.defineProperty(document, "readyState", {
      value: "complete",
      writable: true,
    });

    // Act: Run the script's code.
    require("../../src/scripts/index.js");
    const { DoroClicker } = require("../../src/scripts/Core/doroclicker.js");

    // Assert: The constructor should have been called immediately.
    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should initialize the game when DOMContentLoaded is dispatched", () => {
    // Arrange: Reset modules and set up the DOM state for a successful event.
    jest.resetModules();
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // Act I: Run the script to attach the event listener.
    require("../../src/scripts/index.js");
    const { DoroClicker } = require("../../src/scripts/Core/doroclicker.js");

    // Act II: Simulate the browser firing the event.
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert: The constructor should have been called exactly once.
    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should assign the new game instance to window.doroGame", () => {
    // Arrange
    jest.resetModules();
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });
    // Act I: Load the script to set up the listener.
    require("../../src/scripts/index.js");
    // Arrange II: Get the fresh mock and configure it.
    const { DoroClicker } = require("../../src/scripts/Core/doroclicker.js");
    const mockGameInstance = { id: "mock-game" };
    DoroClicker.mockReturnValue(mockGameInstance);

    // Act II: Trigger the listener.
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert
    expect(window.doroGame).toBe(mockGameInstance);
  });

  it("should NOT initialize the game if window.doroGame already exists", () => {
    // Arrange
    jest.resetModules();
    const { DoroClicker } = require("../../src/scripts/Core/doroclicker.js");
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });
    window.doroGame = { id: "existing-game" }; // Set the pre-existing condition.

    // Act
    require("../../src/scripts/index.js");
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert
    expect(DoroClicker).not.toHaveBeenCalled();
  });
});
