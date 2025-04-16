export const upgrades = [
    {
        id: 1,
        name: "Click Power",
        type: 'multiplier',
        baseCost: 10,
        multiplier: 2, // Add this property
        purchased: 0,
        cost: function() { return this.baseCost * Math.pow(10, this.purchased) }
      },
    {
        id: 3,
        name: "Auto Clicker",
        cost: 100,
        type: 'autoclicker',
        value: 1,
        purchased: false
    }
];