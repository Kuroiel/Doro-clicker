import { UpgradeRenderer } from "../../src/scripts/UI/upgradeRenderer.js";

describe("UpgradeRenderer", () => {
  const mockFormatter = (num) => `F${num}`;

  describe("renderFirstLine", () => {
    it("should render name only if no icon", () => {
      const upgrade = { name: "Test Upgrade" };
      const html = UpgradeRenderer.renderFirstLine(upgrade, mockFormatter);
      expect(html).toContain("Test Upgrade");
      expect(html).not.toContain("img");
    });

    it("should render icon and name", () => {
      const upgrade = { name: "Test Upgrade", icon: "icon.png" };
      const html = UpgradeRenderer.renderFirstLine(upgrade, mockFormatter);
      expect(html).toContain("Test Upgrade");
      expect(html).toContain('img src="icon.png"');
    });
  });

  describe("renderSecondLine", () => {
    it("should show cost", () => {
      const upgrade = { cost: 100, type: "upgrade", purchased: 0 };
      const html = UpgradeRenderer.renderSecondLine(upgrade, mockFormatter);
      expect(html).toContain("Cost: F100 Doros");
    });

    it("should show purchased count for autoclickers", () => {
      const upgrade = { cost: 100, type: "autoclicker", purchased: 5 };
      const html = UpgradeRenderer.renderSecondLine(upgrade, mockFormatter);
      expect(html).toContain("Owned: 5");
    });

    it("should NOT show purchased count for non-autoclickers", () => {
      const upgrade = { cost: 100, type: "upgrade", purchased: 5 };
      const html = UpgradeRenderer.renderSecondLine(upgrade, mockFormatter);
      expect(html).not.toContain("Owned:");
    });
  });

  describe("renderTooltip", () => {
    it("should render empty string if missing data", () => {
        expect(UpgradeRenderer.renderTooltip({})).toBe("");
    });

    it("should render description and interpolated effect", () => {
        const upgrade = {
            description: "Desc",
            effectDescription: "Boost {value} by {count}",
            value: 10,
            purchased: 2
        };
        const html = UpgradeRenderer.renderTooltip(upgrade, mockFormatter);
        expect(html).toContain("Desc");
        expect(html).toContain("Boost F10 by 2");
    });

    it("should handle function effectDescription", () => {
        const upgrade = {
            description: "Desc",
            effectDescription: (val, count, fmt) => `Fn: ${fmt(val)} * ${count}`,
            value: 10,
            purchased: 2
        };
        const html = UpgradeRenderer.renderTooltip(upgrade, mockFormatter);
        expect(html).toContain("Fn: F10 * 2");
    });
  });

  describe("renderUpgradeButton", () => {
    it("should render disabled button if unaffordable", () => {
        const upgrade = {
            id: 1,
            name: "Test",
            cost: 100,
            type: "upgrade",
            description: "D",
            effectDescription: "E"
        };
        const html = UpgradeRenderer.renderUpgradeButton(upgrade, false, mockFormatter);
        expect(html).toContain('disabled');
        expect(html).not.toContain('affordable');
    });

    it("should render affordable button if affordable", () => {
        const upgrade = {
            id: 1,
            name: "Test",
            cost: 100,
            type: "upgrade",
            description: "D",
            effectDescription: "E"
        };
        const html = UpgradeRenderer.renderUpgradeButton(upgrade, true, mockFormatter);
        expect(html).toContain('affordable');
        expect(html).not.toContain('disabled');
    });
  });
});
