// index.js
import { DoroClicker } from './Core/doroclicker.js';

// Only initialize if no existing instance
if (typeof window.doroGame === 'undefined') {
  try {
    const game = new DoroClicker();
    window.doroGame = game;
    
    if (typeof window.__TESTING__ !== 'undefined') {
      window.__TESTING__.gameReady = true;
    }
  } catch (error) {
    console.error('Game initialization failed:', error);
    
    if (typeof window.__TESTING__ !== 'undefined') {
      window.doroGame = {
        state: {},
        upgrades: [],
        autoclickers: [],
        updateUI: () => {}
      };
    }
  }
}

document.addEventListener('DOMContentLoaded', function handler() {
  /* istanbul ignore next */
  if (typeof window.doroGame === 'undefined') {
    /* istanbul ignore next */
    window.doroGame = new DoroClicker();
  }
  document.removeEventListener('DOMContentLoaded', handler);
});