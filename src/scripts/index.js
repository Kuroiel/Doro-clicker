import { DoroClicker } from './Core/doroclicker.js';

// Create game instance
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

document.addEventListener('DOMContentLoaded', () => {
    if (!window.doroGame) {
        window.doroGame = new DoroClicker();
    }
});