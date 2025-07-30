// test/unit/index.test.js - Final Corrected Version

jest.mock("../../src/scripts/Core/doroclicker.js", () => ({
  DoroClicker: jest.fn(),
}));

const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("Game Initialization (index.js)", () => {
  let DoroClickerMock;

  beforeEach(async () => {
    // 1. Reset everything to a clean slate.
    jest.resetModules();
    jest.clearAllMocks();

    // 2. Get a fresh handle on the mock constructor.
    DoroClickerMock = (await import("../../src/scripts/Core/doroclicker.js"))
      .DoroClicker;

    // 3. Set up the global environment for the test.
    delete window.doroGame;
    Object.defineProperty(document, "readyState", {
      value: "loading",
      writable: true,
    });

    // --- THIS IS THE FIX ---
    // 4. Import the script under test. This will execute the code in index.js,
    // which adds the DOMContentLoaded listener. This is now part of the setup.
    await import("../../src/scripts/index.js");
    // --- END OF FIX ---
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should NOT initialize the game on import (before event fires)", () => {
    // Assert: The beforeEach block only attached the listener.
    // The constructor should not have been called yet.
    expect(DoroClickerMock).not.toHaveBeenCalled();
  });

  it("should initialize the game when DOMContentLoaded event is dispatched", () => {
    // Arrange
    const mockGameInstance = { id: "mock-game" };
    DoroClickerMock.mockImplementation(() => mockGameInstance);

    // Act: The listener is already attached. We just need to fire the event.
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert
    expect(DoroClickerMock).toHaveBeenCalledTimes(1);
    expect(window.doroGame).toBe(mockGameInstance);
  });

  it("should NOT initialize the game if an instance already exists", () => {
    // Arrange: Set up the pre-existing condition *after* the initial setup.
    window.doroGame = { id: "existing-game" };

    // Act
    Object.defineProperty(document, "readyState", {
      value: "interactive",
      writable: true,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    // Assert
    expect(DoroClickerMock).not.toHaveBeenCalled();
    expect(window.doroGame.id).toBe("existing-game");
  });
});
