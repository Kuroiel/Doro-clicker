
export const autoclickers = [
    {
        id: 2,
        name: "Lurking Doro",
        type: 'autoclicker',
        baseCost: 10,
        baseDPS: 1, // Add this to track base DPS before multipliers
        value: 1, // This will now represent the current DPS after upgrades
        purchased: 0,
        icon: './src/assets/dorocreep.webp',
        description: 'A lurking Doro that slowly gets you more Doros.',
        effectDescription: (value, purchased) => 
            `Provides ${value} Doro per second per Lurking Doro.\nCurrently providing: ${value * purchased} Doros per second.`,
        // Modify the cost function to use baseDPS where appropriate
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.1;
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.7;
            cost *= Math.pow(decadeFactor, decades);

            if (purchased >= 1000) cost *= 10;
            else if (purchased >= 500) cost *= 5;
            else if (purchased >= 200) cost *= 5;
            else if (purchased >= 100) cost *= 5;

            if (purchased > 0) {
                let prevCost = this.baseCost;
                prevCost *= Math.pow(baseGrowth, purchased - 1);
                const prevDecades = Math.floor((purchased - 1) / 10);
                prevCost *= Math.pow(decadeFactor, prevDecades);
                
                if (purchased - 1 >= 1000) prevCost *= 10;
                else if (purchased - 1 >= 500) prevCost *= 5;
                else if (purchased - 1 >= 200) prevCost *= 5;
                else if (purchased - 1 >= 100) prevCost *= 5;
                
                cost = Math.max(cost, prevCost + 1);
            }

            return Math.round(cost);
        }
    }
];