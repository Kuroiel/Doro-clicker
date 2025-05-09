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

// dom.test.js - Add these new tests at the bottom of the file

describe('DOMHelper Additional Methods', () => {
  let testElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement);
  });

  test('disableElement() should disable an element', () => {
    testElement.disabled = false;
    DOMHelper.disableElement(testElement);
    expect(testElement.disabled).toBe(true);
  });

  test('enableElement() should enable an element', () => {
    testElement.disabled = true;
    DOMHelper.enableElement(testElement);
    expect(testElement.disabled).toBe(false);
  });

  test('addClass() should add class to element', () => {
    DOMHelper.addClass(testElement, 'test-class');
    expect(testElement.classList.contains('test-class')).toBe(true);
  });

  test('removeClass() should remove class from element', () => {
    testElement.classList.add('test-class');
    DOMHelper.removeClass(testElement, 'test-class');
    expect(testElement.classList.contains('test-class')).toBe(false);
  });

  test('getUpgradeButton() should return correct element', () => {
    const button = document.createElement('button');
    button.className = 'upgrade-button';
    button.dataset.id = '123';
    document.body.appendChild(button);
    
    const foundButton = DOMHelper.getUpgradeButton('123');
    expect(foundButton).toBe(button);
    
    document.body.removeChild(button);
  });
});

// Add these new tests at the bottom of the file

describe('DOMHelper Additional Methods', () => {


  test('getDorosCount() should parse score correctly', () => {
      // Setup test DOM
      document.body.innerHTML = `
          <div id="score-display">Doros: 42</div>
      `;
      
      expect(DOMHelper.getDorosCount()).toBe(42);
  });

  test('getDorosCount() should handle missing element', () => {
      document.body.innerHTML = '';
      expect(DOMHelper.getDorosCount()).toBe(0);
  });

  test('getDorosCount() should handle malformed text', () => {
      document.body.innerHTML = `
          <div id="score-display">Invalid text</div>
      `;
      expect(DOMHelper.getDorosCount()).toBe(0);
  });

  test('getUpgradeButton() should return correct element', () => {
      document.body.innerHTML = `
          <button class="upgrade-button" data-id="1"></button>
      `;
      const button = DOMHelper.getUpgradeButton(1);
      expect(button).toBeInstanceOf(HTMLElement);
      expect(button.dataset.id).toBe('1');
  });

  test('getUpgradeButton() should handle invalid ID', () => {
      const button = DOMHelper.getUpgradeButton('invalid');
      expect(button).toBeNull();
  });


});