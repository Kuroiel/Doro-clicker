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
        description: 'Cause Ima creep Ima Doro.',
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
        description: 'Nice day out huh?', 
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
        id: 6,
        name: 'Napping Siren Doro',
        type: 'autoclicker',
        baseCost: 1500, 
        baseDPS: 69, 
        value: 69, 
        purchased: 0,
        icon: './src/assets/SirenDoroSleep.webp', 
        description: 'Bubble is working hard to give Siren a break.', 
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
    },
    {
        id: 7,
        name: 'Comfy Doro',
        type: 'autoclicker',
        baseCost: 6900, 
        baseDPS: 120, 
        value: 120, 
        purchased: 0,
        icon: './src/assets/dorocomfy.webp', 
        description: 'A very comfy Doro.', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
        {
        id: 8,
        name: 'Doro Dent',
        type: 'autoclicker',
        baseCost: 15000, 
        baseDPS: 500, 
        value: 500, 
        purchased: 0,
        icon: './src/assets/dorodent.webp', 
        description: '1+1 = 11', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
    {
        id: 9,
        name: 'McFraud',
        type: 'autoclicker',
        baseCost: 50000, 
        baseDPS: 1200, 
        value: 1200, 
        purchased: 0,
        icon: './src/assets/mcfraud.webp', 
        description: 'WHO LET THIS FRAUD IN!?', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
        {
        id: 10,
        name: 'Flying Doro',
        type: 'autoclicker',
        baseCost: 99999, 
        baseDPS: 2345, 
        value: 2345, 
        purchased: 0,
        icon: './src/assets/dorofly.webp', 
        description: 'Doros can fly!?', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
            {
        id: 11,
        name: 'CinDoro',
        type: 'autoclicker',
        baseCost: 169696, 
        baseDPS: 6969, 
        value: 6969, 
        purchased: 0,
        icon: './src/assets/cindoro.webp', 
        description: 'CinDoro looking quite beautiful today', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
                {
        id: 12,
        name: 'Doro Fish',
        type: 'autoclicker',
        baseCost: 400000, 
        baseDPS: 11250, 
        value: 11250, 
        purchased: 0,
        icon: './src/assets/dorofish.webp', 
        description: 'Give a Doro a fish...Teach a Doro to fish...', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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
    },
                    {
        id: 13,
        name: 'Doro Dash',
        type: 'autoclicker',
        baseCost: 999999, 
        baseDPS: 49999, 
        value: 49999, 
        purchased: 0,
        icon: './src/assets/dorodash.webp', 
        description: 'Dinners here, comes with a free Retry on a UR hit.', 
        effectDescription: (value, purchased) => 
            `Provides ${value} Doros per second.\nCurrently providing: ${value * purchased} Doros per second.`, 
        cost: function() { 
            const purchased = this.purchased;
            let cost = this.baseCost;

            const baseGrowth = 1.13; 
            cost *= Math.pow(baseGrowth, purchased);

            const decades = Math.floor(purchased / 10);
            const decadeFactor = 1.4; 
            cost *= Math.pow(decadeFactor, decades);

            // Additional cost jumps at milestones
            if (purchased >= 1000) cost *= 9; 
            else if (purchased >= 500) cost *= 5; 
            else if (purchased >= 200) cost *= 3; 
            else if (purchased >= 100) cost *= 2; 

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