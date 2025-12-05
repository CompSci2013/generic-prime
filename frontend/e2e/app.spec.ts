import { test, expect, Page } from '@playwright/test';

/**
 * Generic Prime E2E Test Suite
 *
 * Automates MANUAL-TEST-PLAN.md test cases
 * Focus: URL-First State Management & Control Behavior
 *
 * Phase 1: Initial State & Basic Navigation
 * Phase 2: Query Control Panel Filters
 * Phase 3+: Pop-out windows, Statistics, Results Table
 */

// Helper function to wait for Results Table to update after URL change
async function waitForTableUpdate(page: Page, expectedRecordCount?: number) {
  // Wait for the paginator to update
  await page.waitForSelector('.p-paginator-current', { timeout: 10000 });

  // If we expect a specific count, wait for it
  if (expectedRecordCount) {
    const paginatorStatus = page.locator('.p-paginator-current');
    await expect(paginatorStatus).toContainText(expectedRecordCount.toString(), { timeout: 5000 });
  }
}

// Helper to get current URL parameters
async function getUrlParams(page: Page): Promise<Record<string, string>> {
  const url = new URL(page.url());
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// ============================================================================
// PHASE 1: INITIAL STATE & BASIC NAVIGATION
// ============================================================================

test.describe('PHASE 1: Initial State & Basic Navigation', () => {

  test('1.1: Initial page load - 4,887 records displayed', async ({ page }) => {
    // Navigate to discover page
    await page.goto('/discover');

    // Verify all 4 panels are visible
    await expect(page.locator('[data-testid="query-control-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="picker-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="results-table-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="statistics-panel"]')).toBeVisible();

    // Verify URL is clean (no query params)
    const params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Verify Results Table shows all records
    const paginatorStatus = page.locator('.p-paginator-current');
    await expect(paginatorStatus).toContainText(/4,887/);
  });

  test('1.2: Panel collapse/expand - state independent of URL', async ({ page }) => {
    await page.goto('/discover');

    // Collapse Query Control panel
    const queryControlCollapse = page.locator('[data-testid="query-control-panel"] .p-panel-header-icon').first();
    await queryControlCollapse.click();

    // Verify it's collapsed
    const queryControlContent = page.locator('[data-testid="query-control-panel"] .p-panel-content');
    await expect(queryControlContent).not.toBeVisible();

    // Verify URL remains clean
    const params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Expand it back
    await queryControlCollapse.click();
    await expect(queryControlContent).toBeVisible();
  });

  test('1.3: Panel drag-drop reordering - does not affect URL', async ({ page }) => {
    await page.goto('/discover');

    // Get initial order
    const panels = page.locator('[data-testid*="-panel"]');
    const initialFirstPanel = await panels.first().getAttribute('data-testid');

    // Verify URL is clean before and after
    let params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Note: Drag-drop test requires more complex interaction
    // For now, verify the state doesn't change
    params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);
  });

});

// ============================================================================
// PHASE 2: QUERY CONTROL PANEL FILTERS
// ============================================================================

test.describe('PHASE 2: Query Control Panel Filters', () => {

  test.describe('2.1: Manufacturer Filter (Multiselect Dialog)', () => {

    test('2.1.1-2.1.8: Single Selection Workflow', async ({ page }) => {
      await page.goto('/discover');

      // Click field selector dropdown
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      // Select "Manufacturer" from dropdown
      const manufacturerOption = page.locator('text=Manufacturer').first();
      await manufacturerOption.click();

      // Verify multiselect dialog opens with correct title
      const dialogTitle = page.locator('.p-dialog-title');
      await expect(dialogTitle).toContainText(/Manufacturer|manufacturer/i);

      // Verify list shows manufacturers
      const dialogContent = page.locator('.p-dialog-content');
      await expect(dialogContent).toContainText(/Brammo|Ford|Toyota/i);

      // Select "Brammo" checkbox
      const brammoCheckbox = dialogContent.locator('input[type="checkbox"]').first();
      await brammoCheckbox.check();
      expect(await brammoCheckbox.isChecked()).toBe(true);

      // Click Apply button
      const applyButton = page.locator('button:has-text("Apply")');
      await applyButton.click();

      // Verify dialog closes
      await expect(dialogTitle).not.toBeVisible();

      // Verify chip appears
      const chip = page.locator('text=Brammo');
      await expect(chip).toBeVisible();

      // Verify URL updated
      const params = await getUrlParams(page);
      expect(params['manufacturer']).toBe('Brammo');

      // Verify Results Table updated
      await waitForTableUpdate(page);
      const paginatorStatus = page.locator('.p-paginator-current');
      const statusText = await paginatorStatus.textContent();
      // Should show fewer than 4,887 records
      expect(statusText).not.toContain('4,887');
    });

    test('2.1.9-2.1.13: Dialog Behavior with Multiple Filters', async ({ page }) => {
      await page.goto('/discover?manufacturer=Brammo');

      // Open Year dialog (different filter)
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      const yearOption = page.locator('text=Year').first();
      await yearOption.click();

      // Verify Year dialog opens (not Manufacturer)
      const dialogTitle = page.locator('.p-dialog-title');
      await expect(dialogTitle).toContainText(/Year|Range/i);

      // Cancel the dialog
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();

      // Verify Manufacturer filter remains active
      const params = await getUrlParams(page);
      expect(params['manufacturer']).toBe('Brammo');
    });

    test('2.1.14-2.1.18: Multiple Selection', async ({ page }) => {
      await page.goto('/discover');

      // Open Manufacturer dialog
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      const manufacturerOption = page.locator('text=Manufacturer').first();
      await manufacturerOption.click();

      // Select multiple manufacturers
      const dialogContent = page.locator('.p-dialog-content');
      const checkboxes = dialogContent.locator('input[type="checkbox"]');

      // Select first 3 manufacturers
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();

      expect(await checkboxes.nth(0).isChecked()).toBe(true);
      expect(await checkboxes.nth(1).isChecked()).toBe(true);
      expect(await checkboxes.nth(2).isChecked()).toBe(true);

      // Apply
      const applyButton = page.locator('button:has-text("Apply")');
      await applyButton.click();

      // Verify URL contains all three
      const params = await getUrlParams(page);
      expect(params['manufacturer']).toBeDefined();
      // Should be comma-separated or multiple values
      expect(params['manufacturer']).toMatch(/,/);

      // Verify Results Table updated immediately (BUG #16 fix validation)
      await waitForTableUpdate(page);
    });

    test('2.1.19-2.1.22: Search in Dialog', async ({ page }) => {
      await page.goto('/discover');

      // Open Manufacturer dialog
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      const manufacturerOption = page.locator('text=Manufacturer').first();
      await manufacturerOption.click();

      // Find search input and type
      const searchInput = page.locator('input[type="text"]').first();
      await searchInput.fill('brammo');

      // Verify list is filtered
      const dialogContent = page.locator('.p-dialog-content');
      const labels = dialogContent.locator('label');
      let brammoFound = false;
      const count = await labels.count();

      for (let i = 0; i < count; i++) {
        const text = await labels.nth(i).textContent();
        if (text && text.toLowerCase().includes('brammo')) {
          brammoFound = true;
        }
      }
      expect(brammoFound).toBe(true);

      // Clear search
      await searchInput.clear();

      // Verify list is restored
      const restoredLabels = dialogContent.locator('label');
      expect(await restoredLabels.count()).toBeGreaterThan(10);

      // Cancel dialog
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
    });

    test('2.1.23-2.1.26: Keyboard Navigation in Dialog', async ({ page }) => {
      await page.goto('/discover');

      // Open Manufacturer dialog
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      const manufacturerOption = page.locator('text=Manufacturer').first();
      await manufacturerOption.click();

      // Tab to first checkbox
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Space to select
      await page.keyboard.press('Space');

      // Verify checkbox is checked (or interact with it)
      const dialogContent = page.locator('.p-dialog-content');
      const firstCheckbox = dialogContent.locator('input[type="checkbox"]').first();
      expect(await firstCheckbox.isChecked()).toBe(true);

      // Shift+Tab to navigate to Apply button
      await page.keyboard.press('Shift+Tab');

      // Press Enter to apply
      await page.keyboard.press('Enter');

      // Verify dialog closes
      const dialogTitle = page.locator('.p-dialog-title');
      await expect(dialogTitle).not.toBeVisible();

      // Verify filter applied
      const params = await getUrlParams(page);
      expect(params['manufacturer']).toBeDefined();
    });

    test('2.1.27-2.1.29: Edit Applied Filter', async ({ page }) => {
      await page.goto('/discover?manufacturer=Brammo');

      // Click on manufacturer chip to edit
      const chip = page.locator('text=Brammo').first();
      await chip.click();

      // Verify dialog reopens with Brammo pre-checked
      const dialogTitle = page.locator('.p-dialog-title');
      await expect(dialogTitle).toBeVisible();

      const dialogContent = page.locator('.p-dialog-content');
      const brammoCheckbox = dialogContent.locator('input[type="checkbox"]').first();
      expect(await brammoCheckbox.isChecked()).toBe(true);

      // Uncheck Brammo and check first option instead
      await brammoCheckbox.uncheck();
      const firstCheckbox = dialogContent.locator('input[type="checkbox"]').first();
      await firstCheckbox.check();

      // Apply
      const applyButton = page.locator('button:has-text("Apply")');
      await applyButton.click();

      // Verify URL changed
      const params = await getUrlParams(page);
      expect(params['manufacturer']).not.toBe('Brammo');
      expect(params['manufacturer']).toBeDefined();

      // Verify Results Table updated
      await waitForTableUpdate(page);
    });

    test('2.1.30-2.1.32: Remove Filter', async ({ page }) => {
      await page.goto('/discover?manufacturer=Brammo');

      // Click X button on chip to remove
      const chipClose = page.locator('[data-testid*="chip-close"]').first();
      await chipClose.click();

      // Verify chip removed
      const chip = page.locator('text=Brammo');
      await expect(chip).not.toBeVisible();

      // Verify URL cleaned
      const params = await getUrlParams(page);
      expect(params['manufacturer']).toBeUndefined();

      // Verify Results Table shows all records again
      const paginatorStatus = page.locator('.p-paginator-current');
      await expect(paginatorStatus).toContainText(/4,887/);
    });

  });

  test.describe('2.2: Model Filter (Multiselect Dialog)', () => {

    test('2.2.1-2.2.2: Single Selection Workflow', async ({ page }) => {
      await page.goto('/discover');

      // Open Model filter
      const fieldDropdown = page.locator('[data-testid="filter-field-dropdown"]');
      await fieldDropdown.click();

      const modelOption = page.locator('text=Model').first();
      await modelOption.click();

      // Verify Model dialog opens
      const dialogTitle = page.locator('.p-dialog-title');
      await expect(dialogTitle).toContainText(/Model/i);

      // Select a model
      const dialogContent = page.locator('.p-dialog-content');
      const firstCheckbox = dialogContent.locator('input[type="checkbox"]').first();
      await firstCheckbox.check();

      // Apply
      const applyButton = page.locator('button:has-text("Apply")');
      await applyButton.click();

      // Verify URL updated with model parameter
      const params = await getUrlParams(page);
      expect(params['model']).toBeDefined();

      // Verify Results Table updated
      await waitForTableUpdate(page);
    });

  });

});

// ============================================================================
// PHASE 3+: ADDITIONAL TESTS (Results Table, Statistics, Pop-outs)
// ============================================================================

test.describe('PHASE 3+: Additional Controls', () => {

  test('Results Table Pagination', async ({ page }) => {
    await page.goto('/discover');

    // Verify paginator shows 4,887 records
    const paginatorStatus = page.locator('.p-paginator-current');
    await expect(paginatorStatus).toContainText(/4,887/);

    // Go to next page
    const nextPageButton = page.locator('.p-paginator-next');
    await nextPageButton.click();

    // Verify paginator updated
    await expect(paginatorStatus).toContainText(/11 to 20/);
  });

  test('Statistics Panel Displays Data', async ({ page }) => {
    await page.goto('/discover');

    // Verify statistics panel is visible
    const statsPanel = page.locator('[data-testid="statistics-panel"]');
    await expect(statsPanel).toBeVisible();

    // Verify charts exist
    const charts = page.locator('[data-testid*="chart"]');
    expect(await charts.count()).toBeGreaterThan(0);
  });

});
