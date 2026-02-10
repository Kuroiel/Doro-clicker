// drawing upgrades
export class UpgradeRenderer {
  // first bit
  static renderFirstLine(upgrade, formatter) {
    if (!upgrade.icon) return `<span>${upgrade.name}</span>`;

    return `
            <div class="upgrade-first-line">
                <img src="${upgrade.icon}" alt="${upgrade.name}" class="upgrade-icon">
                <span>  ${upgrade.name}</span>
            </div>
        `;
  }

  // second bit
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
  // fallback if no formatter
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

  // popup info
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

  // the whole button
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
