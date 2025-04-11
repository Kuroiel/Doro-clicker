import { GameState } from './gameState.js';
import { upgrades } from './upgrades.js';
import { DOMHelper } from './dom.js';

class DoroClicker {
    constructor() {
    // Initialize state first
    this.state = new GameState();
    
    // Initialize other properties
    this.clickMultiplier = 1;
    
    // Setup autoclicker
    this.setupAutoclicker();
    
    // Initialize the rest
    this.init();
    }

    init() {

        this.setupEventListeners();
        this.setupAutoclicker();
        this.state.addListener(() => this.updateUI());
        this.updateUI();
    }

    updateUI() {
        this.updateScoreDisplay();
        this.renderUpgrades();
      }
      renderUpgrades() {
        const container = document.getElementById('upgrades-container');
        if (!container) {
          console.error('Upgrades container not found!');
          return;
        }
        
        container.innerHTML = this.state.upgrades.map(upgrade => `
          <button class="upgrade-button ${this.canAfford(upgrade) ? 'affordable' : ''}"
                  data-id="${upgrade.id}"
                  ${upgrade.purchased ? 'disabled' : ''}
                  data-testid="upgrade-${upgrade.id}">
            ${upgrade.name} - Cost: ${upgrade.cost} Doros
            ${upgrade.purchased ? ' (Purchased)' : ''}
          </button>
        `).join('');
      }
    
      canAfford(upgrade) {
        return !upgrade.purchased && this.state.doros >= upgrade.cost;
      }
      setupAutoclicker() {
        this.autoclickerInterval = setInterval(() => {
            if (this.state?.autoclickers > 0) { // Optional chaining
              this.state.increment(this.state.autoclickers);
            }
          }, 1000);
      }
      
      // Add component cleanup
      destroy() {
        clearInterval(this.autoclickerInterval);
      }

    setupEventListeners() {
        const doroImage = document.getElementById('doro-image');
        doroImage.addEventListener('click', () => this.handleClick());
        
        doroImage.addEventListener('mousedown', () => {
            doroImage.style.transform = 'scale(0.95)';
        });
        
        doroImage.addEventListener('mouseup', () => {
            doroImage.style.transform = 'scale(1)';
        });

        document.getElementById('upgrades-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-button')) {
                const upgradeId = parseInt(e.target.dataset.id);
                this.handleUpgradePurchase(upgradeId);
            }
        });
    }

    handleClick() {
        this.state.increment(this.clickMultiplier);
        this.updateScoreDisplay();
    }

    handleUpgradePurchase(upgradeId) {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade.purchased && this.state.purchaseUpgrade(upgrade)) {
            this.applyUpgrade(upgrade);
            this.updateScoreDisplay();
            this.renderUpgrades();
        }
    }

    applyUpgrade(upgrade) {
        if (upgrade.type === 'multiplier') {
            this.clickMultiplier = upgrade.multiplier;
        } else if (upgrade.type === 'autoclicker') {
            this.state.autoclickers += upgrade.value;
        }
    }

    updateScoreDisplay() {
        document.getElementById('score-display').textContent = `Doros: ${this.state.doros}`;
    }

    renderUpgrades() {
        const container = document.getElementById('upgrades-container');
        container.innerHTML = upgrades.map(upgrade => `
            <button 
                class="upgrade-button"
                data-id="${upgrade.id}"
                ${upgrade.purchased ? 'disabled' : ''}
                ${this.state.doros < upgrade.cost ? 'disabled' : ''}
            >
                ${upgrade.name} - Cost: ${upgrade.cost} Doros
                ${upgrade.purchased ? ' (Purchased)' : ''}
            </button>
        `).join('');
    }
}

// At the end of app.js
const game = new DoroClicker();

// For cleanup if needed (e.g., in tests)
window.doroGame = game;