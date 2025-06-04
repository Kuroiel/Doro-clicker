// root/test/unit/eventhandlers.test.js

import { EventHandlers } from "../../src/scripts/Events/eventhandlers.js";
import { DOMHelper } from "../../src/scripts/UI/dom.js";

// Mock game object
const mockGame = {
  mechanics: {
    handleClick: jest.fn(),
    debouncePurchase: jest.fn(),
  },
  viewManager: {
    switchView: jest.fn(),
  },
};

// Mock console.warn to suppress expected warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
  // Setup basic DOM structure
  document.body.innerHTML = `
    <div id="doro"></div>
    <div id="sidebar"></div>
    <div id="stats"></div>
    <button id="showStats"></button>
    <button id="closeStats"></button>
    <button class="view-button" data-view="view1"></button>
    <button class="view-button" data-view="view2"></button>
  `;
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
    // Cleanup any event listeners after each test
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
      // Create fresh DOM element and mock methods
      document.body.innerHTML = '<img id="doro-image" class="doro-img" />';
      doroImage = document.getElementById("doro-image");

      // Mock DOMHelper to return our test element
      jest.spyOn(DOMHelper, "getDoroImage").mockReturnValue(doroImage);

      // Spy on the actual DOM methods
      jest.spyOn(doroImage, "addEventListener");
      jest.spyOn(doroImage, "removeEventListener");
    });

    it("should do nothing if doro image element is not found", () => {
      DOMHelper.getDoroImage.mockReturnValue(null);
      eventHandlers.setupDoroImageListeners();
      expect(eventHandlers._listeners).toHaveLength(0);
    });

    it("should remove existing click listener before adding new one", () => {
      // Setup initial state with no existing listeners
      eventHandlers._doroClickHandler = undefined;

      // First call - sets up initial listener
      eventHandlers.setupDoroImageListeners();

      // Get reference to the handler that was added
      const firstHandler = doroImage.addEventListener.mock.calls.find(
        (call) => call[0] === "click"
      )[1];

      // Reset mock tracking
      doroImage.addEventListener.mockClear();
      doroImage.removeEventListener.mockClear();

      // Second call - should remove previous listener before adding new one
      eventHandlers.setupDoroImageListeners();

      // Verify removal was called with the previous handler
      expect(doroImage.removeEventListener).toHaveBeenCalledWith(
        "click",
        firstHandler
      );

      // Verify new handler was added
      expect(doroImage.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("should add click listener that calls game.mechanics.handleClick", () => {
      eventHandlers.setupDoroImageListeners();

      const doroImage = DOMHelper.getDoroImage();
      const clickEvent = new Event("click");
      clickEvent.stopPropagation = jest.fn();
      clickEvent.preventDefault = jest.fn();

      doroImage.dispatchEvent(clickEvent);

      expect(clickEvent.stopPropagation).toHaveBeenCalled();
      expect(clickEvent.preventDefault).toHaveBeenCalled();
      expect(mockGame.mechanics.handleClick).toHaveBeenCalled();
    });

    it("should track all added listeners in _listeners array", () => {
      eventHandlers.setupDoroImageListeners();

      // Get all tracked event types
      const trackedEvents = new Set(
        eventHandlers._listeners.map((l) => l.event)
      );

      // Verify all required events are present
      expect(trackedEvents.has("click")).toBeTruthy();
      expect(trackedEvents.has("mousedown")).toBeTruthy();
      expect(trackedEvents.has("mouseup")).toBeTruthy();

      // Verify no unexpected events
      expect(trackedEvents.size).toBe(3);
    });

    it("should add visual feedback handlers that modify element style", () => {
      eventHandlers.setupDoroImageListeners();
      const doroImage = DOMHelper.getDoroImage();

      // Test mousedown
      doroImage.dispatchEvent(new Event("mousedown"));
      expect(doroImage.style.transform).toBe("scale(0.95)");

      // Test mouseup
      doroImage.dispatchEvent(new Event("mouseup"));
      expect(doroImage.style.transform).toBe("scale(1)");
    });
  });

  describe("setupUpgradeButtonListeners", () => {
    let sidebarElement;
    let upgradeButton;

    beforeEach(() => {
      // Default setup - element exists
      document.body.innerHTML = `
      <div id="sidebar">
        <button class="upgrade-button" data-id="1">Upgrade 1</button>
        <button class="upgrade-button" data-id="2" disabled>Upgrade 2</button>
        <div class="not-upgrade">Other Element</div>
      </div>
    `;
      sidebarElement = document.getElementById("sidebar");
      upgradeButton = document.querySelector(".upgrade-button:not([disabled])");

      jest
        .spyOn(DOMHelper, "getSidebarElement")
        .mockReturnValue(sidebarElement);
    });

    it("should do nothing if sidebar element is not found", () => {
      // Override mock for this test only
      DOMHelper.getSidebarElement.mockReturnValue(null);

      const addListenerSpy = jest.spyOn(eventHandlers, "_addListener");
      eventHandlers.setupUpgradeButtonListeners();

      expect(addListenerSpy).not.toHaveBeenCalled();
      expect(eventHandlers._listeners).toHaveLength(0);
    });

    it("should handle click on upgrade button", () => {
      // Spy on debouncePurchase to verify it's called
      const debounceSpy = jest.spyOn(mockGame.mechanics, "debouncePurchase");

      // Setup listeners
      eventHandlers.setupUpgradeButtonListeners();

      // Verify button exists
      expect(upgradeButton).not.toBeNull();

      // Simulate click
      upgradeButton.click();

      // Verify debouncePurchase was called with correct ID
      expect(debounceSpy).toHaveBeenCalledWith(1);

      // Verify processing class was added and removed
      expect(upgradeButton.classList.contains("processing")).toBeTruthy();
    });

    it("should ignore disabled upgrade buttons", () => {
      eventHandlers.setupUpgradeButtonListeners();
      const button = document.querySelector(".upgrade-button[disabled]");
      button.click();

      expect(mockGame.mechanics.debouncePurchase).not.toHaveBeenCalled();
    });

    it("should ignore clicks not on upgrade buttons", () => {
      eventHandlers.setupUpgradeButtonListeners();
      const div = document.querySelector(".not-upgrade");
      div.click();

      expect(mockGame.mechanics.debouncePurchase).not.toHaveBeenCalled();
    });
  });

  describe("setupViewButtonListeners", () => {
    let viewButton1, viewButton2;

    beforeEach(() => {
      // Clear and setup fresh DOM with view buttons
      document.body.innerHTML = `
      <button class="view-button" data-view="view1">View 1</button>
      <button class="view-button" data-view="view2">View 2</button>
    `;

      // Get references to elements
      viewButton1 = document.querySelector('.view-button[data-view="view1"]');
      viewButton2 = document.querySelector('.view-button[data-view="view2"]');

      // Verify elements exist
      expect(viewButton1).not.toBeNull();
      expect(viewButton2).not.toBeNull();
    });

    it("should add click listeners to all view buttons", () => {
      const switchViewSpy = jest.spyOn(mockGame.viewManager, "switchView");

      // Setup listeners
      eventHandlers.setupViewButtonListeners();

      // Simulate clicks and verify
      viewButton1.click();
      expect(switchViewSpy).toHaveBeenCalledWith("view1");

      viewButton2.click();
      expect(switchViewSpy).toHaveBeenCalledWith("view2");

      // Verify correct number of listeners were added
      const viewButtonListeners = eventHandlers._listeners.filter((l) =>
        l.element.classList.contains("view-button")
      );
      expect(viewButtonListeners.length).toBe(2);
    });

    it("should handle empty NodeList gracefully", () => {
      // Clear DOM completely
      document.body.innerHTML = "";

      // Spy on view manager to ensure it's not called
      const switchViewSpy = jest.spyOn(mockGame.viewManager, "switchView");

      // This shouldn't throw errors
      expect(() => eventHandlers.setupViewButtonListeners()).not.toThrow();

      // Verify no listeners were added
      expect(eventHandlers._listeners).toHaveLength(0);
    });

    it("should track added listeners in _listeners array", () => {
      eventHandlers.setupViewButtonListeners();
      expect(eventHandlers._listeners.length).toBe(2); // One for each button
    });
  });

  describe("setupStatsEvents", () => {
    let statsElement, showButton, closeButton;

    beforeEach(() => {
      // Complete DOM setup
      document.body.innerHTML = `
      <div id="stats" style="display: none;"></div>
      <button id="showStats">Show Stats</button>
      <button id="closeStats">Close Stats</button>
    `;

      // Get element references
      statsElement = document.getElementById("stats");
      showButton = document.getElementById("showStats");
      closeButton = document.getElementById("closeStats");

      // Verify elements exist
      expect(statsElement).not.toBeNull();
      expect(showButton).not.toBeNull();
      expect(closeButton).not.toBeNull();

      // Mock DOMHelper methods
      jest.spyOn(DOMHelper, "getStatsElement").mockReturnValue(statsElement);
      jest.spyOn(DOMHelper, "getShowStatsButton").mockReturnValue(showButton);
      jest.spyOn(DOMHelper, "getCloseStatsButton").mockReturnValue(closeButton);
    });

    it("should show stats when show button is clicked", () => {
      // Initial state check
      expect(statsElement.style.display).toBe("none");

      // Setup listeners
      eventHandlers.setupStatsEvents();

      // Simulate click
      showButton.click();

      // Verify stats are shown
      expect(statsElement.style.display).toBe("block");

      // Verify event listener was tracked
      const showButtonListeners = eventHandlers._listeners.filter(
        (l) => l.element === showButton
      );
      expect(showButtonListeners.length).toBe(1);
    });

    it("should hide stats when close button is clicked", () => {
      eventHandlers.setupStatsEvents();
      const statsElement = DOMHelper.getStatsElement();
      const closeButton = DOMHelper.getCloseStatsButton();

      // First show stats
      DOMHelper.getShowStatsButton().click();
      expect(statsElement.style.display).toBe("block");

      // Then close
      closeButton.click();
      expect(statsElement.style.display).toBe("none");
    });

    it("should hide stats when clicking outside while stats are visible", () => {
      eventHandlers.setupStatsEvents();
      const statsElement = DOMHelper.getStatsElement();

      // Show stats
      DOMHelper.getShowStatsButton().click();
      expect(statsElement.style.display).toBe("block");

      // Click outside
      document.body.click();
      expect(statsElement.style.display).toBe("none");
    });

    it("should not hide stats when clicking on stats element", () => {
      eventHandlers.setupStatsEvents();
      const statsElement = DOMHelper.getStatsElement();

      // Show stats
      DOMHelper.getShowStatsButton().click();

      // Mock contains to return true
      jest.spyOn(statsElement, "contains").mockReturnValue(true);

      // Click on stats
      statsElement.click();
      expect(statsElement.style.display).toBe("block");
    });
  });

  describe("removeAllEventListeners", () => {
    let testElement1, testElement2;

    beforeEach(() => {
      // Setup fresh DOM elements
      document.body.innerHTML = `
      <button id="test1">Test 1</button>
      <button id="test2">Test 2</button>
    `;
      testElement1 = document.getElementById("test1");
      testElement2 = document.getElementById("test2");

      // Add real listeners to track
      eventHandlers._addListener(testElement1, "click", jest.fn());
      eventHandlers._addListener(testElement2, "mouseover", jest.fn());

      // Spy on element methods
      jest.spyOn(testElement1, "removeEventListener");
      jest.spyOn(testElement2, "removeEventListener");
    });

    it("should remove all tracked listeners and clear the list", () => {
      // Verify initial state
      expect(eventHandlers._listeners.length).toBe(2);

      // Perform removal
      eventHandlers.removeAllEventListeners();

      // Verify listeners were removed
      expect(testElement1.removeEventListener).toHaveBeenCalled();
      expect(testElement2.removeEventListener).toHaveBeenCalled();

      // Verify list is cleared
      expect(eventHandlers._listeners).toEqual([]);
    });

    it("should handle empty listeners array gracefully", () => {
      // Clear listeners first
      eventHandlers._listeners = [];

      // Should not throw
      expect(() => eventHandlers.removeAllEventListeners()).not.toThrow();
    });
  });
});
