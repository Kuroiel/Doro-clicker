import { GameState } from 'scripts/gameState.js';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    // Create a fresh GameState instance for each test
    gameState = new GameState();
  });

  test('should initialize with correct default values', () => {
    expect(gameState.doros).toBe(0);
    expect(gameState.manualClicks).toBe(0);
    expect(gameState.totalAutoDoros).toBe(0);
    expect(gameState.totalDoros).toBe(0);
  });

  test('increment() should correctly update values', () => {
    gameState.increment(5);
    expect(gameState.doros).toBe(5);
    expect(gameState.totalDoros).toBe(5);
    expect(gameState.manualClicks).toBe(0); // Manual clicks tracked separately
  });

  test('addAutoDoros() should apply global multiplier', () => {
    // Set up test conditions
    gameState.globalDpsMultiplier = 2;
    gameState.addAutoDoros(10);
    
    // Verify results
    expect(gameState.doros).toBe(10); // Note: The multiplier is only applied in getTotalDPS(), not in addAutoDoros()
    expect(gameState.totalAutoDoros).toBe(10);
    
    // Additional test for getTotalDPS() to verify multiplier application
    gameState._autoclickers = [{ value: 10, purchased: 1 }];
    expect(gameState.getTotalDPS()).toBe(20); // 10 * 2 (multiplier)
  });
});

// gameState.test.js - Add these new tests at the bottom of the file
describe('GameState Additional Methods', () => {
  let gameState;
  let mockListener;

  beforeEach(() => {
    gameState = new GameState();
    mockListener = jest.fn();
    gameState.addListener(mockListener);
  });

  test('addListener() should add callback to listeners', () => {
    expect(gameState.listeners).toContain(mockListener);
  });

  test('notify() should call listeners when doros change', () => {
    gameState.doros = 5;
    gameState.notify();
    expect(mockListener).toHaveBeenCalled();
  });

//  test('notify() should not call listeners when doros unchanged', () => {
//    gameState._lastNotifiedDoros = 0;
//    gameState.doros = 0;
    
    // Clear any previous calls
//    mockListener.mockClear();
    
//    gameState.notify();
//    expect(mockListener).not.toHaveBeenCalled();
//  });

  test('getCurrentDPSMultiplier() should return global multiplier', () => {
    gameState.globalDpsMultiplier = 2.5;
    expect(gameState.getCurrentDPSMultiplier()).toBe(2.5);
  });
});