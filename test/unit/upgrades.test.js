// root/test/unit/upgrades.test.js

import { upgrades } from '../../src/scripts/Systems/upgrades.js';

describe('Upgrades', () => {
  // Mock game state for visibility tests
  const mockGameState = {
    autoclickers: [
      { id: 1, purchased: 0 },
      { id: 2, purchased: 0, value: 1 } // Lurking Doro
    ],
    getTotalDPS: jest.fn()
  };

  describe('Doro Power (id: 1)', () => {
    const upgrade = upgrades.find(u => u.id === 1);

    it('should have correct basic properties', () => {
      expect(upgrade.name).toBe('Doro Power');
      expect(upgrade.type).toBe('multiplier');
      expect(upgrade.baseCost).toBe(10);
      expect(upgrade.value).toBe(1);
      expect(upgrade.purchased).toBe(0);
      expect(upgrade.icon).toBe('./src/assets/dorostare.webp');
      expect(upgrade.description).toBe('More Doros?');
    });

    it('should calculate cost exponentially', () => {
      expect(upgrade.cost()).toBe(10); // 10 * 10^0
      upgrade.purchased = 1;
      expect(upgrade.cost()).toBe(100); // 10 * 10^1
      upgrade.purchased = 2;
      expect(upgrade.cost()).toBe(1000); // 10 * 10^2
    });

    it('should generate correct effect description', () => {
      upgrade.purchased = 3;
      const desc = upgrade.effectDescription(upgrade.value, upgrade.purchased);
      expect(desc).toContain('Increases Doros per click by 1');
      expect(desc).toContain('Currently increasing click power by 3');
      expect(desc).toContain('(3 × 1 per level)');
    });
  });

  describe('Lurking Doro Upgrade (id: 3)', () => {
    const upgrade = upgrades.find(u => u.id === 3);

    it('should have correct basic properties', () => {
      expect(upgrade.name).toBe('Lurking Doro Upgrade');
      expect(upgrade.type).toBe('dpsMultiplier');
      expect(upgrade.baseCost).toBe(500);
      expect(upgrade.value).toBe(1.15);
      expect(upgrade.purchased).toBe(0);
      expect(upgrade.icon).toBe('./src/assets/dorocreep.webp');
      expect(upgrade.description).toBe('Upgrade the Lurking Doros to lurk better.');
    });

    it('should use tiered cost system', () => {
      const costLevels = [500, 10000, 3000000, 10000000];
      
      // Test each tier
      for (let i = 0; i < costLevels.length; i++) {
        upgrade.purchased = i;
        expect(upgrade.cost()).toBe(costLevels[i]);
      }
      
      // Test beyond tiers (should use last tier)
      upgrade.purchased = costLevels.length;
      expect(upgrade.cost()).toBe(costLevels[costLevels.length - 1]);
    });

    it('should generate correct effect description', () => {
      upgrade.purchased = 2;
      const desc = upgrade.effectDescription(upgrade.value, upgrade.purchased);
      expect(desc).toContain('Increases the base DPS of Lurking Doros by 15%');
      expect(desc).toContain('Current multiplier: 1.32x'); // 1.15^2
    });

    describe('visibility conditions', () => {
      beforeEach(() => {
        mockGameState.autoclickers[1].purchased = 0;
        upgrade.purchased = 0;
      });

      it('should not be visible without any Lurking Doros', () => {
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });

      it('should not be visible before reaching first threshold', () => {
        mockGameState.autoclickers[1].purchased = 9; // Below first threshold (10)
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });

      it('should be visible when reaching first threshold', () => {
        mockGameState.autoclickers[1].purchased = 10;
        expect(upgrade.isVisible(mockGameState)).toBe(true);
      });

      it('should not be visible after max purchases', () => {
        upgrade.purchased = 4; // Max purchases (thresholds.length)
        mockGameState.autoclickers[1].purchased = 1000;
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });

      it('should require higher thresholds for subsequent purchases', () => {
        // First purchase (threshold 10)
        mockGameState.autoclickers[1].purchased = 10;
        upgrade.purchased = 0;
        expect(upgrade.isVisible(mockGameState)).toBe(true);
        
        // Second purchase (threshold 20)
        upgrade.purchased = 1;
        mockGameState.autoclickers[1].purchased = 19;
        expect(upgrade.isVisible(mockGameState)).toBe(false);
        
        mockGameState.autoclickers[1].purchased = 20;
        expect(upgrade.isVisible(mockGameState)).toBe(true);
      });
    });
  });

  describe('Motivating Doro (id: 5)', () => {
    const upgrade = upgrades.find(u => u.id === 5);

    it('should have correct basic properties', () => {
      expect(upgrade.name).toBe('Motivating Doro');
      expect(upgrade.type).toBe('globalDpsMultiplier');
      expect(upgrade.baseCost).toBe(10000);
      expect(upgrade.value).toBe(1.10);
      expect(upgrade.purchased).toBe(0);
      expect(upgrade.icon).toBe('./src/assets/dorowhip.webp');
      expect(upgrade.description).toBe('A "motivating" Doro to make all Doros work harder.');
    });

    it('should have fixed cost', () => {
      upgrade.purchased = 5; // Shouldn't affect cost
      expect(upgrade.cost()).toBe(10000);
    });

    it('should generate correct effect description', () => {
      const desc = upgrade.effectDescription();
      expect(desc).toBe('Adds 10% to the base value of all Doros');
    });

    describe('visibility conditions', () => {
      beforeEach(() => {
        mockGameState.getTotalDPS.mockReset();
        upgrade.purchased = 0;
      });

      it('should not be visible with insufficient DPS', () => {
        mockGameState.getTotalDPS.mockReturnValue(499);
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });

      it('should be visible with sufficient DPS', () => {
        mockGameState.getTotalDPS.mockReturnValue(500);
        expect(upgrade.isVisible(mockGameState)).toBe(true);
      });

      it('should not be visible after purchase', () => {
        mockGameState.getTotalDPS.mockReturnValue(1000);
        upgrade.purchased = 1;
        expect(upgrade.isVisible(mockGameState)).toBe(false);
      });
    });
  });

  // Test that all upgrades have required properties
  describe('All upgrades', () => {
    upgrades.forEach(upgrade => {
      it(`${upgrade.name} should have all required properties`, () => {
        expect(upgrade).toHaveProperty('id');
        expect(upgrade).toHaveProperty('name');
        expect(upgrade).toHaveProperty('type');
        expect(upgrade).toHaveProperty('baseCost');
        expect(upgrade).toHaveProperty('value');
        expect(upgrade).toHaveProperty('purchased');
        expect(upgrade).toHaveProperty('icon');
        expect(upgrade).toHaveProperty('description');
        expect(upgrade).toHaveProperty('effectDescription');
        expect(upgrade).toHaveProperty('cost');
        expect(typeof upgrade.cost).toBe('function');
      });
    });
  });
});