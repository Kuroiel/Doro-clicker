import { DoroClicker } from "./Core/doroclicker.js";

function initializeGame() {
  // Only initialize the game if an instance does not already exist.
  // This prevents re-initialization in some hot-reloading environments.
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

// This is the standard, robust way to handle DOM readiness.
if (document.readyState === "loading") {
  // We are still loading, so wait for the event.
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  // The DOM is already ready, so we can initialize immediately.
  // This handles cases where the script is loaded with 'defer' or 'async'.
  initializeGame();
}
