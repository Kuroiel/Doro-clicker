import { GameState } from 'scripts/gameState.js';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  test('should initialize with correct default values', () => {
    expect(gameState.doros).toBe(0);
    expect(gameState.autoclickers).toBe(0);
    expect(gameState.manualClicks).toBe(0);
  });

  test('increment() should correctly update values', () => {
    gameState.increment(5);
    expect(gameState.doros).toBe(5);
    expect(gameState.totalDoros).toBe(5);
    expect(gameState.manualClicks).toBe(0); // Manual clicks tracked separately
  });

  test('addAutoDoros() should apply global multiplier', () => {
    gameState.globalDpsMultiplier = 2;
    gameState.addAutoDoros(10);
    expect(gameState.doros).toBe(20);
    expect(gameState.totalAutoDoros).toBe(20);
  });
});