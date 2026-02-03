import { GameState } from "./gameState.js";
import { autoclickers } from "../Systems/autoclickers.js";
import { upgrades } from "../Systems/upgrades.js";
import { GameMechanics } from "./gamemechanics.js";
import { UIManager } from "../UI/uimanager.js";
import { EventHandlers } from "../Events/eventhandlers.js";
import { SaveSystem } from "../Systems/savesystem.js";
import { AutoclickerSystem } from "../Systems/autoclickersystem.js";
import { ViewManager } from "../Events/viewmanager.js";
import { ModifierSystem } from "../Systems/modifiers.js";

class DoroClicker {
  constructor() {
    // Initialize core systems
    this.state = new GameState();
    this.modifierSystem = new ModifierSystem(this);
    this.viewManager = new ViewManager(this);
    this.mechanics = new GameMechanics(this);
    this.autoclickerSystem = new AutoclickerSystem(this);
    this.ui = new UIManager(this);
    this.events = new EventHandlers(this);
    this.saveSystem = new SaveSystem(this);

    // Initialize game data
    this.autoclickers = autoclickers;
    this.upgrades = upgrades;
    this.state.setAutoclickers(this.autoclickers);

    // Initialize game
    this.init();
  }

  init() {
    this.autoclickerSystem.setup();
    this.events.setupAllEventListeners();
    this.saveSystem.init();
    this.viewManager.switchView("autoclickers");
  }

  destroy() {
    try {
      this.autoclickerSystem?.cleanup();
    } catch (error) {
      console.error("Error during autoclicker system cleanup:", error);
    }

    try {
      this.mechanics?.cleanup();
    } catch (error) {
      console.error("Error during game mechanics cleanup:", error);
    }

    try {
      this.events?.removeAllEventListeners();
    } catch (error) {
      console.error("Error during event listeners removal:", error);
    }

    try {
      this.saveSystem?.cleanup();
    } catch (error) {
      console.error("Error during save system cleanup:", error);
    }
  }
}

export { DoroClicker };
