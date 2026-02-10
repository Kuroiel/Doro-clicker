import { DoroClicker } from "./Core/doroclicker.js";

function initializeGame() {
  if (!window.doroGame) {
    try {
      // game starts here i guess
      window.doroGame = new DoroClicker();

      // for testing stuff
      if (typeof window.__TESTING__ !== "undefined") {
        window.__TESTING__.gameReady = true;
      }
    } catch (error) {
      console.error("Game initialization failed:", error);
      // backup plan for tests
      if (typeof window.__TESTING__ !== "undefined") {
        window.doroGame = { error: true };
      }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}
