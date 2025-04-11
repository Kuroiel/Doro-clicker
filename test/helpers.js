export const TestHelpers = {
    getDorosCount: async (page) => {
      return page.evaluate(() => {
        const text = document.getElementById('score-display').textContent;
        return parseInt(text.split(' ')[1]) || 0;
      });
    },
  
    getUpgradeState: async (page, upgradeId) => {
      return page.evaluate((id) => {
        const button = document.querySelector(`[data-id="${id}"]`);
        return {
          disabled: button.disabled,
          purchased: button.textContent.includes('(Purchased)'),
          affordable: button.classList.contains('affordable')
        };
      }, upgradeId);
    }
  };