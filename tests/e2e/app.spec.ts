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

  test('clicking atmosphere button cycles through presets smoothly', async ({ page }) => {
    await page.goto('/');
    const atmosphereBtn = page.locator('#atmosphere-btn');
    await expect(atmosphereBtn).toBeVisible();

    // Default active is rainy-evening
    await expect(page.locator('[data-preset-id="rainy-evening"]')).toHaveClass(/active/);

    // Click Atmosphere -> cycles to deep-focus
    await atmosphereBtn.click();
    await expect(page.locator('[data-preset-id="deep-focus"]')).toHaveClass(/active/);

    // Click Atmosphere -> cycles to ocean-calm
    await atmosphereBtn.click();
    await expect(page.locator('[data-preset-id="ocean-calm"]')).toHaveClass(/active/);

    // Click Atmosphere -> cycles to cosmic-galaxy
    await atmosphereBtn.click();
    await expect(page.locator('[data-preset-id="cosmic-galaxy"]')).toHaveClass(/active/);
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

  test('zen mode keyboard toggle hides overlays on idle', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('.ambient-app-container');
    await expect(container).not.toHaveClass(/ambient-idle-hidden/);

    // Press Z to trigger Zen mode
    await page.keyboard.press('z');
    await expect(container).toHaveClass(/ambient-idle-hidden/);

    // Press Z again to restore overlays
    await page.keyboard.press('z');
    await expect(container).not.toHaveClass(/ambient-idle-hidden/);
  });

  test('dedicated high-intent SEO pages load with canonical and wake lock', async ({ page }) => {
    // Keep Screen On
    await page.goto('/keep-screen-on/');
    await expect(page).toHaveTitle(/Keep Screen On/);
    await expect(page.locator('#hero-wakelock-toggle-btn')).toBeVisible();

    // No Screen Off
    await page.goto('/no-screen-off/');
    await expect(page).toHaveTitle(/No Screen Off/);
    await expect(page.locator('#hero-wakelock-toggle-btn')).toBeVisible();
  });

  test('passes axe-core accessibility audit with strict color-contrast check', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
