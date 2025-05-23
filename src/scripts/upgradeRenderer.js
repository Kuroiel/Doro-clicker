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
 * @param {Function} [formatter] - Optional number formatting function
 * @returns {string} HTML string for the second line
 */
static renderSecondLine(upgrade, formatter) {
    // Get cost from cost() function if it exists, otherwise use baseCost
    const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.baseCost;
    
    // Format cost based on test requirements:
    // - With formatter: use formatter (should show 1,000)
    // - Without formatter: show raw number (should show 1000)
    const formattedCost = formatter ? formatter(cost) : cost.toString();
    
    // Determine if we should show purchased count (only for autoclickers)
    const showPurchased = upgrade.type === 'autoclicker';
    
    return `
        <div class="upgrade-second-line">
            <span>Cost: ${formattedCost} Doros</span>
            ${showPurchased 
                ? `<span>(Owned: ${upgrade.purchased})</span>` 
                : ''}
        </div>
    `;
}

// Fallback formatting when no formatter provided
static fallbackFormat(num, decimals) {
    // Handle non-numbers or NaN
    if (typeof num !== 'number' || isNaN(num)) {
        console.warn('Invalid number passed to fallbackFormat:', num);
        return '0';
    }
    
    // Format with thousand separators for whole numbers
    if (decimals === 0) {
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts[0]; // Only return integer part
    }
    
    // Otherwise format with decimals
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

/**
 * Renders the tooltip for an upgrade
 * @param {Object} upgrade - The upgrade object
 * @param {Function} [formatter] - Optional number formatting function
 * @returns {string} HTML string for the tooltip
 */
static renderTooltip(upgrade, formatter) {
    if (!upgrade.description || !upgrade.effectDescription) return '';

    // Special handling for effect description to prevent unwanted formatting of calculation values
    const effectText = typeof upgrade.effectDescription === 'function' 
        ? upgrade.effectDescription(
            // For value display, use raw number when it's part of a calculation
            // This prevents thousand separators from breaking calculations in tooltips
            upgrade.value, // Pass raw value instead of formatted
            upgrade.purchased
          )
        : upgrade.effectDescription;
    
    // Only format numbers that are purely for display (not part of calculations)
    const formattedEffect = effectText
        .replace(/\n/g, '<br>') // Handle line breaks
        .replace(/(\d+)(?=\D*$)/g, (match) => { // Format only numbers at the end of strings
            return formatter ? formatter(parseFloat(match)) : match;
        });

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