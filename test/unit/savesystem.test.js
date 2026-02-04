import { SaveSystem } from "../../src/scripts/Systems/savesystem.js";
import { DOMHelper } from "../../src/scripts/UI/dom.js";

// Mock DOMHelper
jest.mock("../../src/scripts/UI/dom.js", () => ({
  DOMHelper: {
    getResetButton: jest.fn(),
    showResetModal: jest.fn(),
    hideResetModal: jest.fn(),
  },
}));

describe("SaveSystem", () => {
  let saveSystem;
  let mockGame;
  let localStorageMock;

  beforeEach(() => {
    jest.clearAllMocks();

    localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    mockGame = {
      state: {
        serialize: jest.fn().mockReturnValue({ doros: 100 }),
        deserialize: jest.fn(),
        reset: jest.fn(),
      },
      autoclickers: [
        { id: 1, purchased: 5 },
      ],
      upgrades: [
        { id: "u1", purchased: 1 },
      ],
      modifierSystem: {
        recalculate: jest.fn(),
      },
      autoclickerSystem: {
        recalculateDPS: jest.fn(),
      },
      ui: {
        forceFullUpdate: jest.fn(),
        renderAllItems: jest.fn(),
      },
    };

    saveSystem = new SaveSystem(mockGame);
  });

  describe("saveGame", () => {
    it("should save game state to localStorage", () => {
      saveSystem.saveGame();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "doroClickerSave",
        expect.stringContaining('"doros":100')
      );
    });

    it("should handle save errors gracefully", () => {
        localStorageMock.setItem.mockImplementation(() => { throw new Error("Quota"); });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        saveSystem.saveGame();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
  });

  describe("loadGame", () => {
    it("should load game state from localStorage", () => {
      const saveData = {
        state: { doros: 50 },
        autoclickers: [{ id: 1, purchased: 10 }],
        upgrades: [{ id: "u1", purchased: 2 }],
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(saveData));

      saveSystem.loadGame();

      expect(mockGame.state.deserialize).toHaveBeenCalledWith({ doros: 50 });
      expect(mockGame.autoclickers[0].purchased).toBe(10);
      expect(mockGame.upgrades[0].purchased).toBe(2);
      expect(mockGame.modifierSystem.recalculate).toHaveBeenCalled();
      expect(mockGame.ui.forceFullUpdate).toHaveBeenCalled();
    });

    it("should initialize UI if no save exists", () => {
      localStorageMock.getItem.mockReturnValue(null);
      saveSystem.loadGame();
      expect(mockGame.ui.renderAllItems).toHaveBeenCalled();
      expect(mockGame.state.deserialize).not.toHaveBeenCalled();
    });

    it("should fallback to reset if loading fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const resetSpy = jest.spyOn(saveSystem, 'resetGame');
      
      saveSystem.loadGame();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("resetGame", () => {
    it("should clear save and reset logic", () => {
      saveSystem.resetGame();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("doroClickerSave");
      expect(mockGame.state.reset).toHaveBeenCalled();
      expect(mockGame.autoclickers[0].purchased).toBe(0);
      expect(mockGame.modifierSystem.recalculate).toHaveBeenCalled();
    });
  });

  describe("setupAutoSave", () => {
    it("should start an interval", () => {
        jest.useFakeTimers();
        saveSystem.setupAutoSave();
        jest.advanceTimersByTime(30001);
        expect(localStorageMock.setItem).toHaveBeenCalled();
        jest.useRealTimers();
    });
  });
});
