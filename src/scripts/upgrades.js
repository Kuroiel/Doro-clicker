// upgrades.js - Add the new upgrade to the array
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
    },
    // Add new Lurking Doro upgrade
    {
        id: 3,
        name: "Lurking Doro Upgrade",
        type: 'dpsMultiplier',
        baseCost: 500,
        value: 1.15,
        purchased: 0,
        icon: './src/assets/dorocreep.webp',
        description: 'Upgrade the Lurking Doros to lurk better.',
        effectDescription: (value, purchased) => 
            `Increases the base DPS of Lurking Doros by 15%.\nCurrent multiplier: ${Math.pow(value, purchased).toFixed(2)}x`,
        cost: function() {
            const costLevels = [500, 10000, 3000000, 10000000];
            return costLevels[Math.min(this.purchased, costLevels.length - 1)];
        },
        // Improved visibility check
        isVisible: function(gameState) {
            const lurkingDoros = gameState.autoclickers;
            const thresholds = [10, 20, 50, 100];
            const nextThreshold = thresholds[this.purchased];
            
            // Only show if:
            // 1. We haven't purchased all upgrades yet
            // 2. We've reached the next threshold
            return this.purchased < thresholds.length && 
                   lurkingDoros >= nextThreshold;
        }
    }
];