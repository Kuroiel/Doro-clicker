export class DOMHelper {
    static getScoreElement() {
      return document.getElementById('score-display');
    }
  
    static getDorosCount() {
      return parseInt(DOMHelper.getScoreElement().textContent.split(' ')[1]) || 0;
    }
  
    static getUpgradeButtons() {
      return Array.from(document.querySelectorAll('.upgrade-button'));
    }
  
    static getUpgradeButton(upgradeId) {
      return document.querySelector(`[data-id="${upgradeId}"]`);
    }
  }