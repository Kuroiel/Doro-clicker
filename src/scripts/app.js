import { GameState } from './gameState.js';
import { autoclickers } from './autoclickers.js';
import { upgrades } from './upgrades.js';
import { DOMHelper } from './dom.js';
import { UpgradeRenderer } from './upgradeRenderer.js';

class DoroClicker {
    // ======================
    // 1. Constructor & Core Properties
    // ======================
    constructor() {
        // Initialize state first
        this.state = new GameState();
        this.autoclickers = autoclickers;
        this.upgrades = upgrades;
        this.state.setAutoclickers(this.autoclickers);
        
        // Game mechanics
        this.clickMultiplier = 1;
        
        // Internal flags
        this._lastDoros = 0;
        this._needsUpgradeRender = true;
        this._processingPurchase = false;
        this._purchaseDebounce = false;
        this._sidebarElement = null;
        
        // Setup game systems
        this.setupAutoclicker();
        this.init();
    }

    // ======================
    // 2. Initialization Methods
    // ======================
    init() {
        this.setupEventListeners();
        this.setupStatsEvents();
        this.state.addListener(() => this.updateUI());
        this.switchView('autoclickers');
        this.updateUI();
    }

    setupAutoclicker() {
        if (this.autoclickerInterval) {
            clearInterval(this.autoclickerInterval);
        }
    
        // Set up new interval that uses getTotalDPS()
        this.autoclickerInterval = setInterval(() => {
            const dps = this.state.getTotalDPS();
            if (dps > 0) {
                this.state.addAutoDoros(dps);
            }
        }, 1000); 
    }

    // ======================
    // 3. Core Game Logic
    // ======================
    handleClick() {
        this.state.manualClicks++;
        this.state.increment(this.clickMultiplier);
        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${this.state.doros}`);
    }

    purchaseUpgrade(upgradeId) {
        if (this._processingPurchase) return false;
        this._processingPurchase = true;
        this._needsUpgradeRender = true; // Force full UI update after purchase
    
        try {
            const upgrade = this.autoclickers.find(u => u?.id === upgradeId) || 
                           this.upgrades.find(u => u?.id === upgradeId);
    
            if (!upgrade) {
                console.warn(`Upgrade ${upgradeId} not found`);
                return false;
            }
    
            if (!this.canAfford(upgrade)) {
    //            console.debug(`Purchase prevented - revalidation failed`);
                return false;
            }
    
            const cost = typeof upgrade.cost === 'function' 
                ? upgrade.cost() 
                : upgrade.cost;
    
            this.state.doros -= cost;
            upgrade.purchased += 1;
            this.applyUpgrade(upgrade);
    
            // Immediately update the UI
            this.updateUI();
    
            return true;
        } catch (error) {
            console.error('Purchase error:', error);
            return false;
        } finally {
            this._processingPurchase = false;
        }
    }

    applyUpgrade(upgrade) {
        if (upgrade.type === 'multiplier') {
            this.clickMultiplier += upgrade.value;
        } else if (upgrade.type === 'autoclicker') {
        } else if (upgrade.type === 'dpsMultiplier') {
            const lurkingDoro = this.autoclickers.find(a => a.id === 2);
            if (lurkingDoro) {
                lurkingDoro.value = lurkingDoro.baseDPS * Math.pow(upgrade.value, upgrade.purchased);
            }
        } else if (upgrade.type === 'globalDpsMultiplier') {
            this.state.applyGlobalDpsMultiplier(upgrade.value);
        }
    }

    // ======================
    // 4. UI Update Methods
    // ======================
    updateUI() {
        this.updateScoreDisplay();
        this.updateStatsDisplay();
        
        // Always re-render if needed or if doros have changed significantly
        if (this._needsUpgradeRender || Math.abs(this.state.doros - this._lastDoros) > 10) {
            this.renderUpgrades();
            this._lastDoros = this.state.doros;
            this._needsUpgradeRender = false;
        } else {
            this.updateAllButtonContents();
        }
    }

    updateScoreDisplay() {
    // Always format doros as whole number with thousand separators
    const formattedDoros = this.formatNumber(Math.floor(this.state.doros), 0, 1000000, true);
    DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${formattedDoros}`);
    }

    updateStatsDisplay() {
        const stats = DOMHelper.getStatElements();
        if (!stats) return;  // Early return if elements not found
        
        // Update manual clicks count with thousand separators
        DOMHelper.setText(stats.clicks, this.formatNumber(this.state.manualClicks));
        
        // Update DPS display with 1 decimal place and thousand separators
        const totalDPS = this.state.getTotalDPS();
        DOMHelper.setText(stats.dps, this.formatNumber(totalDPS, 1));
        
        // Update total doros count with thousand separators
        DOMHelper.setText(stats.total, this.formatNumber(Math.floor(this.state.totalDoros)));
    }

    updateAllButtonContents() {
        const buttons = DOMHelper.getUpgradeButtons();
        buttons.forEach(button => {
            const upgradeId = parseInt(button.dataset.id);
            const upgrade = this.autoclickers.find(u => u.id === upgradeId) || 
                           this.upgrades.find(u => u.id === upgradeId);
            
            if (upgrade) {
                // Create a consistent formatter function with fixed parameters
                const consistentFormatter = (num, decimals = 0) => 
                    this.formatNumber(num, decimals, 1000000, decimals === 0);
                
                const canAfford = this.canAfford(upgrade);
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
        const validViews = ['autoclickers', 'upgrades'];
        if (!validViews.includes(view)) return;
    
        // Force UI update before switching views
        this._needsUpgradeRender = true;
        
        const viewButtons = DOMHelper.getViewButtons();
        viewButtons.forEach(btn => {
            DOMHelper.toggleClass(btn, 'active', btn.dataset.view === view);
        });
    
        const upgradeViews = DOMHelper.getUpgradeViews();
        upgradeViews.forEach(container => {
            const isTarget = container.id === `${view}-container`;
            DOMHelper.toggleClass(container, 'active-view', isTarget);
            // Force render when view becomes active
            if (isTarget) this.renderUpgrades();
        });
    }

    // ======================
    // 5. Upgrade Management
    // ======================
    renderUpgrades() {
        const autoContainer = DOMHelper.getAutoclickersContainer();
        const upgradeContainer = DOMHelper.getUpgradesContainer();
    
        if (autoContainer) autoContainer.innerHTML = '';
        if (upgradeContainer) upgradeContainer.innerHTML = '';
    
        // Create consistent formatter for all upgrades
        const consistentFormatter = (num, decimals = 0) => 
            this.formatNumber(num, decimals, 1000000, decimals === 0);
    
        // Render autoclickers
        this.autoclickers.forEach(upgrade => {
            const canAfford = this.canAfford(upgrade);
            autoContainer.insertAdjacentHTML('beforeend', 
                UpgradeRenderer.renderUpgradeButton(upgrade, canAfford, consistentFormatter));
        });
        
        // Render upgrades
        const { visibleUpgrades, hiddenUpgrades } = this.sortUpgrades();
        [...visibleUpgrades, ...hiddenUpgrades].forEach(upgrade => {
            const canAfford = this.canAfford(upgrade);
            upgradeContainer.insertAdjacentHTML('beforeend', 
                UpgradeRenderer.renderUpgradeButton(upgrade, canAfford, consistentFormatter));
        });
    
        this.updateStatsDisplay();
    }

    sortUpgrades() {
        const visibleUpgrades = [];
        const hiddenUpgrades = [];
        
        this.upgrades.forEach(upgrade => {
            try {
                if (typeof upgrade.isVisible !== 'function') {
                    // Always visible if no visibility check
                    visibleUpgrades.push(upgrade);
                    return;
                }
    
                // Create complete game state context for visibility check
                const gameStateContext = {
                    autoclickers: this.autoclickers,
                    getTotalDPS: () => this.state.getTotalDPS(),
                    state: this.state,
                    upgrades: this.upgrades
                };
                
                const isVisible = upgrade.isVisible(gameStateContext);
                
                if (isVisible) {
                    visibleUpgrades.push(upgrade);
                } else if (upgrade.purchased > 0) {
                    // Only show in hidden if already purchased
                    hiddenUpgrades.push(upgrade);
                }
                // Otherwise don't show at all
            } catch (error) {
                console.error(`Error checking visibility for upgrade ${upgrade.id}:`, error);
                // Default to visible if there's an error
                visibleUpgrades.push(upgrade);
            }
        });
    
        // Sort hidden upgrades by priority (highest first)
        hiddenUpgrades.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return { visibleUpgrades, hiddenUpgrades };
    }

    renderUpgradeButton(upgrade) {
        const canAfford = this.canAfford(upgrade);
        // Pass the formatNumber method to the renderer for consistent formatting
        return UpgradeRenderer.renderUpgradeButton(
            upgrade, 
            canAfford,
            (num, decimals) => this.formatNumber(num, decimals)
        );
    }
    
    canAfford(upgrade) {
        try {
            const cost = typeof upgrade.cost === 'function' 
                ? upgrade.cost() 
                : upgrade.cost;
            
            if (isNaN(cost)) {
                console.warn(`Invalid cost calculation for upgrade ${upgrade.id}`);
                return false;
            }
            
            return Math.floor(this.state.doros) >= Math.ceil(cost);
        } catch (error) {
            console.error('Error in canAfford:', error);
            return false;
        }
    }

    updateButtonStates() {
        const buttons = DOMHelper.getUpgradeButtons();
        buttons.forEach(button => {
            const upgradeId = parseInt(button.dataset.id);
            const upgrade = this.autoclickers.find(u => u.id === upgradeId) || 
                            this.upgrades.find(u => u.id === upgradeId);
            
            if (upgrade) {
                const canAfford = this.canAfford(upgrade);
                const currentlyAffordable = button.classList.contains('affordable');
                
                if (canAfford !== currentlyAffordable) {
                    button.classList.toggle('affordable', canAfford);
                    button.disabled = !canAfford;
                }
            }
        });
    }

    // ======================
    // 6. Event Handlers
    // ======================
    setupEventListeners() {
        this.setupDoroImageListeners();
        this.setupUpgradeButtonListeners();
        this.setupViewButtonListeners();
    }

    setupDoroImageListeners() {
        const doroImage = DOMHelper.getDoroImage();
        doroImage.addEventListener('click', () => this.handleClick());
        
        doroImage.addEventListener('mousedown', () => {
            doroImage.style.transform = 'scale(0.95)';
        });
        
        doroImage.addEventListener('mouseup', () => {
            doroImage.style.transform = 'scale(1)';
        });
    }

    
      setupUpgradeButtonListeners() {
        const sidebar = DOMHelper.getSidebarElement();
        if (!sidebar) {
          console.warn('Sidebar element not found');
          return;
        }
        sidebar.addEventListener('click', (e) => {
          const button = e.target.closest('.upgrade-button');
          if (button && !button.disabled) {
            const upgradeId = parseInt(button.dataset.id);
            if (!isNaN(upgradeId)) {
              button.classList.add('processing');
              this.debouncePurchase(upgradeId);
              requestAnimationFrame(() => {
                button.classList.remove('processing');
              });
            }
          }
        });
      }

    setupViewButtonListeners() {
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    setupStatsEvents() {
        const statsElement = DOMHelper.getStatsElement();
        const showStatsButton = DOMHelper.getShowStatsButton();
        const closeStatsButton = DOMHelper.getCloseStatsButton();
    
        if (!statsElement || !showStatsButton || !closeStatsButton) {
            console.warn('Stats elements not found');
            return;
        }
    
        showStatsButton.addEventListener('click', () => {
            const isVisible = window.getComputedStyle(statsElement).display === 'block';
            DOMHelper.toggleVisibility(statsElement, !isVisible);
        });
        
        closeStatsButton.addEventListener('click', () => {
            DOMHelper.toggleVisibility(statsElement, false);
        });
    }

    get sidebarElement() {
        if (!this._sidebarElement) {
          this._sidebarElement = document.querySelector('.sidebar');
        }
        return this._sidebarElement;
      }
    


    // ======================
    // 7. Utility Methods
    // ======================
    debouncePurchase(upgradeId) {
        if (this._purchaseDebounce) return;
        this._purchaseDebounce = true;
        
        setTimeout(() => {
            this.purchaseUpgrade(upgradeId);
            this._purchaseDebounce = false;
        }, 50);
    }

    get debugInfo() {
        return {
            initialized: !!this.state,
            doros: this.state?.doros,
            upgrades: this.upgrades?.length,
            autoclickers: this.autoclickers?.length
        };
    }

    formatNumber(num, decimalPlaces = 0, scientificThreshold = 1000000, roundDown = false) {
        // Handle invalid inputs
        if (typeof num !== 'number' || isNaN(num)) {
            console.warn('Invalid number passed to formatNumber:', num);
            return '0';
        }
    
        // Apply rounding if requested
        let processedNum = roundDown ? Math.floor(num) : num;
        
        // For very large numbers, use scientific notation
        if (Math.abs(processedNum) >= scientificThreshold) {
            return processedNum.toExponential(2);
        }
    
        // Manual thousand separator implementation for consistency
        const parts = processedNum.toFixed(decimalPlaces).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
        return parts.length > 1 ? parts.join('.') : parts[0];
    }

    formatUpgradeCost(cost) {
        try {
            const costValue = typeof cost === 'function' ? cost() : cost;
            return this.formatNumber(costValue, 0, 1000000, true); // Whole numbers, floor values
        } catch (error) {
            console.error('Error formatting upgrade cost:', error);
            return '0';
        }
    }
    // ======================
    // 8. Cleanup & Instance Creation
    // ======================
    destroy() {
        clearInterval(this.autoclickerInterval);
    }
}

// Create game instance
try {
    const game = new DoroClicker();
    window.doroGame = game;
    
    // Add debug flag for test environment
    if (typeof window.__TESTING__ !== 'undefined') {
        window.__TESTING__.gameReady = true;
    }
} catch (error) {
    console.error('Game initialization failed:', error);
    // Provide fallback for tests
    if (typeof window.__TESTING__ !== 'undefined') {
        window.doroGame = {
            state: {},
            upgrades: [],
            autoclickers: [],
            updateUI: () => {}
        };
    }
}
// Ensure game is initialized even if DOM isn't fully ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.doroGame) {
        window.doroGame = new DoroClicker();
    }
});
export { DoroClicker };