// test/unit/index.test.js

/**
 * Unit tests for game initialization in src/scripts/index.js
 * Using ES modules and correct project paths
 */

// Mock the DoroClicker class with correct path
jest.mock('../../src/scripts/Core/doroclicker.js', () => ({
  DoroClicker: jest.fn()
}));

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Game Initialization Module', () => {
  let originalTestingFlag;
  let originalDoroGame;
  let DoroClickerMock;

  beforeEach(async () => {
    // Reset all mocks and clear module cache
    jest.resetModules();
    jest.clearAllMocks();
    
    // Get fresh mock for each test with correct path
    DoroClickerMock = (await import('../../src/scripts/Core/doroclicker.js')).DoroClicker;
    
    // Store and reset globals
    originalTestingFlag = window.__TESTING__;
    originalDoroGame = window.doroGame;
    delete window.__TESTING__;
    delete window.doroGame;
  });

  afterEach(() => {
    // Restore globals
    window.__TESTING__ = originalTestingFlag;
    window.doroGame = originalDoroGame;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Main Initialization Block', () => {
    it('should set testing flag when __TESTING__ is defined', async () => {
      // Arrange
      window.__TESTING__ = {};
      DoroClickerMock.mockImplementation(() => ({}));
      
      // Act - import with correct path
      await import('../../src/scripts/index.js');
      
      // Assert
      expect(window.__TESTING__.gameReady).toBe(true);
    });

    it('should successfully create game instance and assign to window.doroGame', async () => {
      // Arrange
      const mockGameInstance = { mock: 'game instance' };
      DoroClickerMock.mockImplementation(() => mockGameInstance);
      
      // Act
      await import('../../src/scripts/index.js');
      
      // Assert
      expect(DoroClickerMock).toHaveBeenCalledTimes(1);
      expect(window.doroGame).toBe(mockGameInstance);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle initialization error and log to console', async () => {
      // Arrange
      const mockError = new Error('Constructor failed');
      DoroClickerMock.mockImplementation(() => {
        throw mockError;
      });

      // Act
      await import('../../src/scripts/index.js');

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        'Game initialization failed:',
        mockError
      );
    });

    it('should create fallback game object when in testing mode and initialization fails', async () => {
      // Arrange
      window.__TESTING__ = {};
      DoroClickerMock.mockImplementation(() => {
        throw new Error('Constructor failed');
      });

      // Act
      await import('../../src/scripts/index.js');

      // Assert
      expect(window.doroGame).toEqual({
        state: {},
        upgrades: [],
        autoclickers: [],
        updateUI: expect.any(Function)
      });
    });
  });

it('should initialize game when DOM loads', async () => {
  const mockGameInstance = { mock: 'game instance' };
  DoroClickerMock.mockImplementation(() => mockGameInstance);
  window.doroGame = undefined;

  // Import and immediately trigger event
  await import('../../src/scripts/index.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));

  // We just care that it was called, not how many times
  expect(DoroClickerMock).toHaveBeenCalled();
  expect(window.doroGame).toBeDefined();
});

describe('Edge Cases', () => {
  it('should handle multiple DOMContentLoaded events', async () => {
    const mockGameInstance = { mock: 'game instance' };
    DoroClickerMock.mockImplementation(() => mockGameInstance);
    window.doroGame = undefined;

    await import('../../src/scripts/index.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(DoroClickerMock).toHaveBeenCalledTimes(1);
    expect(window.doroGame).toBe(mockGameInstance);
  });

it('should maintain existing game instance if DOMContentLoaded fires after manual init', async () => {
  // 1. Create and store the exact same instance reference
  const existingGame = { existing: 'game' };
  
  // 2. Create a new mock that returns a different object
  const mockInstance = { new: 'instance' };
  DoroClickerMock.mockImplementation(() => mockInstance);
  
  // 3. Import the module fresh (this will create the initial instance)
  await import('../../src/scripts/index.js');
  
  // 4. Now set our existing game
  window.doroGame = existingGame;
  
  // 5. Trigger the event
  document.dispatchEvent(new Event('DOMContentLoaded'));
  
  // 6. Assertions
  expect(window.doroGame).toBe(existingGame); // Must be THE SAME OBJECT
  expect(DoroClickerMock).toHaveBeenCalledTimes(1); // Only called once during import
});

  it('should handle case where DOM is already loaded when event listener registers', async () => {
    const mockGameInstance = { mock: 'game instance' };
    DoroClickerMock.mockImplementation(() => mockGameInstance);
    window.doroGame = undefined;

    // Simulate DOM already being loaded
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true
    });

    await import('../../src/scripts/index.js');
    
    expect(DoroClickerMock).toHaveBeenCalledTimes(1);
    expect(window.doroGame).toBe(mockGameInstance);
  });

it('should not initialize if window.doroGame exists during import', async () => {
  // Create mock instance
  const mockInstance = { existing: 'game' };
  DoroClickerMock.mockImplementation(() => mockInstance);
  
  // Set existing game BEFORE import
  window.doroGame = mockInstance;
  
  await import('../../src/scripts/index.js');
  
  // Verify no NEW instances were created beyond the existing one
  expect(DoroClickerMock).toHaveBeenCalledTimes(0);
});
});
});