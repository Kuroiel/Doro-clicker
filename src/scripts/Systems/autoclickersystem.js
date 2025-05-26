export class AutoclickerSystem {
    constructor(game) {
        this.game = game;
        this.interval = null;
        this._lastDPS = 0;
    }

    setup() {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(() => {
        const dps = this.game.state.getTotalDPS();
        if (dps > 0) {
            this.game.state.addAutoDoros(dps / 10);
            
            // Lightweight UI update for autoclicker income
            requestAnimationFrame(() => {
                this.game.ui.updateScoreDisplay();
                this.game.ui.updateStatsDisplay();
            });
        }
    }, 100);
    }

    cleanup() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this._lastDPS = 0;
    }
}