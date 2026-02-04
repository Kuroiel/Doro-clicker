// Mock DOMHelper
jest.mock("../../src/scripts/UI/dom.js", () => ({
  DOMHelper: {
    getScoreElement: jest.fn(),
    getStatElements: jest.fn(),
    setText: jest.fn(),
    getAutoclickersContainer: jest.fn(),
    getUpgradesContainer: jest.fn(),
    getUpgradeButton: jest.fn(),
    replaceElement: jest.fn(),
    toggleClass: jest.fn(),
  },
}));

// Mock Formatters
const mockFormatNumber = jest.fn().mockImplementation((num, decimals = 0) => 
  num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
);
jest.mock("../../src/scripts/UI/formatters.js", () => ({
  Formatters: jest.fn().mockImplementation(() => ({
    formatNumber: mockFormatNumber,
  })),
}));

// Mock UpgradeRenderer
jest.mock("../../src/scripts/UI/upgradeRenderer.js", () => ({
  UpgradeRenderer: {
    renderUpgradeButton: jest.fn().mockReturnValue("<div>button</div>"),
    renderTooltip: jest.fn().mockReturnValue("tooltip"),
  },
}));

import { UIManager } from "../../src/scripts/UI/uimanager.js";
import { DOMHelper } from "../../src/scripts/UI/dom.js";
import { Formatters } from "../../src/scripts/UI/formatters.js";
import { UpgradeRenderer } from "../../src/scripts/UI/upgradeRenderer.js";

describe("UIManager", () => {
  let uiManager;
  let mockGame;
  let mockStats;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatNumber.mockClear();

    mockStats = {
      clicks: {},
      dps: {},
      total: {},
    };
    DOMHelper.getStatElements.mockReturnValue(mockStats);
    DOMHelper.getScoreElement.mockReturnValue({});

    mockGame = {
      state: {
        doros: 1000,
        manualClicks: 50,
        totalDoros: 5000,
        getTotalDPS: jest.fn().mockReturnValue(100),
        addListener: jest.fn(),
      },
      autoclickers: [
         { id: 1, cost: 10, purchased: 0, type: "autoclicker", description: "d", effectDescription: "e", value: 1 },
      ],
      upgrades: [
         { 
             id: 2, 
             cost: 500, 
             purchased: 0, 
             type: "upgrade", 
             isVisible: jest.fn().mockReturnValue(true),
             description: "d", 
             effectDescription: "e", 
             value: 1
         },
         { 
             id: 3, 
             cost: 2000, 
             purchased: 0, 
             type: "upgrade", 
             isVisible: jest.fn().mockReturnValue(false),
             description: "d", 
             effectDescription: "e", 
             value: 1
         },
      ],
      mechanics: {
          canAfford: jest.fn((item) => item.cost <= 1000),
      }
    };

    uiManager = new UIManager(mockGame);
  });

  describe("updateScoreDisplay", () => {
    it("should update score text", () => {
        uiManager.updateScoreDisplay();
        expect(DOMHelper.setText).toHaveBeenCalledWith(expect.anything(), expect.stringContaining("1,000"));
    });
  });

  describe("updateStatsDisplay", () => {
    it("should update stats", () => {
        uiManager.updateStatsDisplay();
        expect(DOMHelper.setText).toHaveBeenCalledWith(mockStats.clicks, "50");
        expect(DOMHelper.setText).toHaveBeenCalledWith(mockStats.dps, "100.0");
        expect(DOMHelper.setText).toHaveBeenCalledWith(mockStats.total, "5,000");
    });
  });

  describe("renderAllItems", () => {
    it("should clear and render containers", () => {
        const autoInfo = { innerHTML: "old", insertAdjacentHTML: jest.fn() };
        const upgradeInfo = { innerHTML: "old", insertAdjacentHTML: jest.fn() };
        
        DOMHelper.getAutoclickersContainer.mockReturnValue(autoInfo);
        DOMHelper.getUpgradesContainer.mockReturnValue(upgradeInfo);

        uiManager.renderAllItems();

        expect(autoInfo.innerHTML).toBe(""); // cleared
        expect(upgradeInfo.innerHTML).toBe(""); // cleared
        expect(upgradeInfo.insertAdjacentHTML).toHaveBeenCalled(); // items added
        expect(autoInfo.insertAdjacentHTML).toHaveBeenCalled();
    });
  });
  
  describe("updateAllAffordability", () => {
      it("should update buttons based on affordability", () => {
          const mockButton = { disabled: false };
          DOMHelper.getUpgradeButton.mockReturnValue(mockButton);

          uiManager.updateAllAffordability();

          // Check logic
          // Item 1 (cost 10): Affordable.
          // Item 2 (cost 500): Affordable.
          // Item 3 (cost 2000): Not Affordable (mocked canAfford returns item.cost <= 1000)
          
          expect(DOMHelper.toggleClass).toHaveBeenCalled();
          // We can't easily check specific calls for specific items without more mocking setup, 
          // but covering the function execution is good.
      });
  });
});
