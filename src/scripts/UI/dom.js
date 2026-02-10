export class DOMHelper {
  // score stuff

  // hunting for the score
  static getScoreElement() {
    return document.getElementById("score-display");
  }

  // get the doro number
  static getDorosCount() {
    try {
      const scoreElement = this.getScoreElement();
      if (!scoreElement) return 0;
      const numberMatch = scoreElement.textContent.match(/[\d,.]+/);
      return numberMatch ? parseInt(numberMatch[0].replace(/,/g, ""), 10) : 0;
    } catch (error) {
      console.error("Error getting Doros count:", error);
      return 0;
    }
  }

  // upgrades stuff

  static getUpgradesContainer() {
    return document.getElementById("upgrades-container");
  }

  static getUpgradeButtons() {
    return Array.from(document.querySelectorAll(".upgrade-button"));
  }

  static getUpgradeButton(upgradeId) {
    return document.querySelector(`.upgrade-button[data-id="${upgradeId}"]`);
  }

  static getUpgradeViews() {
    return Array.from(document.querySelectorAll(".upgrade-view"));
  }

  // stats stuff

  static getStatsElement() {
    return document.getElementById("stats-overlay");
  }

  static getStatElements() {
    const statsElement = document.getElementById("stats-overlay");
    if (!statsElement) return null;
    return {
      clicks: statsElement.querySelector("#stat-clicks"),
      dps: statsElement.querySelector("#stat-dps"),
      total: statsElement.querySelector("#stat-total"),
    };
  }

  static getShowStatsButton() {
    return document.getElementById("show-stats");
  }

  static getCloseStatsButton() {
    return document.getElementById("close-stats");
  }

  // auto clickers stuff

  static getAutoclickersContainer() {
    return document.getElementById("autoclickers-container");
  }

  // generic ui stuff

  static getDoroImage() {
    return document.getElementById("doro-image");
  }

  static getSidebarElement() {
    return document.querySelector(".sidebar");
  }

  static getViewButtons() {
    return Array.from(document.querySelectorAll(".view-button"));
  }

  // bits and bobs

  static setText(element, text) {
    if (element && element.textContent !== text) {
      element.textContent = text;
    }
  }

  static toggleVisibility(element, visible) {
    if (element) element.style.display = visible ? "block" : "none";
  }

  static toggleClass(element, className, condition) {
    if (element && className) {
      element.classList.toggle(className, condition);
    }
  }

  // swap tags
  // swapping bits
  static replaceElement(oldElement, newHTML) {
    if (!oldElement) return;
    const template = document.createElement("template");
    template.innerHTML = newHTML.trim();
    const newElement = template.content.firstChild;
    if (newElement) {
      oldElement.replaceWith(newElement);
    }
  }

  // reset ui stuff

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

  static getResetButton() {
    return document.getElementById("reset-button");
  }

  static showResetModal() {
    if (document.getElementById("reset-modal")) return;
    const modal = this.createResetModal();
    document.body.appendChild(modal);
  }

  static hideResetModal() {
    const modal = document.getElementById("reset-modal");
    if (modal) {
      modal.remove();
    }
  }

  static replaceElement(element, newHTML) {
    if (!element || !element.parentNode) return null;

    const template = document.createElement("template");
    template.innerHTML = newHTML.trim();
    const newElement = template.content.firstChild;

    if (newElement) {
      element.parentNode.replaceChild(newElement, element);
      return newElement;
    }
    return null;
  }
}
