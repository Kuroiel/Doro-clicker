import { DoroClicker } from "./Core/doroclicker.js";

function initializeGame() {
  if (!window.doroGame) {
    try {
      // Create and assign the game instance to the window for global access/debugging.
      window.doroGame = new DoroClicker();

      // Signal for testing environments that the game is ready.
      if (typeof window.__TESTING__ !== "undefined") {
        window.__TESTING__.gameReady = true;
      }
    } catch (error) {
      console.error("Game initialization failed:", error);
      // Provide a dummy object if initialization fails in a test environment
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
