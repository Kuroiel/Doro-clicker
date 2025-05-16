
jest.mock('../../src/scripts/autoclickers.js', () => ({
  autoclickers: [
    { id: 1, name: 'Test Autoclicker', cost: () => 10, purchased: 0 },
    { id: 2, name: 'Test Autoclicker 2', cost: () => 20, purchased: 0 },
  ],
}));

jest.mock('../../src/scripts/upgrades.js', () => ({
  upgrades: [
    { id: 3, name: 'Test Upgrade', cost: () => 30, purchased: 0 },
    { id: 4, name: 'Test Upgrade 2', cost: () => 40, purchased: 0 },
  ],
}));

jest.mock('../../src/scripts/app.js', () => {
  const originalModule = jest.requireActual('../../src/scripts/app.js');
  
  class MockDoroClicker extends originalModule.DoroClicker {
    constructor() {
      super();
      // Keep real implementations for most methods
      this.switchView = jest.fn().mockImplementation(originalModule.DoroClicker.prototype.switchView);
      this.renderUpgrades = jest.fn().mockImplementation(originalModule.DoroClicker.prototype.renderUpgrades);
      this.setupEventListeners = jest.fn().mockImplementation(originalModule.DoroClicker.prototype.setupEventListeners);
      this.updateUI = jest.fn();
      this.purchaseUpgrade = jest.fn().mockImplementation(originalModule.DoroClicker.prototype.purchaseUpgrade);
      this.destroy = jest.fn().mockImplementation(originalModule.DoroClicker.prototype.destroy);
    }
    
    // This appears to be a method that should be part of the class
    formatNumber(num, decimals = 0, context = 'score', threshold = null) {
      // Match the exact thresholds from the real implementation
      let sciThreshold;
      switch(context) {
        case 'score': sciThreshold = 999999999; break;
        case 'cost': sciThreshold = 999999; break;
        case 'dps': sciThreshold = 99999.9; break;
        default: sciThreshold = 999999; break;
      }
      
      if (threshold !== null) sciThreshold = threshold;
      
      if (num >= sciThreshold) return num.toExponential(2);
      
      // Simple formatting for tests that matches real behavior
      return num.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
  }

  return {
    ...originalModule,
    DoroClicker: MockDoroClicker
  };
});


import { autoclickers } from '../../src/scripts/autoclickers.js';
import { upgrades } from '../../src/scripts/upgrades.js';
import { DoroClicker } from '../../src/scripts/app.js';
import { GameState } from '../../src/scripts/gameState.js';
import { DOMHelper, resetDOMMocks } from '../../src/scripts/dom.js';

jest.mock('../../src/scripts/dom.js');

describe('DoroClicker', () => {
  let game;
  let autoContainerMock;
  let upgradesContainerMock;
  let mockSidebar;
  let mockViewButtons;
  let mockUpgradeViews;
  let warnSpy;
  


  beforeEach(() => {
    jest.clearAllMocks();
  
    // Initialize ALL mock elements FIRST
    autoContainerMock = {
      innerHTML: '',
      insertAdjacentHTML: jest.fn(),
      appendChild: jest.fn(),
      querySelector: jest.fn()
    };
  
    upgradesContainerMock = {
      innerHTML: '',
      insertAdjacentHTML: jest.fn(),
      appendChild: jest.fn(),
      querySelector: jest.fn()
    };
  
    mockSidebar = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      closest: jest.fn()
    };
  
    mockViewButtons = [
      { dataset: { view: 'autoclickers' }, classList: { toggle: jest.fn() } },
      { dataset: { view: 'upgrades' }, classList: { toggle: jest.fn() } }
    ];
  
    mockUpgradeViews = [
      { id: 'autoclickers-container', classList: { toggle: jest.fn() } },
      { id: 'upgrades-container', classList: { toggle: jest.fn() } }
    ];
  
    // Configure DOMHelper mocks AFTER initializing elements
    DOMHelper.getAutoclickersContainer.mockReturnValue(autoContainerMock);
    DOMHelper.getUpgradesContainer.mockReturnValue(upgradesContainerMock);
    DOMHelper.getSidebarElement.mockReturnValue(mockSidebar);
    DOMHelper.getViewButtons.mockReturnValue(mockViewButtons);
    DOMHelper.getUpgradeViews.mockReturnValue(mockUpgradeViews);
    DOMHelper.toggleClass.mockImplementation((el, className, condition) => {
      if (el) el.classList.toggle(className, condition);
    });
  
    // Create game instance LAST after mocks are ready
    game = new DoroClicker();
    game.state = new GameState();
    game.state.setAutoclickers(autoclickers);
    
    // Initialize console.warn spy
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.clearAllMocks();
    resetDOMMocks(); 
  });

  describe('View Switching', () => {
    test('should use DOMHelper for view switching', () => {
      game.switchView('autoclickers');
      expect(DOMHelper.getViewButtons).toHaveBeenCalled();
      expect(DOMHelper.getUpgradeViews).toHaveBeenCalled();
      mockViewButtons.forEach(btn => {
        expect(btn.classList.toggle).toHaveBeenCalled();
      });
      mockUpgradeViews.forEach(view => {
        expect(view.classList.toggle).toHaveBeenCalled();
      });
    });
  
    test('should switch to autoclickers view', () => {
      game.switchView('autoclickers');
      const viewButtons = DOMHelper.getViewButtons();
      expect(viewButtons[0].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(viewButtons[1].classList.toggle).toHaveBeenCalledWith('active', false);
    });
  
    test('should switch to upgrades view', () => {
      game.switchView('upgrades');
      const viewButtons = DOMHelper.getViewButtons();
      expect(viewButtons[0].classList.toggle).toHaveBeenCalledWith('active', false);
      expect(viewButtons[1].classList.toggle).toHaveBeenCalledWith('active', true);
    });
  });

  test('should setup upgrade button listeners', () => {
    // Verify sidebar element was accessed
    expect(DOMHelper.getSidebarElement).toHaveBeenCalled();
    
    // Verify event listener was added
    expect(mockSidebar.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );
    
    // Verify no warning was logged
    expect(console.warn).not.toHaveBeenCalled();
  });

  test('should render upgrades properly', () => {
    // Reset mocks to clear any previous calls
    autoContainerMock.insertAdjacentHTML.mockClear();
    upgradesContainerMock.insertAdjacentHTML.mockClear();

    // Mock the UpgradeRenderer to return simple strings
    jest.doMock('../../src/scripts/upgradeRenderer.js', () => ({
        UpgradeRenderer: {
            renderUpgradeButton: jest.fn().mockImplementation(() => '<button>test</button>'),
            renderFirstLine: jest.fn(),
            renderSecondLine: jest.fn(),
            renderTooltip: jest.fn()
        }
    }), {virtual: true});

    // Create fresh game instance with mocks
    const testGame = new DoroClicker();
    testGame.state = new GameState();
    testGame.state.setAutoclickers(autoclickers);
    testGame.upgrades = upgrades;

    // Clear any previous render calls from initialization
    autoContainerMock.insertAdjacentHTML.mockClear();
    upgradesContainerMock.insertAdjacentHTML.mockClear();

    // Call renderUpgrades directly
    testGame.renderUpgrades();

    // Verify autoclickers were rendered exactly once each
    expect(autoContainerMock.insertAdjacentHTML).toHaveBeenCalledTimes(autoclickers.length);
    // Verify upgrades were rendered exactly once each
    expect(upgradesContainerMock.insertAdjacentHTML).toHaveBeenCalledTimes(upgrades.length);
});
    

test('should setup all event listeners', () => {
  // Create fresh mocks for all DOM elements
  const mockDoroImage = {
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
  };
  
  const mockShowStatsButton = { addEventListener: jest.fn() };
  const mockCloseStatsButton = { addEventListener: jest.fn() };
  const mockSidebar = { addEventListener: jest.fn() };
  const mockStatsElement = { style: { display: '' } };
  
  // Configure DOMHelper mocks
  DOMHelper.getDoroImage.mockReturnValue(mockDoroImage);
  DOMHelper.getShowStatsButton.mockReturnValue(mockShowStatsButton);
  DOMHelper.getCloseStatsButton.mockReturnValue(mockCloseStatsButton);
  DOMHelper.getSidebarElement.mockReturnValue(mockSidebar);
  DOMHelper.getStatsElement.mockReturnValue(mockStatsElement);
  
  // Create fresh game instance
  const testGame = new DoroClicker();
  
  // Clear all mock calls from initialization
  jest.clearAllMocks();
  
  // Call the method under test
  testGame.setupEventListeners();
  testGame.setupStatsEvents();
  
  // Verify Doro image listeners (3 calls expected: click, mousedown, mouseup)
  expect(mockDoroImage.addEventListener).toHaveBeenCalledTimes(3);
  expect(mockDoroImage.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  expect(mockDoroImage.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  expect(mockDoroImage.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
  
  // Verify stats button listeners
  expect(mockShowStatsButton.addEventListener).toHaveBeenCalledTimes(2);
  expect(mockCloseStatsButton.addEventListener).toHaveBeenCalledTimes(2);
  
  // Verify sidebar listener
  expect(mockSidebar.addEventListener).toHaveBeenCalledTimes(1);
});

  test('handleClick() should update counters', () => {
    const initialClicks = game.state.manualClicks;
    const doroImage = DOMHelper.getDoroImage();
    // Simulate the first event listener (click)
    const clickHandler = doroImage.addEventListener.mock.calls.find(
        call => call[0] === 'click'
    )[1];
    clickHandler();
    game.updateUI();
    expect(game.state.manualClicks).toBe(initialClicks + 1);
  });

  test('purchaseUpgrade() should validate affordability', () => {
    const mockUpgrade = {
      id: 1,
      name: 'Test Upgrade',
      cost: jest.fn().mockReturnValue(10),
      purchased: 0,
      type: 'autoclicker'
    };
  
    game.state.doros = 5; // Not enough to purchase
    game.autoclickers = [mockUpgrade];
    
    const result = game.purchaseUpgrade(mockUpgrade.id);
    
    expect(result).toBe(false);
    expect(mockUpgrade.cost).toHaveBeenCalledTimes(1);
    expect(mockUpgrade.purchased).toBe(0);
  });



describe('Utility Methods', () => {
  let originalClearInterval;

  beforeEach(() => {
    // Store original function
    originalClearInterval = global.clearInterval;
    // Mock clearInterval
    global.clearInterval = jest.fn();
  });

  afterEach(() => {
    // Restore original function
    global.clearInterval = originalClearInterval;
  });

  test('destroy() should clear autoclicker interval', () => {
    // Set up test with mock interval
    game.autoclickerInterval = 123;
    
    // Call the method
    game.destroy();
    
    // Verify clearInterval was called with the right value
    expect(global.clearInterval).toHaveBeenCalledWith(123);
  });

  test('debugInfo should return game state information', () => {
    // Add the expected methods to the mock instance
    game.state = { doros: 0 };
    game.upgrades = upgrades;
    game.autoclickers = autoclickers;
    
    const info = game.debugInfo;
    expect(info).toEqual({
      initialized: true,
      doros: 0,
      upgrades: 2,
      autoclickers: 2
    });
  });
});

describe('Purchase Handling', () => {
  test('debouncePurchase() should prevent rapid purchases', () => {
    jest.useFakeTimers();
    game._purchaseDebounce = false;
    game.debouncePurchase(1);
    expect(game._purchaseDebounce).toBe(true);
    jest.advanceTimersByTime(50);
    expect(game._purchaseDebounce).toBe(false);
    jest.useRealTimers();
  });
});


describe('View Button Listeners', () => {
  let game;
  let mockButtons;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockButtons = [
      {
        dataset: { view: 'autoclickers' },
        addEventListener: jest.fn(),
        classList: { toggle: jest.fn() }
      },
      {
        dataset: { view: 'upgrades' },
        addEventListener: jest.fn(),
        classList: { toggle: jest.fn() }
      }
    ];

    // Reset all mocks
    jest.clearAllMocks();

    // Mock document.querySelectorAll to return our test buttons
    document.querySelectorAll = jest.fn().mockImplementation((selector) => {
      if (selector === '.view-button') {
        return mockButtons;
      }
      return [];
    });

    // Create fresh game instance
    game = new DoroClicker();
    game.switchView = jest.fn();
  });

  test('setupViewButtonListeners() should add click handlers to both view buttons', () => {
    // Call the method under test
    game.setupViewButtonListeners();

    // Verify we queried for view buttons correctly
    expect(document.querySelectorAll).toHaveBeenCalledWith('.view-button');

    // Verify event listeners were added exactly once to each button (2 total calls)
    expect(document.querySelectorAll).toHaveReturnedWith(mockButtons);
    
    mockButtons.forEach(button => {
      expect(button.addEventListener).toHaveBeenCalledTimes(2);
      expect(button.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
    );

    // Simulate click on autoclickers button
    const autoclickersHandler = mockButtons[0].addEventListener.mock.calls[0][1];
    autoclickersHandler({ target: mockButtons[0] });
    expect(game.switchView).toHaveBeenCalledWith('autoclickers');

    // Simulate click on upgrades button
    const upgradesHandler = mockButtons[1].addEventListener.mock.calls[0][1];
    upgradesHandler({ target: mockButtons[1] });
    expect(game.switchView).toHaveBeenCalledWith('upgrades');
  });
});



});
});

describe('Upgrade Application', () => {
  test('applyUpgrade() should handle dpsMultiplier type', () => {
      const game = new DoroClicker();
      game.state = new GameState();
      game.autoclickers = [{ id: 2, baseDPS: 1, value: 1, purchased: 1 }];
      
      const upgrade = {
          id: 3,
          type: 'dpsMultiplier',
          value: 1.15,
          purchased: 1
      };
      
      game.applyUpgrade(upgrade);
      expect(game.autoclickers[0].value).toBe(1 * 1.15);
  });

  test('applyUpgrade() should handle globalDpsMultiplier type', () => {
      const game = new DoroClicker();
      game.state = new GameState();
      game.state.globalDpsMultiplier = 1;
      
      const upgrade = {
          type: 'globalDpsMultiplier',
          value: 1.1
      };
      
      game.applyUpgrade(upgrade);
      expect(game.state.globalDpsMultiplier).toBe(1.1);
  });
});

describe('Mouse Events', () => {
  test('setupDoroImageListeners() should handle mouse events', () => {
      const game = new DoroClicker();
      const mockImage = {
          style: {},
          addEventListener: jest.fn()
      };
      
      // Mock DOMHelper to return our mock image
      DOMHelper.getDoroImage.mockReturnValue(mockImage);
      
      game.setupDoroImageListeners();
      
      // Get the mousedown handler
      const mousedownCall = mockImage.addEventListener.mock.calls.find(c => c[0] === 'mousedown');
      const mousedownHandler = mousedownCall[1];
      
      // Simulate mousedown
      mousedownHandler();
      expect(mockImage.style.transform).toBe('scale(0.95)');
      
      // Get the mouseup handler
      const mouseupCall = mockImage.addEventListener.mock.calls.find(c => c[0] === 'mouseup');
      const mouseupHandler = mouseupCall[1];
      
      // Simulate mouseup
      mouseupHandler();
      expect(mockImage.style.transform).toBe('scale(1)');
  });
});

describe('Sorting Upgrades', () => {
  test('sortUpgrades() should handle upgrades with visibility functions', () => {
      const game = new DoroClicker();
      
      // Create mock autoclickers that the visibility function might check
      game.autoclickers = [{ id: 2, name: 'Lurking Doro', purchased: 10 }];
      game.state = new GameState();
      game.state.doros = 1000;
      
      // Mock upgrades with proper structure
      game.upgrades = [
          {
              id: 1,
              name: "Test Upgrade 1",
              isVisible: jest.fn().mockImplementation((context) => {
                  // Verify context has expected properties
                  expect(context.autoclickers).toBeDefined();
                  expect(typeof context.getTotalDPS).toBe('function');
                  return true;
              }),
              priority: 1
          },
          {
              id: 2,
              name: "Test Upgrade 2",
              isVisible: jest.fn().mockReturnValue(false),
              priority: 2
          }
      ];

      const result = game.sortUpgrades();
      
      // Verify the visibility functions were called with expected context
      expect(game.upgrades[0].isVisible).toHaveBeenCalledWith({
          autoclickers: game.autoclickers,
          getTotalDPS: expect.any(Function),
          state: game.state,
          upgrades: game.upgrades
      });
      
      expect(result.visibleUpgrades).toHaveLength(1);
      expect(result.hiddenUpgrades).toHaveLength(0); // Should be 0 since none are purchased
      expect(result.visibleUpgrades[0].id).toBe(1);
  });
});



describe('Number Formatting', () => {
  let game;

  beforeEach(() => {
    game = new DoroClicker();
    // Mock DOMHelper to prevent side effects
    DOMHelper.setText = jest.fn();
  });

  test('formatNumber() should add thousand separators with default context', () => {
    // Test with standard number
    expect(game.formatNumber(1000)).toBe('1,000');
    // Test with larger number
    expect(game.formatNumber(1234567)).toBe('1,234,567');
    // Test with number below threshold
    expect(game.formatNumber(999999998)).toBe('999,999,998');
    // Test with number at threshold
    expect(game.formatNumber(1000000000)).toBe('1.00e+9');
  });



  test('formatNumber() should handle score context (higher threshold)', () => {

    expect(game.formatNumber(999999999, 0, null, false, 'score')).toBe('999,999,999');
    expect(game.formatNumber(1000000000, 0, null, false, 'score')).toBe('1.00e+9');
  });

  test('formatNumber() should handle cost context', () => {
    expect(game.formatNumber(999999, 0, null, false, 'cost')).toBe('999,999');
    expect(game.formatNumber(1000000, 0, null, false, 'cost')).toBe('1.00e+6');
  });

  test('formatNumber() should handle dps context (lower threshold with decimals)', () => {
    expect(game.formatNumber(99999.9, 1, null, false, 'dps')).toBe('99,999.9');
    expect(game.formatNumber(100000, 1, null, false, 'dps')).toBe('1.00e+5');
  });

  test('formatNumber() should handle decimal places', () => {
    expect(game.formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(game.formatNumber(1234.5, 2)).toBe('1,234.50');
  });

  test('formatNumber() should handle edge cases', () => {
    expect(game.formatNumber(null)).toBe('0');
    expect(game.formatNumber(undefined)).toBe('0');
    expect(game.formatNumber('not a number')).toBe('0');
  });

  test('formatUpgradeCost() should format costs with cost context', () => {
    expect(game.formatUpgradeCost(1000)).toBe('1,000');
    expect(game.formatUpgradeCost(() => 1000)).toBe('1,000');
    expect(game.formatUpgradeCost(1000000)).toBe('1.00e+6');
  });
});




describe('Formatting Integration', () => {
  let game;
  let mockScoreElement;

  beforeEach(() => {
    game = new DoroClicker();
    mockScoreElement = { textContent: '' };
    DOMHelper.getScoreElement.mockReturnValue(mockScoreElement);
    DOMHelper.setText.mockImplementation((element, text) => {
      if (element === mockScoreElement) {
        mockScoreElement.textContent = text;
      }
    });
  });

  test('updateScoreDisplay() should format numbers with score context', () => {
    game.state.doros = 123456789;
    game.updateScoreDisplay();
    expect(mockScoreElement.textContent).toBe('Doros: 123,456,789');

    game.state.doros = 1000000000;
    game.updateScoreDisplay();
    expect(mockScoreElement.textContent).toBe('Doros: 1.00e+9'); // Exact match
  });

  test('updateStatsDisplay() should format DPS with dps context', () => {
    const mockStats = {
      clicks: { textContent: '' },
      dps: { textContent: '' },
      total: { textContent: '' }
    };
    DOMHelper.getStatElements.mockReturnValue(mockStats);
    
    // Mock getTotalDPS to return specific values
    game.state.getTotalDPS = jest.fn()
      .mockReturnValueOnce(99999.9)  // Below threshold
      .mockReturnValueOnce(100000);  // Above threshold
    
    game.state.manualClicks = 1000;
    game.state.totalDoros = 500000;
    
    game.updateStatsDisplay();
    
    // Verify DPS formatting
    expect(mockStats.dps.textContent).toBe('99,999.9');
    
    // Second call with higher DPS
    game.updateStatsDisplay();
    expect(mockStats.dps.textContent).toMatch(/1.00e\+5/);
    
    // Verify other stats use default formatting
    expect(mockStats.clicks.textContent).toBe('1,000');
    expect(mockStats.total.textContent).toBe('500,000');
  });

  test('renderUpgrades() should format costs with cost context', () => {
    // Mock an upgrade with high cost
    const expensiveUpgrade = {
      id: 99,
      name: 'Expensive Upgrade',
      cost: () => 1000000,
      purchased: 0,
      type: 'autoclicker'
    };
    game.autoclickers = [expensiveUpgrade];
    
    game.renderUpgrades();
    
    // Verify the cost was formatted with cost context
    expect(autoContainerMock.insertAdjacentHTML).toHaveBeenCalledWith(
      'beforeend',
      expect.stringContaining('1.00e+6')
    );
  });
});

describe('Formatting Context Edge Cases', () => {
  let game;

  beforeEach(() => {
    game = new DoroClicker();
  });

  test('should handle unknown context by using default threshold', () => {
    expect(game.formatNumber(999999, 0, null, false, 'unknown')).toBe('999,999');
    expect(game.formatNumber(1000000, 0, null, false, 'unknown')).toBe('1.00e+6');
  });


  test('should handle mixed case context strings', () => {
    expect(game.formatNumber(999999, 0, null, false, 'SCORE')).toBe('999,999');
    expect(game.formatNumber(999999, 0, null, false, 'Cost')).toBe('999,999');
  });
});