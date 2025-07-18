// index.js
import { DoroClicker } from "./Core/doroclicker.js";

// Only initialize if no existing instance

document.addEventListener("DOMContentLoaded", function initializeGame() {
  // Only initialize the game if an instance does not already exist.
  if (typeof window.doroGame === "undefined") {
    try {
      // Create and assign the game instance to the window for global access/debugging.
      window.doroGame = new DoroClicker();

      // Signal for testing environments that the game is ready.
      if (typeof window.__TESTING__ !== "undefined") {
        window.__TESTING__.gameReady = true;
      }
    } catch (error) {
      console.error("Game initialization failed:", error);
      // Provide a dummy object if initialization fails in a test environment.
      if (typeof window.__TESTING__ !== "undefined") {
        window.doroGame = { error: true };
      }
    }
  }
  // The event listener has done its job and can be removed.
  document.removeEventListener("DOMContentLoaded", initializeGame);
});
