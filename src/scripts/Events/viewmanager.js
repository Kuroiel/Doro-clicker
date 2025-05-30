import { DOMHelper } from '../UI/dom.js';

export class ViewManager {
    constructor(game) {
        this.game = game;
        this.currentView = 'autoclickers';
    }

    switchView(view) {
    const validViews = ['autoclickers', 'upgrades'];
    if (!validViews.includes(view)) return;

    this.currentView = view;
    this._updateViewButtons();
    this._updateViewContainers();
    
    // Use standard UI update unless view changes require full render
    this.game.ui.updateUI();
    }

    _updateViewButtons() {
        const viewButtons = DOMHelper.getViewButtons();
        viewButtons.forEach(btn => {
            DOMHelper.toggleClass(btn, 'active', btn.dataset.view === this.currentView);
        });
    }

    _updateViewContainers() {
        const upgradeViews = DOMHelper.getUpgradeViews();
        upgradeViews.forEach(container => {
            const isTarget = container.id === `${this.currentView}-container`;
            DOMHelper.toggleClass(container, 'active-view', isTarget);
            
            if (isTarget) {
                this.game.ui.renderUpgrades();
            }
        });
    }

    getCurrentView() {
        return this.currentView;
    }
}