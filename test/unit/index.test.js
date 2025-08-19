const mockDoroClickerConstructor = jest.fn();

jest.mock("../../src/scripts/Core/doroclicker.js", () => ({
  DoroClicker: mockDoroClickerConstructor,
}));

// Mock console.error to keep test output clean.
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Game Initialization (index.js)", () => {
  // This variable will hold our single, shared mock constructor.
  let DoroClicker;

  beforeEach(() => {
    // Before each test, reset modules to ensure a fresh, un-executed index.js.
    jest.resetModules();

    // Clear any previous calls from the singleton mock.
    mockDoroClickerConstructor.mockClear();

    // Import the mock *after* resetting modules. This is still good practice.
    // It will now correctly receive our singleton mock.
    DoroClicker = require("../../src/scripts/Core/doroclicker.js").DoroClicker;

    // Reset global state.
    delete window.doroGame;
  });

  afterAll(() => {
    // Restore console after all tests are done.
    consoleErrorSpy.mockRestore();
  });

  it("should NOT initialize the game immediately upon script execution if DOM is loading", () => {
    // Arrange: Set the readyState to 'loading'.
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // Act: Run the script's code. This will attach the listener.
    require("../../src/scripts/index.js");

    // Assert: The constructor should not have been called yet.
    expect(DoroClicker).not.toHaveBeenCalled();
  });

  it("should initialize the game immediately if the DOM is already ready", () => {
    // Arrange: Set the readyState to 'complete'.
    Object.defineProperty(document, "readyState", {
      value: "complete",
      writable: true,
    });

    // Act: Run the script's code.
    require("../../src/scripts/index.js");

    // Assert: The constructor should have been called immediately.
    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should initialize the game when DOMContentLoaded is dispatched", () => {
    // Arrange: Set the DOM state to loading.
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // Act I: Run the script to attach the event listener.
    require("../../src/scripts/index.js");

    // Assert I: Confirm it hasn't been called yet.
    expect(DoroClicker).not.toHaveBeenCalled();

    // Act II: Simulate the browser firing the event.
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert II: The constructor should now have been called exactly once.
    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should assign the new game instance to window.doroGame", () => {
    // Arrange I: Set the DOM state to loading.
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // Arrange II: Configure the mock's return value *before* the SUT runs.
    const mockGameInstance = { id: "mock-game" };
    DoroClicker.mockReturnValue(mockGameInstance);

    // Act I: Run the script. It will now import our pre-configured singleton mock
    // and attach the listener.
    require("../../src/scripts/index.js");

    // Act II: Trigger the listener.
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert: The global variable should be the exact instance we told the mock to return.
    expect(window.doroGame).toBe(mockGameInstance);
  });

  it("should NOT initialize the game if window.doroGame already exists", () => {
    // Arrange
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });
    window.doroGame = { id: "existing-game" }; // Set the pre-existing condition.

    // Act: Load the script and dispatch the event.
    require("../../src/scripts/index.js");
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert: Because window.doroGame already existed, the constructor is never called.
    expect(DoroClicker).not.toHaveBeenCalled();
  });
});
