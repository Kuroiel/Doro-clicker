import { GameState } from './gameState.js';
import { upgrades } from './upgrades.js';

class DoroClicker {
    constructor() {
        this.gameState = new GameState();
        this.clickMultiplier = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderUpgrades();
        this.updateScoreDisplay();
    }

    setupEventListeners() {
        document.getElementById('doro-image').addEventListener('click', () => this.handleClick());
        document.getElementById('upgrades-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-button')) {
                const upgradeId = parseInt(e.target.dataset.id);
                this.handleUpgradePurchase(upgradeId);
            }
        });
    }

    handleClick() {
        this.gameState.increment(this.clickMultiplier);
        this.updateScoreDisplay();
    }

    handleUpgradePurchase(upgradeId) {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        if (this.gameState.purchaseUpgrade(upgrade)) {
            this.applyUpgrade(upgrade);
            this.updateScoreDisplay();
            this.renderUpgrades();
        }
    }

    applyUpgrade(upgrade) {
        this.clickMultiplier = upgrade.multiplier;
    }

    updateScoreDisplay() {
        document.getElementById('score-display').textContent = `Doros: ${this.gameState.doros}`;
    }

    renderUpgrades() {
        const container = document.getElementById('upgrades-container');
        container.innerHTML = upgrades.map(upgrade => `
            <button 
                class="upgrade-button"
                data-id="${upgrade.id}"
                ${upgrade.purchased || this.gameState.doros < upgrade.cost ? 'disabled' : ''}
            >
                ${upgrade.name} - Cost: ${upgrade.cost} Doros
            </button>
        `).join('');
    }
}

// Initialize game
new DoroClicker();