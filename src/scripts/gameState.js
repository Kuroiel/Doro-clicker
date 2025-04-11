export class GameState {
    constructor() {
        this.doros = 0;
        this.upgrades = [];
    }

    increment(amount = 1) {
        this.doros += amount;
    }

    purchaseUpgrade(upgrade) {
        if (this.doros >= upgrade.cost) {
            this.doros -= upgrade.cost;
            upgrade.purchased = true;
            return true;
        }
        return false;
    }
}