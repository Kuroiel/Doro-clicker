// Replace the test file with this version:
import { test, expect } from '@playwright/test';
import { waitForGameInitialization, resetGameState } from './test-utils';

test.describe('Upgrade System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        await waitForGameInitialization(page);
  
        // Reset to default test state (1000 doros)
        await resetGameState(page);
      
        // Handle view switching if needed
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