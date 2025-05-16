import { UpgradeRenderer } from 'scripts/upgradeRenderer.js';

describe('UpgradeRenderer', () => {
  const mockUpgrade = {
    id: 1,
    name: 'Test Upgrade',
    type: 'multiplier',
    baseCost: 10,
    value: 1,
    purchased: 0,
    icon: 'test-icon.png',
    description: 'Test description',
    effectDescription: 'Test effect',
    cost: () => 1000
  };

  const mockFormatter = (num) => num.toLocaleString();

  describe('renderFirstLine()', () => {
    test('should render with icon when available', () => {
      const result = UpgradeRenderer.renderFirstLine(mockUpgrade);
      expect(result).toContain('test-icon.png');
      expect(result).toContain('Test Upgrade');
    });

    test('should render without icon when not available', () => {
      const noIconUpgrade = {...mockUpgrade, icon: undefined};
      const result = UpgradeRenderer.renderFirstLine(noIconUpgrade);
      expect(result).not.toContain('img');
      expect(result).toContain('Test Upgrade');
    });
  });

  describe('renderSecondLine()', () => {
    test('should render cost and purchased count for autoclickers', () => {
      const autoclicker = {...mockUpgrade, type: 'autoclicker'};
      const result = UpgradeRenderer.renderSecondLine(autoclicker);
      expect(result).toContain('Cost: 1000 Doros'); // Changed from 10 to 1000
      expect(result).toContain('Owned: 0');
    });

    test('should only render cost for non-autoclickers', () => {
      const result = UpgradeRenderer.renderSecondLine(mockUpgrade);
      expect(result).toContain('Cost: 1000 Doros'); // Changed from 10 to 1000
      expect(result).not.toContain('Owned:');
    });

    test('should use formatter when provided', () => {
      const result = UpgradeRenderer.renderSecondLine(mockUpgrade, mockFormatter);
      expect(result).toContain('Cost: 1,000 Doros'); // Keep this expectation
    });

    test('should fallback to raw number without formatter', () => {
      const result = UpgradeRenderer.renderSecondLine(mockUpgrade);
      expect(result).toContain('Cost: 1000 Doros'); // Keep this expectation
    });
});

  describe('renderTooltip()', () => {
    test('should render description and formatted effect', () => {
      const result = UpgradeRenderer.renderTooltip(mockUpgrade);
      expect(result).toContain('Test description');
      expect(result).toContain('Test effect');
    });

    test('should handle function effectDescription', () => {
      const funcUpgrade = {
        ...mockUpgrade,
        effectDescription: () => 'Dynamic effect'
      };
      const result = UpgradeRenderer.renderTooltip(funcUpgrade);
      expect(result).toContain('Dynamic effect');
    });

    test('should format numbers in tooltip', () => {
      const valueUpgrade = {
        ...mockUpgrade,
        value: 1000,
        effectDescription: (val) => `Value: ${val}`
      };
      const result = UpgradeRenderer.renderTooltip(valueUpgrade, mockFormatter);
      expect(result).toContain('Value: 1,000');
    });
  });

  describe('renderUpgradeButton()', () => {
    test('should render complete button with all components', () => {
      const result = UpgradeRenderer.renderUpgradeButton(mockUpgrade, true);
      expect(result).toContain('upgrade-button');
      expect(result).toContain('affordable');
      expect(result).toContain('data-id="1"');
      expect(result).not.toContain('disabled');
    });

    test('should render disabled button when not affordable', () => {
      const result = UpgradeRenderer.renderUpgradeButton(mockUpgrade, false);
      expect(result).toContain('disabled');
      expect(result).not.toContain('affordable');
    });
  });

  describe('fallbackFormat()', () => {
    test('should add thousand separators', () => {
      const result = UpgradeRenderer.fallbackFormat(1000, 0);
      expect(result).toBe('1,000');
    });

    test('should handle decimals', () => {
      const result = UpgradeRenderer.fallbackFormat(1234.56, 2);
      expect(result).toBe('1,234.56');
    });
  });

});

