// Replace the test file with this version:
import { test, expect } from '@playwright/test';

test.describe('Upgrade System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        await expect.poll(async () => {
            return await page.evaluate(() => {
              try {
                const game = window.doroGame;
                return game && game.state && game.upgrades;
              } catch (e) {
                return false;
              }
            });
          }, { 
            timeout: 10000,
            message: 'Game failed to initialize within 10 seconds'
          }).toBeTruthy();
        
        // Reset game state
        await page.evaluate(() => {
            const game = window.doroGame;
            game.state.doros = 1000;
            game.clickMultiplier = 1;
            game.state.autoclickers = 0;
            
            game.upgrades.forEach(u => u.purchased = 0);
            game.autoclickers.forEach(a => {
                a.purchased = 0;
                a.value = a.baseDPS;
            });
        });

        // Explicitly click the upgrades view button and wait for view to be active
        const upgradesButton = page.locator('[data-view="upgrades"]');
        await upgradesButton.click();
        await expect(page.locator('#upgrades-container.active-view')).toBeVisible();
    });

    test('should purchase click multiplier upgrade', async ({ page }) => {
        const upgradeButton = page.locator('[data-id="1"]');
        
        // Wait for button to be visible and in correct state
        await expect(upgradeButton).toBeVisible();
        await expect(upgradeButton).toContainText('Cost: 10 Doros');
        
        await upgradeButton.click();
        
        // Verify state changes
        const clickMultiplier = await page.evaluate(() => window.doroGame.clickMultiplier);
        expect(clickMultiplier).toBe(1);
        
        await expect(upgradeButton).toContainText('Cost: 100 Doros');
    });

    test('should handle upgrade visibility conditions', async ({ page }) => {
        const motivatingDoro = page.locator('[data-id="5"]');
        await expect(motivatingDoro).toBeHidden();
        
        // Set up valid DPS state
        await page.evaluate(() => {
            const game = window.doroGame;
            const walkin = game.autoclickers.find(a => a.id === 4);
            walkin.purchased = 34;
            game.switchView('upgrades'); // Force UI refresh
        });

        await expect(motivatingDoro).toBeVisible({ timeout: 15000 });
    });

    test('should prevent unaffordable purchases', async ({ page }) => {
        // Set low doros amount and wait for UI to update
        await page.evaluate(() => {
            window.doroGame.state.doros = 5;
            window.doroGame.updateUI(); // Force UI refresh
        });

        // Wait for UI to reflect the state change
        await expect(page.getByText('Doros: 5')).toBeVisible();
        
        const upgradeButton = page.locator('[data-id="1"]');
        await expect(upgradeButton).toBeVisible();
        await expect(upgradeButton).toBeDisabled();
        await expect(upgradeButton).not.toHaveClass(/affordable/);
    });
});