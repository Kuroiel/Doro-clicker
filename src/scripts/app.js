import { GameState } from './gameState.js';
import { upgrades } from './upgrades.js';
import { DOMHelper } from './dom.js';

class DoroClicker {
    constructor() {
    // Initialize state first
    this.state = new GameState();

    this.upgrades = upgrades;
    
    // Initialize other properties
    this.clickMultiplier = 1;
    
    // Setup autoclicker
    this.setupAutoclicker();
    
    // Initialize the rest
    this.init();
    }

    init() {

        this.setupEventListeners();
        this.setupStatsEvents(); 
        this.state.addListener(() => this.updateUI());
        this.updateUI();
    }

    updateUI() {
        this.updateScoreDisplay();
        this.renderUpgrades();
        this.updateStatsDisplay();
      }
      renderUpgrades() {
        const autoContainer = DOMHelper.getAutoclickersContainer();
        const upgradeContainer = DOMHelper.getUpgradesContainer();
    
        // Split upgrades by type
        const autoclickers = this.upgrades.filter(u => u.type === 'autoclicker');
        const multipliers = this.upgrades.filter(u => u.type === 'multiplier');
    
        autoContainer.innerHTML = autoclickers.map(upgrade => this.renderUpgradeButton(upgrade)).join('');
        upgradeContainer.innerHTML = multipliers.map(upgrade => this.renderUpgradeButton(upgrade)).join('');
    }

    renderUpgradeButton(upgrade) {
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        const canAfford = this.canAfford(upgrade);
    
        return `
            <button 
                class="upgrade-button ${canAfford ? 'affordable' : ''}"
                data-id="${upgrade.id}"
                ${!canAfford ? 'disabled' : ''}
            >
                ${upgrade.name} 
                ${upgrade.type === 'multiplier' ? `(Level ${upgrade.purchased + 1})` : ''}
                - Cost: ${cost} Doros
                ${upgrade.type === 'autoclicker' ? `(Owned: ${upgrade.purchased})` : ''}
            </button>
        `;
    }
    
// app.js - Updated canAfford method
    canAfford(upgrade) {
    const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
    return this.state.doros >= cost;
    }
      setupAutoclicker() {
        this.autoclickerInterval = setInterval(() => {
            if (this.state?.autoclickers > 0) {
                const amount = this.state.autoclickers; // 1 Doro per autoclicker
                this.state.addAutoDoros(amount);
            }
        }, 1000);
    }
      
      // Add component cleanup
      destroy() {
        clearInterval(this.autoclickerInterval);
      }

    setupEventListeners() {
        const doroImage = DOMHelper.getDoroImage();
        doroImage.addEventListener('click', () => this.handleClick());
        
        doroImage.addEventListener('mousedown', () => {
            doroImage.style.transform = 'scale(0.95)';
        });
        
        doroImage.addEventListener('mouseup', () => {
            doroImage.style.transform = 'scale(1)';
        });

        DOMHelper.getUpgradesContainer().addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-button')) {
                const upgradeId = parseInt(e.target.dataset.id);
                this.purchaseUpgrade(upgradeId);
            }
        });

        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
    }

    switchView(view) {
        // Update buttons
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    
        // Update containers
        document.querySelectorAll('.upgrade-view').forEach(container => {
            container.classList.toggle('active-view', container.id === `${view}-container`);
        });
    }

    handleClick() {
        this.state.manualClicks++;
        this.state.increment(this.clickMultiplier);

        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${this.state.doros}`);
    }
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        if (!upgrade || this.state.doros < cost) return false;
    
        this.state.doros -= cost;

        upgrade.purchased += 1;
        this.applyUpgrade(upgrade);
        this.updateScoreDisplay();
        this.renderUpgrades();
        this.updateUI();
        return true;
    }

    applyUpgrade(upgrade) {
        if (upgrade.type === 'multiplier') {
            this.clickMultiplier *= upgrade.multiplier;
        } else if (upgrade.type === 'autoclicker') {
            this.state.autoclickers += upgrade.value;
        }
      }

    updateScoreDisplay() {
        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${this.state.doros}`);
    }

// app.js - Updated renderUpgrades method
renderUpgrades() {
    const container = document.getElementById('upgrades-container');
    container.innerHTML = this.upgrades.map(upgrade => {
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        // Calculate affordability using class method
        const canAfford = this.canAfford(upgrade);

        return `
            <button 
                class="upgrade-button ${canAfford ? 'affordable' : ''}"
                data-id="${upgrade.id}"
                ${!canAfford ? 'disabled' : ''}
            >
                ${upgrade.name} ${upgrade.type === 'multiplier' ? `(Level ${upgrade.purchased + 1})` : ''} - 
                Cost: ${cost} Doros
                ${upgrade.type === 'autoclicker' ? `(Owned: ${upgrade.purchased})` : ''}
            </button>
        `;
    }).join('');
}

    updateStatsDisplay() {
        const stats = DOMHelper.getStatElements();
        DOMHelper.setText(stats.clicks, this.state.manualClicks);
        DOMHelper.setText(stats.dps, this.state.autoclickers);
        DOMHelper.setText(stats.total, this.state.totalDoros);
    }

    setupStatsEvents() {
            // Get reference to the stats overlay element
    const statsElement = DOMHelper.getStatsElement();

    // Toggle stats visibility when clicking "View Stats" button
    document.getElementById('show-stats').addEventListener('click', () => {
        // Check current visibility state using computed style
        const isVisible = window.getComputedStyle(statsElement).display === 'block';
        // Toggle to opposite state
        DOMHelper.toggleVisibility(statsElement, !isVisible);
    });
        
    // Preserve close button functionality
    document.getElementById('close-stats').addEventListener('click', () => {
        DOMHelper.toggleVisibility(statsElement, false);
    });
    }
}

// At the end of app.js
const game = new DoroClicker();

// For cleanup if needed (e.g., in tests)
window.doroGame = game;