import { CostCalculations } from "./utils.js";

const AUTOCLICKER_TEMPLATES = {
  BASIC: {
    baseGrowth: 1.1,
    decadeFactor: 1.7,
    milestones: [
      [100, 5],
      [200, 5],
      [500, 5],
      [1000, 10],
    ],
  },
  MID_TIER: {
    baseGrowth: 1.15,
    decadeFactor: 1.8,
    milestones: [
      [100, 6],
      [200, 6],
      [500, 6],
      [1000, 12],
    ],
  },
  HIGH_TIER: {
    baseGrowth: 1.13,
    decadeFactor: 1.4,
    milestones: [
      [100, 2],
      [200, 3],
      [500, 5],
      [1000, 9],
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

  // Value is now dynamic based on modifiers
  get value() {
    if (!window.doroGame || !window.doroGame.modifierSystem) return this.baseDPS;
    return window.doroGame.modifierSystem.apply(this.baseDPS, this.id, "dps");
  }

  get effectDescription() {
    const currentValue = this.value;
    return `Provides ${currentValue.toFixed(1)} Doros per second.\nCurrently providing: ${(
      currentValue * this.purchased
    ).toFixed(1)} Doros per second.`;
  }

  get cost() {
    return CostCalculations.standardCost(
      this.baseCost,
      this.purchased,
      this.template.baseGrowth,
      this.template.decadeFactor,
      this.template.milestones
    );
  }
}
// Instantiate and export autoclickers directly
export const autoclickers = [
  new Autoclicker({
    id: "ac_lurking_doro",
    name: "Lurking Doro",
    baseCost: 10,
    baseDPS: 1,
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
    template: "HIGH_TIER",
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
