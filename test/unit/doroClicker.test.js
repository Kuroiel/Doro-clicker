// At the top of doroClicker.test.js
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
  // Add debug message suppression
  const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  
  const upgrade = autoclickers[0];
  game.state.doros = upgrade.cost() - 1;
  const result = game.purchaseUpgrade(upgrade.id);
  
  expect(result).toBe(false);
  expect(upgrade.purchased).toBe(0);
  
  // Cleanup spy
  debugSpy.mockRestore();
  });
});