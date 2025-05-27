import { DOMHelper } from './dom.js';
import { UpgradeRenderer } from './upgradeRenderer.js';
import { Formatters } from './formatters.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.formatter = new Formatters();
        this._lastDoros = 0;
        this._needsUpgradeRender = true;
        this._isRendering = false;

        // Stronger binding for state updates
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
        this.game.state.addListener(this.handleStateUpdate);
    }

        handleStateUpdate() {
        // Immediate response to state changes
        this.updateScoreDisplay();
        this.updateStatsDisplay();
    this.refreshAutoclickerButtons();
        this.updateAllButtonContents();
    }

refreshAutoclickerButtons() {
    const buttons = DOMHelper.getUpgradeButtons();
    const autoclickerIds = this.game.autoclickers.map(a => a.id);
    
    buttons.forEach(button => {
        const upgradeId = parseInt(button.dataset.id);
        const upgrade = this.game.autoclickers.find(u => u.id === upgradeId) || 
                       this.game.upgrades.find(u => u.id === upgradeId);
        
        if (!upgrade) return;
        
        const formatter = (num, decimals = 0) => 
            this.formatter.formatNumber(num, decimals, null, decimals === 0, 'cost');
        
        // Completely rebuild button content including tooltips
        button.innerHTML = `
            <div class="upgrade-header">
                ${UpgradeRenderer.renderFirstLine(upgrade)}
            </div>
            ${UpgradeRenderer.renderSecondLine(upgrade, formatter)}
            ${UpgradeRenderer.renderTooltip(upgrade, formatter)}
        `;
        
        // Update affordance state
        const canAfford = this.game.mechanics.canAfford(upgrade);
        button.classList.toggle('affordable', canAfford);
        button.disabled = !canAfford;
    });
}

    updateUI() {
    this.updateScoreDisplay();
    this.updateStatsDisplay();

    const dorosChangedSignificantly = Math.abs(this.game.state.doros - this._lastDoros) > 1;
    
    if (this._needsUpgradeRender || dorosChangedSignificantly) {
        this.renderUpgrades();
        this._lastDoros = this.game.state.doros;
        this._needsUpgradeRender = false;
    } else {
        // Lightweight update path
        this.updateButtonStates(); // More efficient than updateAllButtonContents
    }
    
    // Keep autoclicker affordance check
    this.updateAutoclickerAffordance();
    }

   forceFullUpdate(updateButtons = true) {
    this._needsUpgradeRender = true;
    this.updateScoreDisplay();
    this.updateStatsDisplay();
    
    if (updateButtons) {
        this.renderUpgrades();
    }
    
    this._lastDoros = this.game.state.doros;
} 

    updateScoreDisplay() {
        const formattedDoros = this.formatter.formatNumber(Math.floor(this.game.state.doros), 0, null, true, 'score');
        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${formattedDoros}`);
    }

    updateStatsDisplay() {
        const stats = DOMHelper.getStatElements();
        if (!stats) return;
        
        try {
            // Format numbers appropriately
            const clicks = this.formatter.formatNumber(this.game.state.manualClicks, 0);
            const total = this.formatter.formatNumber(Math.floor(this.game.state.totalDoros), 0);
            
            // Calculate and format DPS
            const totalDPS = this.game.state.getTotalDPS();
            const dps = this.formatter.formatNumber(totalDPS, 1);
            
            // Update DOM elements
            DOMHelper.setText(stats.clicks, clicks);
            DOMHelper.setText(stats.dps, dps);
            DOMHelper.setText(stats.total, total);
        } catch (error) {
            console.error('Error updating stats display:', error);
        }
    }

    renderUpgrades() {
        if (this._isRendering) return;
        this._isRendering = true;

        try {
            const autoContainer = DOMHelper.getAutoclickersContainer();
            const upgradeContainer = DOMHelper.getUpgradesContainer();
        
            if (autoContainer) autoContainer.innerHTML = '';
            if (upgradeContainer) upgradeContainer.innerHTML = '';
        
            const consistentFormatter = (num, decimals = 0) => 
                this.formatter.formatNumber(num, decimals, null, decimals === 0, 'cost');
        
            // Render autoclickers
            this.game.autoclickers.forEach(upgrade => {
                const canAfford = this.game.mechanics.canAfford(upgrade);
                autoContainer.insertAdjacentHTML('beforeend', 
                    UpgradeRenderer.renderUpgradeButton(upgrade, canAfford, consistentFormatter));
            });
            
            // Render upgrades
            const { visibleUpgrades, hiddenUpgrades } = this.sortUpgrades();
            [...visibleUpgrades, ...hiddenUpgrades].forEach(upgrade => {
                const canAfford = this.game.mechanics.canAfford(upgrade);
                upgradeContainer.insertAdjacentHTML('beforeend', 
                    UpgradeRenderer.renderUpgradeButton(upgrade, canAfford, consistentFormatter));
            });
        
            this.updateStatsDisplay();
        } finally {
            this._isRendering = false;
        }
    }

    sortUpgrades() {
        const visibleUpgrades = [];
        const hiddenUpgrades = [];
        
        this.game.upgrades.forEach(upgrade => {
            try {
                if (typeof upgrade.isVisible !== 'function') {
                    visibleUpgrades.push(upgrade);
                    return;
                }
    
                const gameStateContext = {
                    autoclickers: this.game.autoclickers,
                    getTotalDPS: () => this.game.state.getTotalDPS(),
                    state: this.game.state,
                    upgrades: this.game.upgrades
                };
                
                const isVisible = upgrade.isVisible(gameStateContext);
                
                if (isVisible) {
                    visibleUpgrades.push(upgrade);
                } else if (upgrade.purchased > 0) {
                    hiddenUpgrades.push(upgrade);
                }
            } catch (error) {
                console.error(`Error checking visibility for upgrade ${upgrade.id}:`, error);
                visibleUpgrades.push(upgrade);
            }
        });
    
        hiddenUpgrades.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return { visibleUpgrades, hiddenUpgrades };
    }

    updateAllButtonContents() {
        const buttons = DOMHelper.getUpgradeButtons();
        buttons.forEach(button => {
            const upgradeId = parseInt(button.dataset.id);
            const upgrade = this.game.autoclickers.find(u => u.id === upgradeId) || 
                           this.game.upgrades.find(u => u.id === upgradeId);
            
            if (upgrade) {
                const consistentFormatter = (num, decimals = 0) => 
                    this.formatter.formatNumber(num, decimals, null, decimals === 0, 'cost');
                
                const canAfford = this.game.mechanics.canAfford(upgrade);
                const newContent = `
                    <div class="upgrade-header">
                        ${UpgradeRenderer.renderFirstLine(upgrade)}
                    </div>
                    ${UpgradeRenderer.renderSecondLine(upgrade, consistentFormatter)}
                    ${UpgradeRenderer.renderTooltip(upgrade, consistentFormatter)}
                `;
                
                button.innerHTML = newContent;
                button.classList.toggle('affordable', canAfford);
                button.disabled = !canAfford;
            }
        });
    }

    switchView(view) {
        if (this.game.viewManager) {
            this.game.viewManager.switchView(view);
        } else {
            console.error('ViewManager not initialized');
        }
    }
    updateAutoclickerAffordance() {
    const buttons = DOMHelper.getUpgradeButtons();
    buttons.forEach(button => {
        const upgradeId = parseInt(button.dataset.id);
        const upgrade = this.game.autoclickers.find(u => u.id === upgradeId);
        
        if (upgrade) {
            const canAfford = this.game.mechanics.canAfford(upgrade);
            button.classList.toggle('affordable', canAfford);
            button.disabled = !canAfford;
        }
    });
}

    updateButtonStates() {
        if (this._isRendering) return;
        
        const buttons = DOMHelper.getUpgradeButtons();
        buttons.forEach(button => {
            const upgradeId = parseInt(button.dataset.id);
            const upgrade = this.game.autoclickers.find(u => u.id === upgradeId) || 
                          this.game.upgrades.find(u => u.id === upgradeId);
            
            if (upgrade) {
                const canAfford = this.game.mechanics.canAfford(upgrade);
                const currentlyAffordable = button.classList.contains('affordable');
                
                if (canAfford !== currentlyAffordable) {
                    button.classList.toggle('affordable', canAfford);
                    button.disabled = !canAfford;
                    
                    // Only update content if affordance changed
                    if (canAfford) {
                        const formatter = (num, decimals = 0) => 
                            this.formatter.formatNumber(num, decimals, null, decimals === 0, 'cost');
                        
                        button.innerHTML = `
                            <div class="upgrade-header">
                                ${UpgradeRenderer.renderFirstLine(upgrade)}
                            </div>
                            ${UpgradeRenderer.renderSecondLine(upgrade, formatter)}
                            ${UpgradeRenderer.renderTooltip(upgrade, formatter)}
                        `;
                    }
                }
            }
        });
    }

    refreshUpgradeButton(upgradeId) {
    const button = DOMHelper.getUpgradeButton(upgradeId);
    if (!button) return;

    const upgrade = this.game.autoclickers.find(u => u.id === upgradeId) || 
                   this.game.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const formatter = (num, decimals = 0) => 
        this.formatter.formatNumber(num, decimals, null, decimals === 0, 'cost');

    button.innerHTML = `
        <div class="upgrade-header">
            ${UpgradeRenderer.renderFirstLine(upgrade)}
        </div>
        ${UpgradeRenderer.renderSecondLine(upgrade, formatter)}
        ${UpgradeRenderer.renderTooltip(upgrade, formatter)}
    `;

    const canAfford = this.game.mechanics.canAfford(upgrade);
    button.classList.toggle('affordable', canAfford);
    button.disabled = !canAfford;
}
}