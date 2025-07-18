import { DOMHelper } from "../UI/dom.js";

export class EventHandlers {
  constructor(game) {
    this.game = game;
    this._listeners = [];
  }

  setupAllEventListeners() {
    this.setupDoroImageListeners();
    this.setupUpgradeButtonListeners();
    this.setupViewButtonListeners();
    this.setupStatsEvents();
  }

  setupDoroImageListeners() {
    const doroImage = DOMHelper.getDoroImage();
    if (!doroImage) return;

    // Remove existing click listener
    if (this._doroClickHandler) {
      doroImage.removeEventListener("click", this._doroClickHandler);
    }

    // Create and add new click handler
    this._doroClickHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.game.mechanics.handleClick();
    };
    this._addListener(doroImage, "click", this._doroClickHandler);

    // Visual feedback handlers
    this._addListener(doroImage, "mousedown", () => {
      doroImage.style.transform = "scale(0.95)";
    });

    this._addListener(doroImage, "mouseup", () => {
      doroImage.style.transform = "scale(1)";
    });
  }

  setupUpgradeButtonListeners() {
    const sidebar = DOMHelper.getSidebarElement();
    if (!sidebar) return;

    this._addListener(sidebar, "click", (e) => {
      const button = e.target.closest(".upgrade-button");
      if (button && !button.disabled) {
        const upgradeId = parseInt(button.dataset.id);
        if (!isNaN(upgradeId)) {
          button.classList.add("processing");
          // Replace debouncePurchase with direct purchaseUpgrade call
          const purchased = this.game.mechanics.purchaseUpgrade(upgradeId);
          if (purchased) {
            // Visual feedback for successful purchase
            button.classList.add("purchased");
            setTimeout(() => button.classList.remove("purchased"), 100);
          }
          requestAnimationFrame(() => button.classList.remove("processing"));
        }
      }
    });
  }

  setupViewButtonListeners() {
    document.querySelectorAll(".view-button").forEach((button) => {
      this._addListener(button, "click", (e) => {
        this.game.viewManager.switchView(e.target.dataset.view);
      });
    });
  }

  setupStatsEvents() {
    const statsElement = DOMHelper.getStatsElement();
    const showStatsButton = DOMHelper.getShowStatsButton();
    const closeStatsButton = DOMHelper.getCloseStatsButton();

    if (!statsElement || !showStatsButton || !closeStatsButton) return;

    this._addListener(document.body, "click", (e) => {
      const target = e.target;

      // Handle showing the stats
      if (target.closest("#show-stats")) {
        e.stopPropagation();
        statsElement.style.display =
          statsElement.style.display === "block" ? "none" : "block";
        return; // Stop further processing
      }

      // Handle closing the stats
      if (target.closest("#close-stats")) {
        e.stopPropagation();
        statsElement.style.display = "none";
        return; // Stop further processing
      }

      // Handle clicking outside the stats overlay to close it
      if (
        statsElement.style.display === "block" &&
        !target.closest("#stats-overlay") // Check if the click was outside the overlay
      ) {
        statsElement.style.display = "none";
      }
    });
  }

  _addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this._listeners.push({ element, event, handler });
  }

  removeAllEventListeners() {
    this._listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._listeners = [];
  }
}
