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
    };
    mechanics = new GameMechanics(mockGame);
  });

  describe("handleClick", () => {
    it("should increment manual clicks and game state, then notify", () => {
      mechanics.handleClick();
      expect(mockGame.state.manualClicks).toBe(1);
      expect(mockGame.state.increment).toHaveBeenCalledWith(
        mechanics.clickMultiplier
      );
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
      expect(mockGame.state.notify).toHaveBeenCalledTimes(1);
      expect(mockGame.ui.refreshUpgradeButton).toHaveBeenCalledWith(upgrade.id);
    });

    it("should return false if upgrade is not affordable", () => {
      mockGame.state.doros = 5;
      const result = mechanics.purchaseUpgrade(1);
      expect(result).toBe(false);
      expect(mockGame.state.notify).not.toHaveBeenCalled();
    });

    it("should return false if upgrade does not exist", () => {
      const result = mechanics.purchaseUpgrade(999);
      expect(result).toBe(false);
    });
  });

  describe("applyUpgrade", () => {
    it("should trigger recalculateClickMultiplier for 'clickMultiplier' type", () => {
      mechanics.recalculateClickMultiplier = jest.fn();
      mechanics.applyUpgrade(mockGame.upgrades[0]);
      expect(mechanics.recalculateClickMultiplier).toHaveBeenCalledTimes(1);
    });

    it("should trigger recalculateDpsForAutoclicker for 'dpsMultiplier' type", () => {
      mechanics.recalculateDpsForAutoclicker = jest.fn();
      mechanics.applyUpgrade(mockGame.upgrades[1]);
      expect(mechanics.recalculateDpsForAutoclicker).toHaveBeenCalledWith(2);
    });

    it("should trigger recalculateGlobalDpsMultiplier for 'globalDpsMultiplier' type", () => {
      mechanics.recalculateGlobalDpsMultiplier = jest.fn();
      mechanics.applyUpgrade(mockGame.upgrades[2]);
      expect(mechanics.recalculateGlobalDpsMultiplier).toHaveBeenCalledTimes(1);
    });
  });

  describe("Recalculation methods", () => {
    it("recalculateClickMultiplier should sum up bonuses correctly", () => {
      const doroPower = mockGame.upgrades.find((u) => u.id === 1);
      doroPower.purchased = 2; // Purchase 2 levels
      mechanics.recalculateClickMultiplier();
      // Base 1 + (value 1 * purchased 2) = 3
      expect(mechanics.clickMultiplier).toBe(3);
    });

    it("recalculateDpsForAutoclicker should apply multipliers correctly", () => {
      const dpsUpgrade = mockGame.upgrades.find((u) => u.id === 3);
      dpsUpgrade.purchased = 2;
      mechanics.recalculateDpsForAutoclicker(2);
      const autoclicker = mockGame.autoclickers.find((a) => a.id === 2);
      expect(autoclicker.value).toBeCloseTo(1 * Math.pow(1.15, 2));
      expect(mockGame.autoclickerSystem.recalculateDPS).toHaveBeenCalled();
    });

    it("recalculateGlobalDpsMultiplier should update state correctly", () => {
      const globalUpgrade = mockGame.upgrades.find((u) => u.id === 5);
      globalUpgrade.purchased = 1;
      mechanics.recalculateGlobalDpsMultiplier();
      expect(mockGame.state.globalDpsMultiplier).toBe(1.1);
    });
  });
});
