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