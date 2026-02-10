export class AutoclickerSystem {
  constructor(game) {
    this.game = game;
    this.interval = null;
    this._lastDPS = 0;
    this._needsRecalculation = true;
  }

  recalculateDPS() {
    this._needsRecalculation = true;
    this._lastDPS = 0;
  }

  setup() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      try {
        const dps = this.game.state.getTotalDPS();
        if (dps > 0) {
          // This check is slightly simplified for clarity
          this.game.state.addAutoDoros(dps / 10); // Add Doros based on DPS

          this.game.ui.updateScoreDisplay();
          this.game.ui.updateAllAffordability();
        }
      } catch (error) {
        console.error("DPS calculation error:", error);
      }
    }, 100);
  }

  cleanup() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this._lastDPS = 0;
    this._needsRecalculation = true;
  }
}
