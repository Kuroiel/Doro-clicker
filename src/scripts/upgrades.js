// upgrades.js - Click multiplier upgrades
export const upgrades = [ // Changed from 'multipliers' to 'upgrades'
    {
        id: 1,
        name: "Doro Power",
        type: 'multiplier',
        baseCost: 10,
        value: 1,
        purchased: 0,
        cost: function() { 
            return this.baseCost * Math.pow(10, this.purchased);
        }
    }
    // Add new multiplier upgrades here
];