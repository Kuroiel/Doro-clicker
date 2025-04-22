// upgrades.js - Click multiplier upgrades
export const upgrades = [
    {
        id: 1,
        name: "Doro Power",
        type: 'multiplier',
        baseCost: 10,
        value: 1,
        purchased: 0,
        icon: './src/assets/dorostare.webp',
        description: 'More Doros?',
        effectDescription: (value, purchased) => 
            `Increases Doros per click by ${value}.\nCurrently increasing click power by ${value * purchased}.\n(${purchased} × ${value} per level)`,
        cost: function() { 
            return this.baseCost * Math.pow(10, this.purchased);
        }
    }
];