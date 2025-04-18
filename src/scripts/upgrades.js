export const upgrades = [
    {
        id: 1,
        name: "Doro Power",
        type: 'multiplier',
        baseCost: 10,
        value: 1, // Changed from 'multiplier: 2' to 'value: 1'
        purchased: 0,
        cost: function() { return this.baseCost * Math.pow(10, this.purchased) }
      },
    {
        id: 3,
        name: "Auto Clicker",
        type: 'autoclicker',
        baseCost: 100,
        value: 1,
        purchased: 0, // Change from boolean to number
        cost: function() { 
            // Gentle scaling for first 50 purchases, then steeper
            const phase = this.purchased <= 50 ? 1.07 : 1.15;
            const phasePurchases = this.purchased <= 50 
                ? this.purchased 
                : 50 + (this.purchased - 50) * 1.5;
            
            return Math.round(this.baseCost * Math.pow(phase, phasePurchases));
        }
    }
];