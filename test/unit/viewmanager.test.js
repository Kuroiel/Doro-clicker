jest.mock("../../src/scripts/UI/dom.js", () => {
  const originalModule = jest.requireActual("../../src/scripts/UI/dom.js");
  return {
    ...originalModule,
    DOMHelper: {
      getViewButtons: jest.fn(),
      getUpgradeViews: jest.fn(),
      toggleClass: jest.fn(),
    },
  };
});

import { DOMHelper } from "../../src/scripts/UI/dom.js";
import { ViewManager } from "../../src/scripts/Events/viewmanager.js";

describe("ViewManager", () => {
  let mockGame;
  let mockUi;
  let viewManager;

  // Mock DOM elements
  const mockViewButtons = [
    {
      dataset: { view: "autoclickers" },
      classList: { add: jest.fn(), remove: jest.fn() },
    },
    {
      dataset: { view: "upgrades" },
      classList: { add: jest.fn(), remove: jest.fn() },
    },
  ];

  const mockUpgradeViews = [
    {
      id: "autoclickers-container",
      classList: { add: jest.fn(), remove: jest.fn() },
    },
    {
      id: "upgrades-container",
      classList: { add: jest.fn(), remove: jest.fn() },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mock UI
    mockUi = {
      updateUI: jest.fn(),
      renderUpgrades: jest.fn(),
    };
    mockGame = { ui: mockUi };

    // Setup default mock implementations
    DOMHelper.getViewButtons.mockReturnValue(mockViewButtons);
    DOMHelper.getUpgradeViews.mockReturnValue(mockUpgradeViews);
    DOMHelper.toggleClass.mockImplementation(
      (element, className, condition) => {
        if (element && className) {
          condition
            ? element.classList.add(className)
            : element.classList.remove(className);
        }
      }
    );

    viewManager = new ViewManager(mockGame);
  });

  describe("constructor", () => {
    it("should initialize with correct default values", () => {
      expect(viewManager.game).toBe(mockGame);
      expect(viewManager.currentView).toBe("autoclickers");
    });
  });

  describe("switchView", () => {
    it("should switch to a valid view and update UI", () => {
      viewManager.switchView("upgrades");

      expect(viewManager.currentView).toBe("upgrades");
      expect(DOMHelper.getViewButtons).toHaveBeenCalled();
      expect(DOMHelper.getUpgradeViews).toHaveBeenCalled();
      expect(mockUi.updateUI).toHaveBeenCalled();
    });

    it("should not switch to an invalid view", () => {
      const originalView = viewManager.currentView;
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      viewManager.switchView("invalid-view");

      expect(viewManager.currentView).toBe(originalView);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Attempted to switch to invalid view: invalid-view"
      );
      consoleWarnSpy.mockRestore();
    });

    it("should handle null DOM elements gracefully", () => {
      DOMHelper.getViewButtons.mockReturnValue([
        null,
        {
          dataset: { view: "upgrades" },
          classList: { add: jest.fn(), remove: jest.fn() },
        },
      ]);
      DOMHelper.getUpgradeViews.mockReturnValue([
        null,
        {
          id: "upgrades-container",
          classList: { add: jest.fn(), remove: jest.fn() },
        },
      ]);

      expect(() => {
        viewManager.switchView("upgrades");
      }).not.toThrow();
    });

    it("should call renderUpgrades only for the target container", () => {
      viewManager.switchView("upgrades");
      expect(mockUi.renderUpgrades).toHaveBeenCalledTimes(1);
    });
  });

  describe("_updateViewButtons", () => {
    it("should update button active states based on current view", () => {
      viewManager.currentView = "upgrades";
      viewManager._updateViewButtons();

      // Verify the correct class methods were called
      expect(mockViewButtons[0].classList.add).not.toHaveBeenCalledWith(
        "active"
      );
      expect(mockViewButtons[0].classList.remove).toHaveBeenCalledWith(
        "active"
      );
      expect(mockViewButtons[1].classList.add).toHaveBeenCalledWith("active");
      expect(mockViewButtons[1].classList.remove).not.toHaveBeenCalledWith(
        "active"
      );
    });

    it("should handle null buttons gracefully", () => {
      DOMHelper.getViewButtons.mockReturnValue([null, mockViewButtons[1]]);
      viewManager._updateViewButtons();
      // Test should pass if no errors are thrown
    });
  });

  describe("_updateViewContainers", () => {
    it("should update container visibility and call renderUpgrades for active view", () => {
      viewManager.currentView = "upgrades";
      viewManager._updateViewContainers();

      expect(mockUpgradeViews[0].classList.add).not.toHaveBeenCalledWith(
        "active-view"
      );
      expect(mockUpgradeViews[0].classList.remove).toHaveBeenCalledWith(
        "active-view"
      );
      expect(mockUpgradeViews[1].classList.add).toHaveBeenCalledWith(
        "active-view"
      );
      expect(mockUpgradeViews[1].classList.remove).not.toHaveBeenCalledWith(
        "active-view"
      );
      expect(mockUi.renderUpgrades).toHaveBeenCalled();
    });

    it("should handle null containers gracefully", () => {
      DOMHelper.getUpgradeViews.mockReturnValue([null, mockUpgradeViews[1]]);
      viewManager._updateViewContainers();
      // Test should pass if no errors are thrown
    });
  });

  describe("getCurrentView", () => {
    it("should return the current view", () => {
      expect(viewManager.getCurrentView()).toBe("autoclickers");
      viewManager.currentView = "upgrades";
      expect(viewManager.getCurrentView()).toBe("upgrades");
    });
  });

  // Edge case testing
  describe("edge cases", () => {
    it("should handle missing DOMHelper methods gracefully", () => {
      // Override with undefined using mockImplementation
      DOMHelper.getViewButtons.mockImplementation(() => undefined);
      DOMHelper.getUpgradeViews.mockImplementation(() => undefined);

      expect(() => {
        viewManager.switchView("upgrades");
      }).not.toThrow();
    });

    it("should handle missing ui methods gracefully", () => {
      const brokenGame = { ui: undefined };
      const brokenViewManager = new ViewManager(brokenGame);

      expect(() => {
        brokenViewManager.switchView("upgrades");
      }).not.toThrow();
    });

    it("should handle partial ui methods gracefully", () => {
      const partialGame = { ui: { updateUI: undefined } };
      const partialViewManager = new ViewManager(partialGame);

      expect(() => {
        partialViewManager.switchView("upgrades");
      }).not.toThrow();
    });
  });
});
