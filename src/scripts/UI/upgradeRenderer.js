/**
 * Utility class for rendering upgrade UI elements
 */
export class UpgradeRenderer {
  /**
   * Renders the first line of an upgrade button
   * @param {Object} upgrade - The upgrade object
   * @returns {string} HTML string for the first line
   */
  static renderFirstLine(upgrade, formatter) {
    if (!upgrade.icon) return `<span>${upgrade.name}</span>`;

    return `
            <div class="upgrade-first-line">
                <img src="${upgrade.icon}" alt="${upgrade.name}" class="upgrade-icon">
                <span>  ${upgrade.name}</span>
            </div>
        `;
  }

  /**
   * Renders the second line of an upgrade button
   * @param {Object} upgrade - The upgrade object
   * @param {Function} [formatter] - Optional number formatting function
   * @returns {string} HTML string for the second line
   */
  static renderSecondLine(upgrade, formatter) {
    const cost = upgrade.cost;

    const formattedCost = formatter ? formatter(cost) : cost.toString();
    const showPurchased = upgrade.type === "autoclicker";

    return `
        <div class="upgrade-second-line">
            <span>Cost: ${formattedCost} Doros</span>
            ${showPurchased ? `<span>(Owned: ${upgrade.purchased})</span>` : ""}
        </div>
    `;
  }
  // Fallback formatting when no formatter provided
  static fallbackFormat(num, decimals) {
    if (typeof num !== "number" || isNaN(num)) {
      console.warn("Invalid number passed to fallbackFormat:", num);
      return "0";
    }
    if (decimals === 0) {
      const parts = num.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts[0];
    }
    const parts = num.toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  /**
   * Renders the tooltip for an upgrade
   * @param {Object} upgrade - The upgrade object
   * @param {Function} [formatter] - Optional number formatting function
   * @returns {string} HTML string for the tooltip
   */
  static renderTooltip(upgrade, formatter) {
    if (!upgrade.description || !upgrade.effectDescription) return "";

    let effectText;
    if (typeof upgrade.effectDescription === "function") {
      effectText = upgrade.effectDescription(
        upgrade.value,
        upgrade.purchased,
        formatter
      );
    } else {
      effectText = upgrade.effectDescription
        .replace(
          /{value}/g,
          formatter ? formatter(upgrade.value) : upgrade.value
        )
        .replace(/{count}/g, upgrade.purchased);
    }

    return `
        <div class="upgrade-tooltip">
            <p>${upgrade.description}</p>
            <p><i>${effectText.replace(/\n/g, "<br>")}</i></p>
        </div>
    `;
  }

  /**
   * Renders a complete upgrade button
   * @param {Object} upgrade - The upgrade object
   * @param {boolean} canAfford - Whether the player can afford the upgrade
   * @returns {string} HTML string for the complete button
   */
  static renderUpgradeButton(upgrade, canAfford, formatter) {
    return `
        <button 
            class="upgrade-button ${canAfford ? "affordable" : ""}"
            data-id="${upgrade.id}"
            ${!canAfford ? "disabled" : ""}
        >
            <div class="upgrade-header">
                ${this.renderFirstLine(upgrade, formatter)}
            </div>
            ${this.renderSecondLine(upgrade, formatter)}
            ${this.renderTooltip(upgrade, formatter)}
        </button>
    `;
  }
}
