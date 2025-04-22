import { GameState } from './gameState.js';
import { autoclickers } from './autoclickers.js';
import { upgrades } from './upgrades.js'; // Updated reference
import { DOMHelper } from './dom.js';

class DoroClicker {
    constructor() {
    // Initialize state first
    this.state = new GameState();

    this.autoclickers = autoclickers;
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
            // Set default view to autoclickers
    this.switchView('autoclickers');
        this.updateUI();
    }

    updateUI() {
        this.updateScoreDisplay();
        this.renderUpgrades();
        this.updateStatsDisplay();
      }
// Update renderUpgrades method to ensure correct filtering
renderUpgrades() {
    const autoContainer = DOMHelper.getAutoclickersContainer();
    const upgradeContainer = DOMHelper.getUpgradesContainer();

    // Clear previous content
    autoContainer.innerHTML = '';
    upgradeContainer.innerHTML = '';

    // Render autoclickers
    this.autoclickers.forEach(upgrade => {
        autoContainer.insertAdjacentHTML('beforeend', this.renderUpgradeButton(upgrade));
    });
    
    // Render upgrades (formerly multipliers)
    this.upgrades.forEach(upgrade => { // Changed from 'multipliers' to 'upgrades'
        upgradeContainer.insertAdjacentHTML('beforeend', this.renderUpgradeButton(upgrade));
    });
}

// app.js - Update renderUpgradeButton method
renderUpgradeButton(upgrade) {
    const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
    const canAfford = this.canAfford(upgrade);
    const isLurkingDoro = upgrade.id === 2; // Identify Lurking Doro by ID

    // Build button content
    let innerHTML = '';
    
    // Add icon for Lurking Doro
    if (isLurkingDoro) {
        innerHTML += `<img src="./src/assets/dorocreep.webp" alt="Lurking Doro" class="upgrade-icon">`;
    }

    // Main button text
    innerHTML += `
        ${upgrade.name} 
        ${upgrade.type === 'multiplier' ? `(Level ${upgrade.purchased})` : ''}
        - Cost: ${cost} Doros
        ${upgrade.type === 'autoclicker' ? `(Owned: ${upgrade.purchased})` : ''}
    `;

    // Add tooltip for Lurking Doro
    if (isLurkingDoro) {
        innerHTML += `
            <div class="upgrade-tooltip">
                <p>A lurking Doro that slowly gets you more Doros.</p>
                <p><i>Provides 1 Doro per second<br>
                Currently providing: ${this.state.autoclickers} Doros per second</i></p>
            </div>
        `;
    }

    return `
        <button 
            class="upgrade-button ${canAfford ? 'affordable' : ''}"
            data-id="${upgrade.id}"
            ${!canAfford ? 'disabled' : ''}
        >
            ${innerHTML}
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

        document.querySelector('.sidebar').addEventListener('click', (e) => {
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
        // Validate view parameter
        const validViews = ['autoclickers', 'upgrades'];
        if (!validViews.includes(view)) return;
    
        // Update button states
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    
        // Update container visibility
        document.querySelectorAll('.upgrade-view').forEach(container => {
            const isTarget = container.id === `${view}-container`;
            container.classList.toggle('active-view', isTarget);
        });
    }

    handleClick() {
        this.state.manualClicks++;
        this.state.increment(this.clickMultiplier);

        DOMHelper.setText(DOMHelper.getScoreElement(), `Doros: ${this.state.doros}`);
    }
    purchaseUpgrade(upgradeId) {
        // Search both upgrade types
        let upgrade = this.autoclickers.find(u => u.id === upgradeId) || 
                     this.upgrades.find(u => u.id === upgradeId); // Changed from 'multipliers'
        
        if (!upgrade) return false;
    
        const cost = typeof upgrade.cost === 'function' ? upgrade.cost() : upgrade.cost;
        if (this.state.doros < cost) return false;
    
        this.state.doros -= cost;
        upgrade.purchased += 1;
        this.applyUpgrade(upgrade);
        this.updateUI();
        return true;
    }

    applyUpgrade(upgrade) {
        if (upgrade.type === 'multiplier') {
            this.clickMultiplier += upgrade.value;
        } else if (upgrade.type === 'autoclicker') {
            this.state.autoclickers += upgrade.value;
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