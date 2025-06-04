// dom.js - Cleaned and organized DOM helper class
export class DOMHelper {
  // ======================
  // Score Related Methods
  // ======================

  /**
   * Gets the score display element
   * @returns {HTMLElement} The score display element
   */
  static getScoreElement() {
    return document.getElementById("score-display");
  }

  /**
   * Gets the current doros count from the score display
   * @returns {number} The current doros count (0 if not found)
   */
  static getDorosCount() {
    return parseInt(this.getScoreElement().textContent.split(" ")[1]) || 0;
  }

  // ========================
  // Upgrade Related Methods
  // ========================

  /**
   * Gets the upgrades container element
   * @returns {HTMLElement} The upgrades container
   */
  static getUpgradesContainer() {
    return document.getElementById("upgrades-container");
  }

  /**
   * Gets all upgrade buttons
   * @returns {Array<HTMLElement>} Array of upgrade button elements
   */
  static getUpgradeButtons() {
    return Array.from(document.querySelectorAll(".upgrade-button"));
  }

  /**
   * Gets a specific upgrade button by its ID
   * @param {string} upgradeId - The data-id of the upgrade button
   * @returns {HTMLElement} The matching upgrade button
   */
  static getUpgradeButton(upgradeId) {
    return document.querySelector(`[data-id="${upgradeId}"]`);
  }

  /**
   * Gets all upgrade view sections
   * @returns {Array<HTMLElement>} Array of upgrade view elements
   */
  static getUpgradeViews() {
    return Array.from(document.querySelectorAll(".upgrade-view"));
  }

  // =====================
  // Stats Related Methods
  // =====================

  /**
   * Gets the stats overlay element
   * @returns {HTMLElement} The stats overlay container
   */
  static getStatsElement() {
    return document.getElementById("stats-overlay");
  }

  /**
   * Gets all stat display elements
   * @returns {Object} Object containing references to stat elements
   */
  static getStatElements() {
    const statsElement = document.getElementById("stats-overlay");
    if (!statsElement) {
      console.warn("Stats overlay not found");
      return null;
    }

    return {
      clicks: statsElement.querySelector("#stat-clicks"),
      dps: statsElement.querySelector("#stat-dps"),
      total: statsElement.querySelector("#stat-total"),
    };
  }

  /**
   * Gets the "show stats" button
   * @returns {HTMLElement} The show stats button
   */
  static getShowStatsButton() {
    return document.getElementById("show-stats");
  }

  /**
   * Gets the "close stats" button
   * @returns {HTMLElement} The close stats button
   */
  static getCloseStatsButton() {
    return document.getElementById("close-stats");
  }

  // ========================
  // Autoclicker Related Methods
  // ========================

  /**
   * Gets the autoclickers container
   * @returns {HTMLElement} The autoclickers container element
   */
  static getAutoclickersContainer() {
    return document.getElementById("autoclickers-container");
  }

  // ===================
  // UI Element Methods
  // ===================

  /**
   * Gets the main doro image element
   * @returns {HTMLElement} The doro image element
   */
  static getDoroImage() {
    return document.getElementById("doro-image");
  }

  /**
   * Gets the sidebar element
   * @returns {HTMLElement} The sidebar element
   */
  static getSidebarElement() {
    return document.querySelector(".sidebar");
  }

  /**
   * Gets all view toggle buttons
   * @returns {Array<HTMLElement>} Array of view button elements
   */
  static getViewButtons() {
    return Array.from(document.querySelectorAll(".view-button"));
  }

  // ===================
  // Utility Methods
  // ===================

  /**
   * Sets text content of an element
   * @param {HTMLElement} element - The target element
   * @param {string} text - The text to set
   */
  static setText(element, text) {
    if (element) element.textContent = text;
  }

  /**
   * Toggles visibility of an element
   * @param {HTMLElement} element - The target element
   * @param {boolean} visible - Whether to show the element
   */
  static toggleVisibility(element, visible) {
    if (element) element.style.display = visible ? "block" : "none";
  }

  /**
   * Disables an element
   * @param {HTMLElement} element - The target element
   */
  static disableElement(element) {
    if (element) element.disabled = true;
  }

  /**
   * Enables an element
   * @param {HTMLElement} element - The target element
   */
  static enableElement(element) {
    if (element) element.disabled = false;
  }

  /**
   * Adds a class to an element
   * @param {HTMLElement} element - The target element
   * @param {string} className - The class to add
   */
  static addClass(element, className) {
    if (element && className) {
      element.classList.add(className);
    }
  }

  /**
   * Removes a class from an element
   * @param {HTMLElement} element - The target element
   * @param {string} className - The class to remove
   */
  static removeClass(element, className) {
    if (element && className) {
      element.classList.remove(className);
    }
  }

  /**
   * Toggles a class on an element based on a condition
   * @param {HTMLElement} element - The target element
   * @param {string} className - The class to toggle
   * @param {boolean} condition - Whether to add (true) or remove (false) the class
   */

  static toggleClass(element, className, condition) {
    if (element && className) {
      if (condition) {
        this.addClass(element, className);
      } else {
        this.removeClass(element, className);
      }
    }
  }
  /**
   * Gets the numeric Doros count from the score display
   * @returns {number} Current Doros count (0 if not found/parse fails)
   */
  static getDorosCount() {
    try {
      const scoreElement = this.getScoreElement();
      if (!scoreElement) return 0;
      return parseInt(scoreElement.textContent.split(" ")[1]) || 0;
    } catch (error) {
      console.error("Error getting Doros count:", error);
      return 0;
    }
  }

  // ======================
  // Reset UI Methods
  // ======================

  /**
   * Creates reset confirmation modal
   * @returns {HTMLElement} The modal element
   */
  static createResetModal() {
    const modal = document.createElement("div");
    modal.id = "reset-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
    <div class="modal-content">
      <p>This will reset your game<br>Are you sure you want to reset?</p>
      <div class="modal-buttons">
        <button id="confirm-reset" class="modal-button confirm">Yes</button>
        <button id="cancel-reset" class="modal-button cancel">No</button>
      </div>
    </div>
  `;
    return modal;
  }

  /**
   * Gets the reset button element
   * @returns {HTMLElement} The reset button
   */
  static getResetButton() {
    return document.getElementById("reset-button");
  }

  /**
   * Shows the reset confirmation modal
   */
  static showResetModal() {
    const modal = this.createResetModal();
    document.body.appendChild(modal);
  }

  /**
   * Hides the reset confirmation modal
   */
  static hideResetModal() {
    const modal = document.getElementById("reset-modal");
    if (modal) {
      document.body.removeChild(modal);
    }
  }
}
