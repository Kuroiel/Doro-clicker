// root/test/unit/doroclicker.test.js - Corrected Mocks and Logic

import { DoroClicker } from "../../src/scripts/Core/doroclicker.js";

// Mock all dependencies with new, correct structures
jest.mock("../../src/scripts/Core/gameState.js", () => ({
  GameState: jest.fn(() => ({ setAutoclickers: jest.fn() })),
}));
jest.mock("../../src/scripts/Systems/autoclickers.js", () => ({
  autoclickers: [{ id: 1, name: "Test Doro" }],
}));
jest.mock("../../src/scripts/Systems/upgrades.js", () => ({
  upgrades: [{ id: 101, name: "Test Upgrade" }],
}));
jest.mock("../../src/scripts/Core/gamemechanics.js", () => ({
  GameMechanics: jest.fn(() => ({ cleanup: jest.fn() })),
}));
jest.mock("../../src/scripts/UI/uimanager.js", () => ({
  UIManager: jest.fn(() => ({ forceFullUpdate: jest.fn() })),
}));
jest.mock("../../src/scripts/Events/eventhandlers.js", () => ({
  EventHandlers: jest.fn(() => ({
    setupAllEventListeners: jest.fn(),
    removeAllEventListeners: jest.fn(),
  })),
}));
jest.mock("../../src/scripts/Systems/savesystem.js", () => ({
  SaveSystem: jest.fn(() => ({ init: jest.fn(), cleanup: jest.fn() })),
}));
jest.mock("../../src/scripts/Systems/autoclickersystem.js", () => ({
  AutoclickerSystem: jest.fn(() => ({ setup: jest.fn(), cleanup: jest.fn() })),
}));
jest.mock("../../src/scripts/Events/viewmanager.js", () => ({
  ViewManager: jest.fn(() => ({ switchView: jest.fn() })),
}));

describe("DoroClicker", () => {
  let doroClicker;

  beforeEach(() => {
    jest.clearAllMocks();
    doroClicker = new DoroClicker();
  });

  describe("Constructor", () => {
    it("should initialize all core systems", () => {
      expect(doroClicker.state).toBeDefined();
      expect(doroClicker.viewManager).toBeDefined();
      expect(doroClicker.mechanics).toBeDefined();
      expect(doroClicker.autoclickerSystem).toBeDefined();
      expect(doroClicker.ui).toBeDefined();
      expect(doroClicker.events).toBeDefined();
      expect(doroClicker.saveSystem).toBeDefined();
    });

    it("should load autoclickers and upgrades data", () => {
      const {
        autoclickers,
      } = require("../../src/scripts/Systems/autoclickers.js");
      const { upgrades } = require("../../src/scripts/Systems/upgrades.js");
      expect(doroClicker.autoclickers).toEqual(autoclickers);
      expect(doroClicker.upgrades).toEqual(upgrades);
    });

    it("should set autoclickers in the game state", () => {
      expect(doroClicker.state.setAutoclickers).toHaveBeenCalledWith(
        doroClicker.autoclickers
      );
    });

    it("should call the init method", () => {
      // This is tricky to test directly, so we test the effects of init() below
      expect(doroClicker.autoclickerSystem.setup).toHaveBeenCalled();
    });
  });

  describe("init()", () => {
    it("should call setup on required systems", () => {
      // The constructor calls init(), so these should be called upon instantiation
      expect(doroClicker.autoclickerSystem.setup).toHaveBeenCalledTimes(1);
      expect(doroClicker.events.setupAllEventListeners).toHaveBeenCalledTimes(
        1
      );
      expect(doroClicker.saveSystem.init).toHaveBeenCalledTimes(1);
    });

    it("should switch to the default view", () => {
      expect(doroClicker.viewManager.switchView).toHaveBeenCalledWith(
        "autoclickers"
      );
    });
  });

  describe("destroy()", () => {
    it("should call cleanup on all systems that have it", () => {
      doroClicker.destroy();
      expect(doroClicker.autoclickerSystem.cleanup).toHaveBeenCalledTimes(1);
      expect(doroClicker.mechanics.cleanup).toHaveBeenCalledTimes(1);
      expect(doroClicker.events.removeAllEventListeners).toHaveBeenCalledTimes(
        1
      );
      expect(doroClicker.saveSystem.cleanup).toHaveBeenCalledTimes(1);
    });

    it("should not throw an error if a system is missing", () => {
      doroClicker.mechanics = undefined; // Simulate a failed initialization
      expect(() => doroClicker.destroy()).not.toThrow();
      // Check that other cleanup methods were still called
      expect(doroClicker.autoclickerSystem.cleanup).toHaveBeenCalled();
    });
  });
});
