import { DOMHelper } from 'scripts/dom.js';

describe('DOMHelper', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="score-display"></div>
      <div id="stats-overlay"></div>
    `;
  });

  test('setText() should update element content', () => {
    const element = document.createElement('div');
    DOMHelper.setText(element, 'Test Content');
    expect(element.textContent).toBe('Test Content');
  });

  test('toggleVisibility() should handle missing elements', () => {
    const invalidElement = null;
    DOMHelper.toggleVisibility(invalidElement, true);
    // No error should occur
  });
});