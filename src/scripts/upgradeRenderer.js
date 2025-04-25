/**
 * Utility class for rendering upgrade UI elements
 */
export class UpgradeRenderer {
    /**
     * Renders the first line of an upgrade button
     * @param {Object} upgrade - The upgrade object
     * @returns {string} HTML string for the first line
     */
    static renderFirstLine(upgrade) {
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
    static renderSecondLine(upgrade) {
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        return `
            <div class="upgrade-second-line">
                <span>Cost: ${cost} Doros</span>
                ${upgrade.type === 'autoclicker' ? `<span>(Owned: ${upgrade.purchased})</span>` : ''}
            </div>
        `;
    }

    /**
     * Renders the tooltip for an upgrade
     * @param {Object} upgrade - The upgrade object
     * @returns {string} HTML string for the tooltip
     */
    static renderTooltip(upgrade) {
        if (!upgrade.description || !upgrade.effectDescription) return '';
    
        // Convert newlines to <br> tags in effect description
        const effectText = typeof upgrade.effectDescription === 'function' 
            ? upgrade.effectDescription(upgrade.value, upgrade.purchased)
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
    static renderUpgradeButton(upgrade, canAfford) {
        return `
        <button 
            class="upgrade-button ${canAfford ? 'affordable' : ''}"
            data-id="${upgrade.id}"
            ${!canAfford ? 'disabled' : ''}
        >
            <div class="upgrade-header">
                ${this.renderFirstLine(upgrade)}
            </div>
            ${this.renderSecondLine(upgrade)}
            ${this.renderTooltip(upgrade)}
        </button>
        `;
    }
}