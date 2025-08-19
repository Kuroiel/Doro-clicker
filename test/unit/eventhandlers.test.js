import { EventHandlers } from "../../src/scripts/Events/eventhandlers.js";
import { DOMHelper } from "../../src/scripts/UI/dom.js";

const mockGame = {
  mechanics: {
    handleClick: jest.fn(),
    // Add the missing purchaseUpgrade function to the mock
    purchaseUpgrade: jest.fn(),
  },
  viewManager: {
    switchView: jest.fn(),
  },
};

// Mock console.warn to suppress expected warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe("EventHandlers", () => {
  let eventHandlers;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Create fresh instance for each test
    eventHandlers = new EventHandlers(mockGame);
  });

  afterEach(() => {
    // Cleanup any event listeners after each test to prevent test leakage
    eventHandlers.removeAllEventListeners();
  });

  describe("constructor", () => {
    it("should initialize with game reference and empty listeners array", () => {
      expect(eventHandlers.game).toBe(mockGame);
      expect(eventHandlers._listeners).toEqual([]);
    });
  });

  describe("setupAllEventListeners", () => {
    it("should call all individual setup methods", () => {
      jest.spyOn(eventHandlers, "setupDoroImageListeners");
      jest.spyOn(eventHandlers, "setupUpgradeButtonListeners");
      jest.spyOn(eventHandlers, "setupViewButtonListeners");
      jest.spyOn(eventHandlers, "setupStatsEvents");

      eventHandlers.setupAllEventListeners();

      expect(eventHandlers.setupDoroImageListeners).toHaveBeenCalled();
      expect(eventHandlers.setupUpgradeButtonListeners).toHaveBeenCalled();
      expect(eventHandlers.setupViewButtonListeners).toHaveBeenCalled();
      expect(eventHandlers.setupStatsEvents).toHaveBeenCalled();
    });
  });

  describe("setupDoroImageListeners", () => {
    let doroImage;

    beforeEach(() => {
      document.body.innerHTML = '<img id="doro-image" />';
      doroImage = document.getElementById("doro-image");
      jest.spyOn(DOMHelper, "getDoroImage").mockReturnValue(doroImage);
    });

    it("should do nothing if doro image element is not found", () => {
      DOMHelper.getDoroImage.mockReturnValue(null);
      eventHandlers.setupDoroImageListeners();
      expect(eventHandlers._listeners).toHaveLength(0);
    });

    it("should add click listener that calls game.mechanics.handleClick", () => {
      eventHandlers.setupDoroImageListeners();
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      doroImage.dispatchEvent(clickEvent);
      expect(mockGame.mechanics.handleClick).toHaveBeenCalled();
    });

    it("should add visual feedback handlers that modify element style", () => {
      eventHandlers.setupDoroImageListeners();
      doroImage.dispatchEvent(new MouseEvent("mousedown"));
      expect(doroImage.style.transform).toBe("scale(0.95)");
      doroImage.dispatchEvent(new MouseEvent("mouseup"));
      expect(doroImage.style.transform).toBe("scale(1)");
    });
  });

  describe("setupUpgradeButtonListeners", () => {
    let sidebarElement;
    let upgradeButton;

    beforeEach(() => {
      document.body.innerHTML = `
        <div id="sidebar">
          <button class="upgrade-button" data-id="1">Upgrade 1</button>
          <button class="upgrade-button" data-id="2" disabled>Upgrade 2</button>
        </div>`;
      sidebarElement = document.getElementById("sidebar");
      upgradeButton = document.querySelector('.upgrade-button[data-id="1"]');
      jest
        .spyOn(DOMHelper, "getSidebarElement")
        .mockReturnValue(sidebarElement);
    });

    it("should do nothing if sidebar element is not found", () => {
      DOMHelper.getSidebarElement.mockReturnValue(null);
      eventHandlers.setupUpgradeButtonListeners();
      expect(eventHandlers._listeners).toHaveLength(0);
    });

    it("should handle click on an enabled upgrade button", () => {
      eventHandlers.setupUpgradeButtonListeners();
      upgradeButton.click();
      expect(mockGame.mechanics.purchaseUpgrade).toHaveBeenCalledWith(1);
    });

    it("should ignore disabled upgrade buttons", () => {
      eventHandlers.setupUpgradeButtonListeners();
      const disabledButton = document.querySelector(
        ".upgrade-button[disabled]"
      );
      disabledButton.click();
      expect(mockGame.mechanics.purchaseUpgrade).not.toHaveBeenCalled();
    });
  });

  describe("setupViewButtonListeners", () => {
    it("should add click listeners to all view buttons", () => {
      document.body.innerHTML = `<button class="view-button" data-view="upgrades"></button>`;
      const viewButton = document.querySelector(".view-button");

      eventHandlers.setupViewButtonListeners();
      viewButton.click();

      expect(mockGame.viewManager.switchView).toHaveBeenCalledWith("upgrades");
    });
  });

  describe("setupStatsEvents", () => {
    let statsElement, showButton, closeButton;

    beforeEach(() => {
      document.body.innerHTML = `
        <div id="stats-overlay" style="display: none;"></div>
        <button id="show-stats">Show</button>
        <button id="close-stats">Close</button>
      `;
      statsElement = document.getElementById("stats-overlay");
      showButton = document.getElementById("show-stats");
      closeButton = document.getElementById("close-stats");

      jest.spyOn(DOMHelper, "getStatsElement").mockReturnValue(statsElement);
      jest.spyOn(DOMHelper, "getShowStatsButton").mockReturnValue(showButton);
      jest.spyOn(DOMHelper, "getCloseStatsButton").mockReturnValue(closeButton);

      eventHandlers.setupStatsEvents();
    });

    it("should show stats when show button is clicked", () => {
      showButton.click();
      expect(statsElement.style.display).toBe("block");
    });

    it("should hide stats when close button is clicked", () => {
      showButton.click();
      expect(statsElement.style.display).toBe("block");

      closeButton.click();
      expect(statsElement.style.display).toBe("none");
    });

    it("should hide stats when clicking outside while stats are visible", () => {
      showButton.click();
      expect(statsElement.style.display).toBe("block");

      document.body.click();
      expect(statsElement.style.display).toBe("none");
    });

    it("should not hide stats when clicking inside the stats element", () => {
      showButton.click();
      expect(statsElement.style.display).toBe("block");

      statsElement.click();
      expect(statsElement.style.display).toBe("block");
    });
  });

  describe("removeAllEventListeners", () => {
    it("should remove all tracked listeners and clear the list", () => {
      document.body.innerHTML = `<button id="test-btn"></button>`;
      const testElement = document.getElementById("test-btn");
      const handler = jest.fn();

      // Manually add a listener using the internal method
      eventHandlers._addListener(testElement, "click", handler);
      expect(eventHandlers._listeners.length).toBe(1);

      // Spy on the actual DOM method
      const removeSpy = jest.spyOn(testElement, "removeEventListener");

      // Perform removal
      eventHandlers.removeAllEventListeners();

      // Verify listeners were removed from the DOM
      expect(removeSpy).toHaveBeenCalledWith("click", handler);
      // Verify the internal list is cleared
      expect(eventHandlers._listeners).toEqual([]);
    });
  });
});
