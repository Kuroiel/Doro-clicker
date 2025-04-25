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
        
        // Game mechanics
        this.clickMultiplier = 1;
        
        // Internal flags
        this._lastDoros = 0;
        this._needsUpgradeRender = true;
        this._processingPurchase = false;
        this._purchaseDebounce = false;
        
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
        this.autoclickerInterval = setInterval(() => {
            if (this.state?.autoclickers > 0) {
                const amount = this.state.autoclickers;
                this.state.addAutoDoros(amount);
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
    
        try {
            const upgrade = this.autoclickers.find(u => u?.id === upgradeId) || 
                           this.upgrades.find(u => u?.id === upgradeId);
    
            if (!upgrade) {
                console.warn(`Upgrade ${upgradeId} not found`);
                return false;
            }
    
            if (!this.canAfford(upgrade)) {
                console.debug(`Purchase prevented - revalidation failed`);
                return false;
            }
    
            const cost = typeof upgrade.cost === 'function' 
                ? upgrade.cost() 
                : upgrade.cost;
    
            this.state.doros -= cost;
            upgrade.purchased += 1;
            this.applyUpgrade(upgrade);
    
            requestAnimationFrame(() => {
                this.updateUI();
                this._processingPurchase = false;
            });
    
            return true;
        } catch (error) {
            console.error('Purchase error:', error);
            this._processingPurchase = false;
            return false;
        }
    }

    applyUpgrade(upgrade) {
        if (upgrade.type === 'multiplier') {
            this.clickMultiplier += upgrade.value;
        } else if (upgrade.type === 'autoclicker') {
            this.state.autoclickers += upgrade.value;
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
        
        if (this._needsUpgradeRender || !this._lastDoros) {
            this.renderUpgrades();
            this._lastDoros = this.state.doros;
            this._needsUpgradeRender = false;
        } else {
            this.updateButtonStates();
        }
    }

    updateScoreDisplay() {
        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${this.state.doros}`);
    }

    updateStatsDisplay() {
        const stats = DOMHelper.getStatElements();
        DOMHelper.setText(stats.clicks, this.state.manualClicks);
        DOMHelper.setText(stats.dps, this.state.autoclickers);
        DOMHelper.setText(stats.total, this.state.totalDoros);
    }

    switchView(view) {
        const validViews = ['autoclickers', 'upgrades'];
        if (!validViews.includes(view)) return;
    
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    
        document.querySelectorAll('.upgrade-view').forEach(container => {
            const isTarget = container.id === `${view}-container`;
            container.classList.toggle('active-view', isTarget);
        });
    }

    // ======================
    // 5. Upgrade Management
    // ======================
    renderUpgrades() {
        const autoContainer = DOMHelper.getAutoclickersContainer();
        const upgradeContainer = DOMHelper.getUpgradesContainer();

        autoContainer.innerHTML = '';
        upgradeContainer.innerHTML = '';

        // Render autoclickers
        this.autoclickers.forEach(upgrade => {
            autoContainer.insertAdjacentHTML('beforeend', this.renderUpgradeButton(upgrade));
        });
        
        // Separate and sort upgrades
        const { visibleUpgrades, hiddenUpgrades } = this.sortUpgrades();
        
        // Render upgrades
        visibleUpgrades.forEach(upgrade => {
            upgradeContainer.insertAdjacentHTML('beforeend', this.renderUpgradeButton(upgrade));
        });

        hiddenUpgrades.forEach(upgrade => {
            upgradeContainer.insertAdjacentHTML('beforeend', this.renderUpgradeButton(upgrade));
        });
    }

    sortUpgrades() {
        const visibleUpgrades = [];
        const hiddenUpgrades = [];
        
        this.upgrades.forEach(upgrade => {
            if (typeof upgrade.isVisible !== 'function') {
                visibleUpgrades.push(upgrade);
            } else if (upgrade.isVisible(this.state)) {
                hiddenUpgrades.push(upgrade);
            }
        });

        hiddenUpgrades.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        return { visibleUpgrades, hiddenUpgrades };
    }

    renderUpgradeButton(upgrade) {
        const canAfford = this.canAfford(upgrade);
        return UpgradeRenderer.renderUpgradeButton(upgrade, canAfford);
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
        const sidebar = document.querySelector('.sidebar');
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
        document.getElementById('show-stats').addEventListener('click', () => {
            const isVisible = window.getComputedStyle(statsElement).display === 'block';
            DOMHelper.toggleVisibility(statsElement, !isVisible);
        });
        
        document.getElementById('close-stats').addEventListener('click', () => {
            DOMHelper.toggleVisibility(statsElement, false);
        });
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

    // ======================
    // 8. Cleanup & Instance Creation
    // ======================
    destroy() {
        clearInterval(this.autoclickerInterval);
    }
}

// Create game instance
const game = new DoroClicker();
window.doroGame = game;

export { DoroClicker };