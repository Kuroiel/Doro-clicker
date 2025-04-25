import { DoroClicker } from 'scripts/app.js';
import { GameState } from 'scripts/gameState.js';
import { autoclickers } from 'scripts/autoclickers.js';

// Mock dependencies
jest.mock('../src/scripts/dom.js', () => ({
  DOMHelper: {
    getScoreElement: jest.fn(),
    setText: jest.fn(),
    // Add other mocked methods as needed
  }
}));

describe('DoroClicker', () => {
  let game;

  beforeEach(() => {
    game = new DoroClicker();
    game.state = new GameState();
  });

  test('handleClick() should update counters', () => {
    const initialClicks = game.state.manualClicks;
    game.handleClick();
    expect(game.state.manualClicks).toBe(initialClicks + 1);
  });

  test('purchaseUpgrade() should validate affordability', () => {
    const upgrade = autoclickers[0];
    game.state.doros = upgrade.cost() - 1; // Set just below cost
    const result = game.purchaseUpgrade(upgrade.id);
    expect(result).toBe(false);
    expect(upgrade.purchased).toBe(0);
  });
});