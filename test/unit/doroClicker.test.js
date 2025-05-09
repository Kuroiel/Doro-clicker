
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

    // 1. Initialize ALL mock elements FIRST
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

    // 2. Configure DOMHelper mocks AFTER initializing elements
    DOMHelper.getAutoclickersContainer.mockReturnValue(autoContainerMock);
    DOMHelper.getUpgradesContainer.mockReturnValue(upgradesContainerMock);
    DOMHelper.getSidebarElement.mockReturnValue(mockSidebar);
    DOMHelper.getViewButtons.mockReturnValue(mockViewButtons);
    DOMHelper.getUpgradeViews.mockReturnValue(mockUpgradeViews);
    DOMHelper.toggleClass.mockImplementation((el, className, condition) => {
      if (el) el.classList.toggle(className, condition);
    });

    // 3. Create game instance LAST after mocks are ready
    game = new DoroClicker();
    game.state = new GameState();
    game.state.setAutoclickers(autoclickers);


    // 4. Initialize console.warn spy
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
    autoContainerMock.insertAdjacentHTML.mockClear();
    upgradesContainerMock.insertAdjacentHTML.mockClear();

    game.renderUpgrades();
    
    
    // Verify autoclickers were rendered
    expect(autoContainerMock.insertAdjacentHTML).toHaveBeenCalledTimes(autoclickers.length);
    // Verify upgrades were rendered
    expect(upgradesContainerMock.insertAdjacentHTML).toHaveBeenCalledTimes(upgrades.length);
});
    

  test('should render upgrade buttons with correct content', () => {
    game.renderUpgrades();
    
    // Get the first call's arguments
    const firstCallArgs = autoContainerMock.insertAdjacentHTML.mock.calls[0];
    
    // Verify it contains expected upgrade data
    expect(firstCallArgs[1]).toContain('upgrade-button');
    expect(firstCallArgs[1]).toContain('Doros');
  });

  test('should setup all event listeners', () => {
    const doroImage = DOMHelper.getDoroImage();
    const showStatsButton = DOMHelper.getShowStatsButton();
    const closeStatsButton = DOMHelper.getCloseStatsButton();
    const sidebar = DOMHelper.getSidebarElement();
  // Reset mock counters for accurate assertions
  doroImage.addEventListener.mockClear();
  sidebar.addEventListener.mockClear();
  showStatsButton.addEventListener.mockClear();
  closeStatsButton.addEventListener.mockClear();

  game.setupEventListeners();
  game.setupStatsEvents();

    
  // Verify Doro image listeners (3 calls expected)
  expect(doroImage.addEventListener).toHaveBeenCalledTimes(3); // click, mousedown, mouseup
    
    // Debug: Log specific event types if needed
    const clickListeners = doroImage.addEventListener.mock.calls
        .filter(call => call[0] === 'click').length;
  
    
    expect(showStatsButton.addEventListener).toHaveBeenCalledTimes(1);
    expect(closeStatsButton.addEventListener).toHaveBeenCalledTimes(1);
    
    // Verify upgrade button listeners
    expect(sidebar.addEventListener).toHaveBeenCalledTimes(1);
    expect(sidebar.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function)
    );
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
    // Create a proper mock upgrade with cost function
    const mockUpgrade = {
      id: 1,
      name: 'Test Upgrade',
      cost: jest.fn().mockReturnValue(10), // Mock cost function
      purchased: 0,
      type: 'autoclicker'
    };
  
    // Set up spies before creating game instance
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Create fresh game instance with isolated state
    const localGame = new DoroClicker();
    localGame.state = new GameState();
    localGame.state.setAutoclickers([mockUpgrade]);
    localGame.state.doros = mockUpgrade.cost() - 1; // Set just below cost
    
    // Perform the test
    const result = localGame.purchaseUpgrade(mockUpgrade.id);
    
    // Verify expectations
    expect(result).toBe(false);
    expect(mockUpgrade.purchased).toBe(0);
 //   expect(debugSpy).toHaveBeenCalledWith('Purchase prevented - revalidation failed');
    expect(mockUpgrade.cost).toHaveBeenCalledTimes(1);
    
    // Clean up
    debugSpy.mockRestore();
  });



describe('Utility Methods', () => {
  test('destroy() should clear autoclicker interval', () => {
    global.clearInterval = jest.fn();
    game.autoclickerInterval = 123; // Set a mock interval ID
    game.destroy();
    expect(clearInterval).toHaveBeenCalledWith(123);
  });

  test('debugInfo should return game state information', () => {
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