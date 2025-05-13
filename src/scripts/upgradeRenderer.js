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
                <span>&nbsp; ${upgrade.name}</span>
            </div>
        `;
    }

    /**
     * Renders the second line of an upgrade button
     * @param {Object} upgrade - The upgrade object
     * @returns {string} HTML string for the second line
     */
    static renderSecondLine(upgrade, formatter) {
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        // Force consistent formatting - whole numbers with thousand separators
        const formattedCost = formatter ? formatter(cost, 0) : this.fallbackFormat(cost, 0);
        
        return `
            <div class="upgrade-second-line">
                <span>Cost: ${formattedCost} Doros</span>
                ${upgrade.type === 'autoclicker' ? 
                    `<span>(Owned: ${formatter ? formatter(upgrade.purchased, 0) : upgrade.purchased})</span>` : 
                    ''}
            </div>
        `;
    }
    
    // Fallback formatting when no formatter provided
    static fallbackFormat(num, decimals) {
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    /**
     * Renders the tooltip for an upgrade
     * @param {Object} upgrade - The upgrade object
     * @returns {string} HTML string for the tooltip
     */
    static renderTooltip(upgrade, formatter) {
        if (!upgrade.description || !upgrade.effectDescription) return '';
    
        // Format numbers in effect description with max 1 decimal place
        const formatForTooltip = (num) => {
            const decimals = Math.min(1, (num.toString().split('.')[1] || '').length);
            return formatter ? formatter(num, decimals) : num.toFixed(decimals);
        };
    
        const effectText = typeof upgrade.effectDescription === 'function' 
            ? upgrade.effectDescription(
                formatter ? formatForTooltip(upgrade.value) : upgrade.value,
                upgrade.purchased
              )
            : upgrade.effectDescription;
        
        const formattedEffect = effectText.replace(/\n/g, '<br>');
    
        return `
            <div class="upgrade-tooltip">
                <p>${upgrade.description}</p>
                <p><i>${formattedEffect}</i></p>
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
            class="upgrade-button ${canAfford ? 'affordable' : ''}"
            data-id="${upgrade.id}"
            ${!canAfford ? 'disabled' : ''}
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