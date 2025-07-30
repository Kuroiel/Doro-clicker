// root/test/unit/viewmanager.test.js - Corrected for new UI methods

jest.mock("../../src/scripts/UI/dom.js", () => ({
  DOMHelper: {
    getViewButtons: jest.fn(),
    getUpgradeViews: jest.fn(),
    toggleClass: jest.fn(),
  },
}));

import { DOMHelper } from "../../src/scripts/UI/dom.js";
import { ViewManager } from "../../src/scripts/Events/viewmanager.js";

describe("ViewManager", () => {
  let mockGame;
  let viewManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = {
      ui: {
        renderAllItems: jest.fn(), // Mock the new render method
      },
    };

    DOMHelper.getViewButtons.mockReturnValue([]);
    DOMHelper.getUpgradeViews.mockReturnValue([]);

    viewManager = new ViewManager(mockGame);
  });

  describe("switchView", () => {
    it("should switch to a valid view and update UI containers", () => {
      viewManager.switchView("upgrades");

      expect(viewManager.currentView).toBe("upgrades");
      expect(DOMHelper.getViewButtons).toHaveBeenCalled();
      expect(DOMHelper.getUpgradeViews).toHaveBeenCalled();
    });

    it("should call renderAllItems when updating the active view container", () => {
      // Mock a container that matches the target view
      const mockUpgradeContainer = { id: "upgrades-container" };
      DOMHelper.getUpgradeViews.mockReturnValue([mockUpgradeContainer]);

      viewManager.switchView("upgrades");

      expect(mockGame.ui.renderAllItems).toHaveBeenCalledTimes(1);
    });

    it("should not switch to an invalid view", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      viewManager.switchView("invalid-view");
      expect(viewManager.currentView).toBe("autoclickers");
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Attempted to switch to invalid view: invalid-view"
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
