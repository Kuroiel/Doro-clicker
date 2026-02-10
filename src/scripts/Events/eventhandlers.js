import { DOMHelper } from "../UI/dom.js";

export class EventHandlers {
  constructor(game) {
    this.game = game;
    this._listeners = [];
  }

  // wiring up the disaster
  setupAllEventListeners() {
    this.setupDoroImageListeners();
    this.setupUpgradeButtonListeners();
    this.setupViewButtonListeners();
    this.setupStatsEvents();
  }

  setupDoroImageListeners() {
    const doroImage = DOMHelper.getDoroImage();
    if (!doroImage) return;

    if (this._doroClickHandler) {
      doroImage.removeEventListener("click", this._doroClickHandler);
    }

    // redo clicker
    this._doroClickHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.game.mechanics.handleClick();
    };
    this._addListener(doroImage, "click", this._doroClickHandler);

    // scale feedback
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
        const upgradeId = button.dataset.id;
        if (upgradeId) {
          button.classList.add("processing");
          const purchased = this.game.mechanics.purchaseUpgrade(upgradeId);
          if (purchased) {
            // flash effect
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

      // show stats
      if (target.closest("#show-stats")) {
        e.stopPropagation();
        statsElement.style.display =
          statsElement.style.display === "block" ? "none" : "block";
        return; // Stop further processing
      }

      // hide stats
      if (target.closest("#close-stats")) {
        e.stopPropagation();
        statsElement.style.display = "none";
        return; // Stop further processing
      }

      if (
        statsElement.style.display === "block" &&
        !target.closest("#stats-overlay") // click outside close
      ) {
        statsElement.style.display = "none";
      }
    });
  }

  // adding to the pile
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
