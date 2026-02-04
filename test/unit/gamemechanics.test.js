import { GameMechanics } from "../../src/scripts/Core/gamemechanics.js";

describe("GameMechanics", () => {
  let mockGame;
  let mechanics;

  const raf = global.requestAnimationFrame;
  beforeAll(() => {
    global.requestAnimationFrame = (cb) => cb();
  });
  afterAll(() => {
    global.requestAnimationFrame = raf;
  });

  beforeEach(() => {
    // Reset mocks before each test
    mockGame = {
      state: {
        manualClicks: 0,
        doros: 1000,
        increment: jest.fn(),
        notify: jest.fn(),
        globalDpsMultiplier: 1,
      },
      autoclickers: [
        {
          id: 2,
          purchased: 0,
          baseDPS: 1,
          value: 1,
          targetAutoclickerId: 2,
          get cost() {
            return 10;
          },
        },
      ],
      upgrades: [
        {
          id: 1,
          type: "clickMultiplier",
          value: 1,
          purchased: 0,
          get cost() {
            return 10;
          },
        },
        {
          id: 3,
          type: "dpsMultiplier",
          value: 1.15,
          purchased: 0,
          targetAutoclickerId: 2,
          get cost() {
            return 100;
          },
        },
        {
          id: 5,
          type: "globalDpsMultiplier",
          value: 1.1,
          purchased: 0,
          get cost() {
            return 200;
          },
        },
      ],
      ui: {
        refreshUpgradeButton: jest.fn(),
      },
      autoclickerSystem: {
        recalculateDPS: jest.fn(),
      },
      modifierSystem: {
        apply: jest.fn((base) => base),
        recalculate: jest.fn(),
      },
    };
    mechanics = new GameMechanics(mockGame);
  });

  describe("handleClick", () => {
    it("should increment manual clicks and game state, then notify", () => {
      // Mock modifier system return value
      mockGame.modifierSystem.apply.mockReturnValue(5);
      
      mechanics.handleClick();
      
      expect(mockGame.state.manualClicks).toBe(1);
      expect(mockGame.modifierSystem.apply).toHaveBeenCalledWith(1, "player", "click");
      expect(mockGame.state.increment).toHaveBeenCalledWith(5);
      expect(mockGame.state.notify).toHaveBeenCalledTimes(1);
    });
  });

  describe("purchaseUpgrade", () => {
    it("should successfully purchase an upgrade", () => {
      const initialDoros = mockGame.state.doros;
      const upgrade = mockGame.upgrades[0];

      const result = mechanics.purchaseUpgrade(upgrade.id);

      expect(result).toBe(true);
      expect(upgrade.purchased).toBe(1);
      expect(mockGame.state.doros).toBe(initialDoros - upgrade.cost);
      expect(mockGame.modifierSystem.recalculate).toHaveBeenCalled();
      expect(mockGame.autoclickerSystem.recalculateDPS).toHaveBeenCalled();
      expect(mockGame.state.notify).toHaveBeenCalledTimes(1);
      expect(mockGame.ui.refreshUpgradeButton).toHaveBeenCalledWith(upgrade.id);
    });

    it("should return false if upgrade is not affordable", () => {
      mockGame.state.doros = 5;
      const result = mechanics.purchaseUpgrade(1);
      expect(result).toBe(false);
      expect(mockGame.modifierSystem.recalculate).not.toHaveBeenCalled();
      expect(mockGame.state.notify).not.toHaveBeenCalled();
    });

    it("should return false if upgrade does not exist", () => {
      const result = mechanics.purchaseUpgrade(999);
      expect(result).toBe(false);
    });
  });
});
