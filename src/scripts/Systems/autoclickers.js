import { CostCalculations } from "./utils.js";

const AUTOCLICKER_TEMPLATES = {
  BASIC: {
    baseGrowth: 1.08,
    rampUpThreshold: 50,
    rampUpGrowth: 1.15,
    dpsMilestoneMultiplier: 1.25,
    milestones: [
      [10, 1.4],
      [25, 1.6],
      [50, 1.8],
      [100, 2.2],
      [200, 2.8],
      [500, 3.5],
      [1000, 5.0],
    ],
  },
  MID_TIER: {
    baseGrowth: 1.1,
    rampUpThreshold: 50,
    rampUpGrowth: 1.18,
    dpsMilestoneMultiplier: 1.25,
    milestones: [
      [10, 1.5],
      [25, 1.8],
      [50, 2.0],
      [100, 2.5],
      [200, 3.2],
      [500, 4.0],
      [1000, 6.0],
    ],
  },
  HIGH_TIER: {
    baseGrowth: 1.12,
    rampUpThreshold: 50,
    rampUpGrowth: 1.2,
    dpsMilestoneMultiplier: 1.25,
    milestones: [
      [10, 1.6],
      [25, 2.0],
      [50, 2.5],
      [100, 3.0],
      [200, 4.0],
      [500, 5.0],
      [1000, 8.0],
    ],
  },
  SIREN: {
    baseGrowth: 1.04, // Weakest scaling
    rampUpThreshold: 50,
    rampUpGrowth: 1.08, // Weakest ramp up
    dpsMilestoneMultiplier: 1.5, // Strongest reward
    milestones: [
      [10, 1.2],
      [25, 1.3],
      [50, 1.4],
      [100, 1.6],
      [200, 1.8],
      [500, 2.0],
      [1000, 3.0],
    ],
  },
};

class Autoclicker {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = "autoclicker";
    this.baseCost = config.baseCost;
    this.baseDPS = config.baseDPS;
    this.purchased = 0;
    this.icon = config.icon;
    this.description = config.description;
    this.template =
      AUTOCLICKER_TEMPLATES[config.template] || AUTOCLICKER_TEMPLATES.BASIC;
    this.modifiers = config.modifiers || [];
  }

  // figure out dps based on stuff bought
  get value() {
    let currentBase = this.baseDPS;

    // check milestones
    const milestonesReached = this.template.milestones.filter(
      ([threshold]) => this.purchased >= threshold
    ).length;

    if (milestonesReached > 0) {
      currentBase *= Math.pow(
        this.template.dpsMilestoneMultiplier,
        milestonesReached
      );
    }

    if (!window.doroGame || !window.doroGame.modifierSystem) return currentBase;
    return window.doroGame.modifierSystem.apply(currentBase, this.id, "dps");
  }

  get effectDescription() {
    const currentValue = this.value;
    const baseWithMilestones = this.baseDPS * Math.pow(
      this.template.dpsMilestoneMultiplier,
      this.template.milestones.filter(([t]) => this.purchased >= t).length
    );
    const multiplier = currentValue / baseWithMilestones;

    return `Base DPS: ${baseWithMilestones.toFixed(2)} (x${multiplier.toFixed(2)} multi)\n` +
           `Final Value: ${currentValue.toFixed(2)} Doro/s\n` +
           `Total Production: ${(currentValue * this.purchased).toFixed(2)} Doro/s`;
  }

  get cost() {
    return CostCalculations.standardCost(
      this.baseCost,
      this.purchased,
      this.template.baseGrowth,
      this.template.milestones,
      this.template.rampUpThreshold,
      this.template.rampUpGrowth
    );
  }
}
// actual clickers
export const autoclickers = [
  new Autoclicker({
    id: "ac_lurking_doro",
    name: "Lurking Doro",
    baseCost: 5, // cheap
    baseDPS: 0.1, // weak
    icon: "./src/assets/dorocreep.webp",
    description: "Cause Ima creep Ima Doro.",
    template: "BASIC",
  }),
  new Autoclicker({
    id: "ac_walkin_doro",
    name: "Walkin Doro",
    baseCost: 120,
    baseDPS: 15,
    icon: "./src/assets/dorowalk.webp",
    description: "Nice day out huh?",
    template: "MID_TIER",
  }),
  new Autoclicker({
    id: "ac_napping_siren_doro",
    name: "Napping Siren Doro",
    baseCost: 1500,
    baseDPS: 69,
    icon: "./src/assets/SirenDoroSleep.webp",
    description: "Bubble is working hard to give Siren a break.",
    template: "SIREN", // scales weirdly
  }),
  new Autoclicker({
    id: "ac_comfy_doro",
    name: "Comfy Doro",
    baseCost: 6900,
    baseDPS: 120,
    icon: "./src/assets/dorocomfy.webp",
    description: "A very comfy Doro.",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_doro_dent",
    name: "Doro Dent",
    baseCost: 15000,
    baseDPS: 500,
    icon: "./src/assets/dorodent.webp",
    description: "1+1 = 11",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_mcfraud",
    name: "McFraud",
    baseCost: 50000,
    baseDPS: 1200,
    icon: "./src/assets/mcfraud.webp",
    description: "WHO LET THIS FRAUD IN!?",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_mambodoro",
    name: "MatikanetannhauserDoro",
    baseCost: 99998,
    baseDPS: 2345,
    icon: "./src/assets/mambodoro.png",
    description: "Mambo mambo, omatsuri mambo!",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_cindoro",
    name: "CinDoro",
    baseCost: 169696,
    baseDPS: 6969,
    icon: "./src/assets/cindoro.webp",
    description: "CinDoro looking quite beautiful today",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_doro_fish",
    name: "Doro Fish",
    baseCost: 400000,
    baseDPS: 11250,
    icon: "./src/assets/dorofish.webp",
    description: "Give a Doro a fish...Teach a Doro to fish...",
    template: "HIGH_TIER",
  }),
  new Autoclicker({
    id: "ac_doro_dash",
    name: "Doro Dash",
    baseCost: 999999,
    baseDPS: 49999,
    icon: "./src/assets/dorodash.webp",
    description: "Dinners here, comes with a free Retry on a UR hit.",
    template: "HIGH_TIER",
  }),
];
