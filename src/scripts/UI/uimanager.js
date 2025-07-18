import { DOMHelper } from "./dom.js";
import { UpgradeRenderer } from "./upgradeRenderer.js";
import { Formatters } from "./formatters.js";

export class UIManager {
  constructor(game) {
    this.game = game;
    this.formatter = new Formatters();
    this._needsFullRender = true;
    this._lastAffordabilityCheck = 0;
    this.AFFORDABILITY_CHECK_INTERVAL = 250;

    // The state listener is the primary driver for all passive UI updates.
    this.game.state.addListener(() => {
      requestAnimationFrame(() => {
        this.updateScoreDisplay();
        this.updateStatsDisplay();
        this.updateAllAffordability();
      });
    });
  }

  // EFFICIENT: This is now the main affordability update loop.
  // It only toggles classes and the disabled property, which is very fast.
  updateAllAffordability() {
    const allItems = [...this.game.autoclickers, ...this.game.upgrades];

    for (const item of allItems) {
      const button = DOMHelper.getUpgradeButton(item.id);
      if (button) {
        const canAfford = this.game.mechanics.canAfford(item);
        DOMHelper.toggleClass(button, "affordable", canAfford);
        button.disabled = !canAfford;
      }
    }
  }

  updateScoreDisplay() {
    const formattedDoros = this.formatter.formatNumber(
      Math.floor(this.game.state.doros),
      0,
      null,
      true,
      "score"
    );
    DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${formattedDoros}`);
  }

  updateStatsDisplay() {
    const stats = DOMHelper.getStatElements();
    if (!stats) return;

    const clicks = this.formatter.formatNumber(this.game.state.manualClicks, 0);
    const total = this.formatter.formatNumber(
      Math.floor(this.game.state.totalDoros),
      0
    );
    const totalDPS = this.game.state.getTotalDPS();
    const dps = this.formatter.formatNumber(totalDPS, 1);

    DOMHelper.setText(stats.clicks, clicks);
    DOMHelper.setText(stats.dps, dps);
    DOMHelper.setText(stats.total, total);
  }

  // Renders all items from scratch. Should only be called on init, load, or view switch.
  renderAllItems() {
    const autoContainer = DOMHelper.getAutoclickersContainer();
    const upgradeContainer = DOMHelper.getUpgradesContainer();

    if (autoContainer) autoContainer.innerHTML = "";
    if (upgradeContainer) upgradeContainer.innerHTML = "";

    const formatter = (num, decimals = 0) =>
      this.formatter.formatNumber(num, decimals, null, decimals === 0, "cost");

    // Render autoclickers
    this.game.autoclickers.forEach((item) => {
      autoContainer.insertAdjacentHTML(
        "beforeend",
        UpgradeRenderer.renderUpgradeButton(item, false, formatter)
      );
    });

    // Render upgrades based on visibility
    const { visibleUpgrades } = this.sortUpgrades();
    visibleUpgrades.forEach((item) => {
      upgradeContainer.insertAdjacentHTML(
        "beforeend",
        UpgradeRenderer.renderUpgradeButton(item, false, formatter)
      );
    });

    // After rendering, immediately check for what can be afforded.
    this.updateAllAffordability();
    this._needsFullRender = false;
  }

  // Public method to trigger a full redraw.
  forceFullUpdate() {
    this._needsFullRender = true;
    this.renderAllItems();
    this.updateStatsDisplay();
  }

  sortUpgrades() {
    const visibleUpgrades = [];
    const hiddenUpgrades = []; // Can be used for a "purchased upgrades" view later
    const gameStateContext = {
      autoclickers: this.game.autoclickers,
      getTotalDPS: () => this.game.state.getTotalDPS(),
      state: this.game.state,
      upgrades: this.game.upgrades,
    };

    this.game.upgrades.forEach((upgrade) => {
      if (upgrade.isVisible(gameStateContext)) {
        visibleUpgrades.push(upgrade);
      } else {
        hiddenUpgrades.push(upgrade);
      }
    });

    visibleUpgrades.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    return { visibleUpgrades, hiddenUpgrades };
  }

  // LIGHTWEIGHT: This function now only updates text content, not the whole element.
  refreshUpgradeButton(upgradeId) {
    const button = DOMHelper.getUpgradeButton(upgradeId);
    if (!button) {
      // If the button doesn't exist, it might have just become visible.
      // A full render is the safest way to handle this.
      this.forceFullUpdate();
      return;
    }

    const item =
      this.game.autoclickers.find((u) => u.id === upgradeId) ||
      this.game.upgrades.find((u) => u.id === upgradeId);
    if (!item) return;

    const formatter = (num, decimals = 0) =>
      this.formatter.formatNumber(num, decimals, null, decimals === 0, "cost");

    // Update cost text
    const costSpan = button.querySelector(
      ".upgrade-second-line > span:first-child"
    );
    if (costSpan) {
      costSpan.textContent = `Cost: ${formatter(item.cost)} Doros`;
    }

    // Update owned text (for autoclickers)
    if (item.type === "autoclicker") {
      const ownedSpan = button.querySelector(
        ".upgrade-second-line span:last-child"
      );
      if (ownedSpan) ownedSpan.textContent = `(Owned: ${item.purchased})`;
    }

    // Update tooltip content
    const oldTooltip = button.querySelector(".upgrade-tooltip");
    if (oldTooltip) {
      const newTooltipHTML = UpgradeRenderer.renderTooltip(item, formatter);
      // Use a helper to safely create and replace the element
      DOMHelper.replaceElement(oldTooltip, newTooltipHTML);
    }

    // If an upgrade is no longer visible after purchase (e.g., maxed out), re-render.
    if (
      item.type !== "autoclicker" &&
      !item.isVisible({
        ...this.game,
        getTotalDPS: () => this.game.state.getTotalDPS(),
      })
    ) {
      this.forceFullUpdate();
    }
  }
}
