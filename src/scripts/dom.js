// dom.js - Updated implementation
export class DOMHelper {
  // Score elements
  static getScoreElement() {
      return document.getElementById('score-display');
  }

  static getDorosCount() {
      return parseInt(this.getScoreElement().textContent.split(' ')[1]) || 0;
  }

  // Upgrade elements
  static getUpgradesContainer() {
      return document.getElementById('upgrades-container');
  }

  static getUpgradeButtons() {
      return Array.from(document.querySelectorAll('.upgrade-button'));
  }

  static getUpgradeButton(upgradeId) {
      return document.querySelector(`[data-id="${upgradeId}"]`);
  }

  // Stats elements
  static getStatsElement() {
    return document.getElementById('stats-overlay');
}

  static getStatElements() {
      return {
          clicks: document.getElementById('stat-clicks'),
          dps: document.getElementById('stat-dps'),
          total: document.getElementById('stat-total')
      };
  }

  // Image element
  static getDoroImage() {
      return document.getElementById('doro-image');
  }

  // Utility methods
  static setText(element, text) {
      if (element) element.textContent = text;
  }

  static toggleVisibility(element, visible) {
      if (element) element.style.display = visible ? 'block' : 'none';
  }

  // You could add more helper methods as needed
static disableElement(element) {
  if (element) element.disabled = true;
}

static enableElement(element) {
  if (element) element.disabled = false;
}

static addClass(element, className) {
  if (element) element.classList.add(className);
}

static removeClass(element, className) {
  if (element) element.classList.remove(className);
}
}