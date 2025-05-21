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
            `Provides ${value} Doro per second.\nCurrently providing: ${value * purchased} Doros per second.`,
        // Modify the cost function to use baseDPS where appropriate
        cost: function() { 
            if (typeof this.purchased !== 'number' || this.purchased < 0) {
                console.error('Invalid purchased count:', this.purchased);
                return Infinity;
            }
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
    },
    // New Walkin Doro autoclicker
    {
        id: 4, 
        name: "Walkin Doro",
        type: 'autoclicker',
        baseCost: 120, 
        baseDPS: 15, 
        value: 15, 
        purchased: 0,
        icon: './src/assets/dorowalk.webp', 
        description: 'A strollin Doro helping collect additional doros.', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            // AC4: Slightly higher scaling than Lurking Doro
            const baseGrowth = 1.15; // Higher than Lurking's 1.1
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.8; // Slightly higher than Lurking's 1.7
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 12; // Higher than Lurking's 10
            else if (purchased >= 500) cost *= 6; // Higher than Lurking's 5
            else if (purchased >= 200) cost *= 6; // Higher than Lurking's 5
            else if (purchased >= 100) cost *= 6; // Higher than Lurking's 5

            // Ensure cost always increases by at least 1
            if (purchased > 0) {
                let prevCost = this.baseCost;
                prevCost *= Math.pow(baseGrowth, purchased - 1);
                const prevDecades = Math.floor((purchased - 1) / 10);
                prevCost *= Math.pow(decadeFactor, prevDecades);
                
                if (purchased - 1 >= 1000) prevCost *= 12;
                else if (purchased - 1 >= 500) prevCost *= 6;
                else if (purchased - 1 >= 200) prevCost *= 6;
                else if (purchased - 1 >= 100) prevCost *= 6;
                
                cost = Math.max(cost, prevCost + 1);
            }

            return Math.round(cost);
        }
    },
    {
        id: 5,
        name: 'Napping Siren Doro',
        type: 'autoclicker',
        baseCost: 1500, 
        baseDPS: 69, 
        value: 69, 
        purchased: 0,
        icon: './src/assets/SirenDoroSleep.webp', 
        description: 'Bubble working hard to give Siren a break.', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            // AC4: Slightly higher scaling than Lurking Doro
            const baseGrowth = 1.13; // Higher than Lurking's 1.1
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; // Slightly higher than Lurking's 1.7
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; // Higher than Lurking's 10
            else if (purchased >= 500) cost *= 5; // Higher than Lurking's 5
            else if (purchased >= 200) cost *= 3; // Higher than Lurking's 5
            else if (purchased >= 100) cost *= 2; // Higher than Lurking's 5

            // Ensure cost always increases by at least 1
            if (purchased > 0) {
                let prevCost = this.baseCost;
                prevCost *= Math.pow(baseGrowth, purchased - 1);
                const prevDecades = Math.floor((purchased - 1) / 10);
                prevCost *= Math.pow(decadeFactor, prevDecades);
                
                if (purchased - 1 >= 1000) prevCost *= 9;
                else if (purchased - 1 >= 500) prevCost *= 5;
                else if (purchased - 1 >= 200) prevCost *= 3;
                else if (purchased - 1 >= 100) prevCost *= 2;
                
                cost = Math.max(cost, prevCost + 1);
            }

            return Math.round(cost);
        }
    }
];