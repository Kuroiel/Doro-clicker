const mockDoroClickerConstructor = jest.fn();

jest.mock("../../src/scripts/Core/doroclicker.js", () => ({
  DoroClicker: mockDoroClickerConstructor,
}));

// Mock console.error to keep test output clean.
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Game Initialization (index.js)", () => {
  let DoroClicker;

  beforeEach(() => {
    // Before each test, reset modules to ensure a fresh, un-executed index.js.
    jest.resetModules();

    // Clear any previous calls from the singleton mock.
    mockDoroClickerConstructor.mockClear();

    DoroClicker = require("../../src/scripts/Core/doroclicker.js").DoroClicker;

    // Reset global state.
    delete window.doroGame;
  });

  afterAll(() => {
    // Restore console after all tests are done.
    consoleErrorSpy.mockRestore();
  });

  it("should NOT initialize the game immediately upon script execution if DOM is loading", () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    require("../../src/scripts/index.js");

    expect(DoroClicker).not.toHaveBeenCalled();
  });

  it("should initialize the game immediately if the DOM is already ready", () => {
    Object.defineProperty(document, "readyState", {
      value: "complete",
      writable: true,
    });

    require("../../src/scripts/index.js");

    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should initialize the game when DOMContentLoaded is dispatched", () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    require("../../src/scripts/index.js");

    expect(DoroClicker).not.toHaveBeenCalled();

    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(DoroClicker).toHaveBeenCalledTimes(1);
  });

  it("should assign the new game instance to window.doroGame", () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    const mockGameInstance = { id: "mock-game" };
    DoroClicker.mockReturnValue(mockGameInstance);

    require("../../src/scripts/index.js");

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(window.doroGame).toBe(mockGameInstance);
  });

  it("should NOT initialize the game if window.doroGame already exists", () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });
    window.doroGame = { id: "existing-game" }; // Set the pre-existing condition.

    require("../../src/scripts/index.js");
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(DoroClicker).not.toHaveBeenCalled();
  });
});
