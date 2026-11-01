import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('NoSleep Core Application', () => {
  test('loads home page with canvas and controls', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NoSleep/);

    const canvas = page.locator('#ambient-canvas');
    await expect(canvas).toBeVisible();

    const wakeLockBtn = page.locator('#wakelock-toggle-btn');
    await expect(wakeLockBtn).toBeVisible();

    const timerDisplay = page.locator('#timer-display');
    await expect(timerDisplay).toHaveText('25:00');
  });

  test('preset pills can be selected', async ({ page }) => {
    await page.goto('/');
    const deepFocusPill = page.locator('[data-preset-id="deep-focus"]');
    await deepFocusPill.click();
    await expect(deepFocusPill).toHaveClass(/active/);
  });

  test('sound mixer modal opens and closes', async ({ page }) => {
    await page.goto('/');
    const openBtn = page.locator('#open-mixer-btn');
    await openBtn.click();

    const modal = page.locator('#sound-mixer-modal');
    await expect(modal).toHaveClass(/open/);

    const closeBtn = page.locator('#close-mixer-btn');
    await closeBtn.click();
    await expect(modal).not.toHaveClass(/open/);
  });

  test('hero wake lock button and timer options modal work seamlessly', async ({ page }) => {
    await page.goto('/');
    const heroBtn = page.locator('#hero-wakelock-toggle-btn');
    await expect(heroBtn).toBeVisible();

    // Timer modal open/close
    const openTimerBtn = page.locator('#open-timer-modal-btn');
    await openTimerBtn.click();
    const timerModal = page.locator('#timer-modal');
    await expect(timerModal).toHaveClass(/open/);

    const closeTimerBtn = page.locator('#close-timer-modal-btn');
    await closeTimerBtn.click();
    await expect(timerModal).not.toHaveClass(/open/);
  });

  test('passes axe-core accessibility audit', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Dynamic canvas background
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
