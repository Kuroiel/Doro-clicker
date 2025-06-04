import { DOMHelper } from "../UI/dom.js";

export class ViewManager {
  constructor(game) {
    this.game = game;
    this.currentView = "autoclickers";
  }

  switchView(view) {
    const validViews = ["autoclickers", "upgrades"];
    if (!validViews.includes(view)) {
      console.warn(`Attempted to switch to invalid view: ${view}`);
      return;
    }

    this.currentView = view;

    // Add defensive checks for DOMHelper methods
    if (typeof DOMHelper.getViewButtons === "function") {
      this._updateViewButtons();
    }
    if (typeof DOMHelper.getUpgradeViews === "function") {
      this._updateViewContainers();
    }

    if (this.game.ui && typeof this.game.ui.updateUI === "function") {
      this.game.ui.updateUI();
    }
  }

  _updateViewButtons() {
    try {
      const viewButtons = DOMHelper.getViewButtons();
      if (!viewButtons) return;

      viewButtons.forEach((btn) => {
        if (!btn) return;
        DOMHelper.toggleClass(
          btn,
          "active",
          btn.dataset.view === this.currentView
        );
      });
    } catch (e) {
      console.warn("Failed to update view buttons:", e);
    }
  }

  _updateViewContainers() {
    try {
      const upgradeViews = DOMHelper.getUpgradeViews();
      if (!upgradeViews) return;

      upgradeViews.forEach((container) => {
        if (!container) return;
        const isTarget = container.id === `${this.currentView}-container`;
        DOMHelper.toggleClass(container, "active-view", isTarget);

        if (
          isTarget &&
          this.game.ui &&
          typeof this.game.ui.renderUpgrades === "function"
        ) {
          this.game.ui.renderUpgrades();
        }
      });
    } catch (e) {
      console.warn("Failed to update view containers:", e);
    }
  }

  getCurrentView() {
    return this.currentView;
  }
}
