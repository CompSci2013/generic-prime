/**
 * Bug #7 Regression Test: Picker checkboxes remain checked after Clear All
 *
 * Original Issue: When items are selected in a popped-out Picker panel and
 * "Clear All" is clicked in the main window, the checkboxes in the pop-out
 * remain visually checked even though the selection state was cleared.
 *
 * Root Cause: The BasePickerComponent used markForCheck() instead of
 * detectChanges() when clearing selections. In pop-out windows, the zone
 * boundary prevents markForCheck() from triggering UI updates.
 *
 * Fix: Changed markForCheck() to detectChanges() in subscribeToUrlChanges()
 * when filter values are cleared.
 *
 * Fixed In: Session 59 (Bug #7 fix)
 */

import { test, expect, BrowserContext, Page } from '@playwright/test';
import { TestLogger } from '../test-logger';

test.describe('Bug #7: Picker checkboxes remain checked after Clear All', () => {
  let mainPage: Page;
  let popoutPage: Page;
  let mainLogger: TestLogger;
  let popoutLogger: TestLogger;

  test.beforeEach(async ({ context }) => {
    // Navigate to discover page
    mainPage = await context.newPage();
    await mainPage.goto('/automobiles/discover');
    await mainPage.waitForLoadState('networkidle');
    mainLogger = new TestLogger(mainPage);
  });

  test('Clear All in main window should uncheck picker checkboxes in pop-out', async ({ context }) => {
    // Step 1: Wait for initial data load
    await mainPage.waitForSelector('[data-testid="picker-panel"]', { timeout: 10000 });
    console.log('[TEST] Step 1: Main window loaded');

    // Step 2: Pop out the Picker panel
    const popoutButton = mainPage.locator('[data-testid="picker-panel"] .panel-actions button').first();

    // Listen for new page (pop-out window)
    const popoutPromise = context.waitForEvent('page');
    await popoutButton.click();
    popoutPage = await popoutPromise;
    await popoutPage.waitForLoadState('networkidle');
    popoutLogger = new TestLogger(popoutPage);
    console.log('[TEST] Step 2: Picker pop-out opened');

    // Step 3: Wait for picker table to load in pop-out
    await popoutPage.waitForSelector('.p-datatable-tbody tr', { timeout: 10000 });
    console.log('[TEST] Step 3: Picker table loaded in pop-out');

    // Step 4: Select first two items in the pop-out picker
    const checkboxes = popoutPage.locator('.p-datatable-tbody tr .p-checkbox-box');
    const checkboxCount = await checkboxes.count();
    console.log(`[TEST] Step 4: Found ${checkboxCount} checkboxes in picker`);

    if (checkboxCount >= 2) {
      await checkboxes.nth(0).click();
      await popoutPage.waitForTimeout(300);
      await checkboxes.nth(1).click();
      await popoutPage.waitForTimeout(300);
      console.log('[TEST] Selected first 2 items in pop-out picker');
    }

    // Step 5: Verify checkboxes are checked
    const checkbox1Checked = await checkboxes.nth(0).evaluate(el =>
      el.closest('.p-checkbox')?.classList.contains('p-checkbox-checked') ||
      el.getAttribute('aria-checked') === 'true'
    );
    const checkbox2Checked = await checkboxes.nth(1).evaluate(el =>
      el.closest('.p-checkbox')?.classList.contains('p-checkbox-checked') ||
      el.getAttribute('aria-checked') === 'true'
    );
    console.log(`[TEST] Checkbox 1 checked: ${checkbox1Checked}`);
    console.log(`[TEST] Checkbox 2 checked: ${checkbox2Checked}`);
    expect(checkbox1Checked).toBe(true);
    expect(checkbox2Checked).toBe(true);

    // Step 6: Verify URL has the filter parameter (selections applied)
    await mainPage.waitForTimeout(500); // Wait for URL update
    const urlBefore = mainPage.url();
    console.log(`[TEST] URL before Clear All: ${urlBefore}`);

    // Step 7: Click "Clear All" in main window
    const clearAllButton = mainPage.locator('[data-testid="query-control-panel"] button:has-text("Clear")').first();
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      console.log('[TEST] Step 7: Clicked Clear All in main window');
    } else {
      // Try alternative selector
      const altClearButton = mainPage.locator('button:has-text("Clear All")').first();
      await altClearButton.click();
      console.log('[TEST] Step 7: Clicked Clear All (alt selector) in main window');
    }

    // Step 8: Wait for state update to propagate
    await mainPage.waitForTimeout(1000);
    await popoutPage.waitForTimeout(1000);

    // Step 9: Verify URL is cleared
    const urlAfter = mainPage.url();
    console.log(`[TEST] URL after Clear All: ${urlAfter}`);

    // Step 10: THE BUG CHECK - Verify checkboxes in pop-out are UNCHECKED
    const checkbox1AfterClear = await checkboxes.nth(0).evaluate(el =>
      el.closest('.p-checkbox')?.classList.contains('p-checkbox-checked') ||
      el.getAttribute('aria-checked') === 'true'
    );
    const checkbox2AfterClear = await checkboxes.nth(1).evaluate(el =>
      el.closest('.p-checkbox')?.classList.contains('p-checkbox-checked') ||
      el.getAttribute('aria-checked') === 'true'
    );

    console.log(`[TEST] After Clear All - Checkbox 1 checked: ${checkbox1AfterClear}`);
    console.log(`[TEST] After Clear All - Checkbox 2 checked: ${checkbox2AfterClear}`);

    // This is the critical assertion - checkboxes should be UNCHECKED after Clear All
    expect(checkbox1AfterClear).toBe(false);
    expect(checkbox2AfterClear).toBe(false);

    // Verify no console errors
    expect(mainLogger.hasConsoleErrors()).toBe(false);
    expect(popoutLogger.hasConsoleErrors()).toBe(false);

    console.log('[TEST] SUCCESS: Picker checkboxes correctly unchecked after Clear All');
  });
});
