// index.js - Final Corrected Version
import { DoroClicker } from "./Core/doroclicker.js";

// This listener ensures that the HTML document is fully loaded and parsed
// before we try to initialize the game or interact with any of its elements.
document.addEventListener("DOMContentLoaded", function initializeGame() {
  // Only initialize the game if an instance does not already exist.
  // This prevents re-initialization in some hot-reloading environments.
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

  // The event listener has done its job and can be removed to prevent memory leaks.
  document.removeEventListener("DOMContentLoaded", initializeGame);
});
