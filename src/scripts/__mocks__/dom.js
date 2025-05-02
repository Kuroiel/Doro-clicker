// dom.js
const createMockElement = () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  style: {},
  classList: { 
    add: jest.fn(), 
    remove: jest.fn(), 
    toggle: jest.fn() 
  },
  closest: jest.fn(),
  dataset: {},
  innerHTML: '',
  insertAdjacentHTML: jest.fn(),
  appendChild: jest.fn(),
  querySelector: jest.fn(() => createMockElement()),
  getBoundingClientRect: jest.fn(() => ({ 
    width: 100, 
    height: 100 
  })),
});

// Singleton instances
let doroImageInstance = null;
let autoContainerInstance = null;
let upgradesContainerInstance = null;
let sidebarInstance = null;
let showStatsButtonInstance = null;
let closeStatsButtonInstance = null;

const getSingleton = (creator) => () => {
  if (!creator.instance) {
    creator.instance = createMockElement();
  }
  return creator.instance;
};

export const DOMHelper = {
  // Core elements with singleton pattern
  getDoroImage: jest.fn(getSingleton(() => doroImageInstance)),
  getAutoclickersContainer: jest.fn(getSingleton(() => autoContainerInstance)),
  getUpgradesContainer: jest.fn(getSingleton(() => upgradesContainerInstance)),
  getSidebarElement: jest.fn(getSingleton(() => sidebarInstance)),
  getShowStatsButton: jest.fn(getSingleton(() => showStatsButtonInstance)),
  getCloseStatsButton: jest.fn(getSingleton(() => closeStatsButtonInstance)),

  // Other elements
  getScoreElement: jest.fn(() => createMockElement()),
  getStatElements: jest.fn(() => ({
    clicks: createMockElement(),
    dps: createMockElement(),
    total: createMockElement()
  })),
  getStatsElement: jest.fn(createMockElement),
  getUpgradeButtons: jest.fn(() => [createMockElement()]),
  
  // View elements
  getViewButtons: jest.fn(() => [
    { 
      dataset: { view: 'autoclickers' }, 
      classList: { toggle: jest.fn() } 
    },
    { 
      dataset: { view: 'upgrades' }, 
      classList: { toggle: jest.fn() } 
    }
  ]),
  
  getUpgradeViews: jest.fn(() => [
    { 
      id: 'autoclickers-container', 
      classList: { toggle: jest.fn() } 
    },
    { 
      id: 'upgrades-container', 
      classList: { toggle: jest.fn() } 
    }
  ]),

  // Utility methods
  setText: jest.fn(),
  toggleVisibility: jest.fn(),
  addClass: jest.fn(),
  removeClass: jest.fn(),
  toggleClass: jest.fn((element, className, condition) => {
    if (element) element.classList.toggle(className, condition);
  })
};

// Reset function for test cleanup
export const resetDOMMocks = () => {
  doroImageInstance = null;
  autoContainerInstance = null;
  upgradesContainerInstance = null;
  sidebarInstance = null;
  showStatsButtonInstance = null;
  closeStatsButtonInstance = null;
};

module.exports = { DOMHelper, resetDOMMocks };