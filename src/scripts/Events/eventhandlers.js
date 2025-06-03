import { DOMHelper } from '../UI/dom.js';

export class EventHandlers {
    constructor(game) {
        this.game = game;
        this._listeners = [];
    }

    setupAllEventListeners() {
        this.setupDoroImageListeners();
        this.setupUpgradeButtonListeners();
        this.setupViewButtonListeners();
        this.setupStatsEvents();
    }

    setupDoroImageListeners() {
  const doroImage = DOMHelper.getDoroImage();
  if (!doroImage) return;

  // Remove existing click listener
  if (this._doroClickHandler) {
    doroImage.removeEventListener('click', this._doroClickHandler);
  }

  // Create and add new click handler
  this._doroClickHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.game.mechanics.handleClick();
  };
  this._addListener(doroImage, 'click', this._doroClickHandler);
  
  // Visual feedback handlers
  this._addListener(doroImage, 'mousedown', () => {
    doroImage.style.transform = 'scale(0.95)';
  });
  
  this._addListener(doroImage, 'mouseup', () => {
    doroImage.style.transform = 'scale(1)';
  });
    }

    setupUpgradeButtonListeners() {
        const sidebar = DOMHelper.getSidebarElement();
        if (!sidebar) return;
        
        this._addListener(sidebar, 'click', (e) => {
            const button = e.target.closest('.upgrade-button');
            if (button && !button.disabled) {
                const upgradeId = parseInt(button.dataset.id);
                if (!isNaN(upgradeId)) {
                    button.classList.add('processing');
                    this.game.mechanics.debouncePurchase(upgradeId);
                    requestAnimationFrame(() => button.classList.remove('processing'));
                }
            }
        });
    }

    setupViewButtonListeners() {
        document.querySelectorAll('.view-button').forEach(button => {
            this._addListener(button, 'click', (e) => {
                this.game.viewManager.switchView(e.target.dataset.view);
            });
        });
    }

    setupStatsEvents() {
        const statsElement = DOMHelper.getStatsElement();
        const showStatsButton = DOMHelper.getShowStatsButton();
        const closeStatsButton = DOMHelper.getCloseStatsButton();

        if (!statsElement || !showStatsButton || !closeStatsButton) return;

        this._addListener(showStatsButton, 'click', (e) => {
            e.stopPropagation();
            statsElement.style.display = 'block';
        });

        this._addListener(closeStatsButton, 'click', (e) => {
            e.stopPropagation();
            statsElement.style.display = 'none';
        });

        this._addListener(document, 'click', (e) => {
            if (statsElement.style.display === 'block' && 
                !statsElement.contains(e.target) && 
                e.target !== showStatsButton) {
                statsElement.style.display = 'none';
            }
        });
    }

    _addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this._listeners.push({ element, event, handler });
    }

    removeAllEventListeners() {
        this._listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this._listeners = [];
    }
}