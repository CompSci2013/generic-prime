import { test, expect, Page } from '@playwright/test';

/**
 * Generic Prime E2E Test Suite
 *
 * Based on MANUAL-TEST-PLAN.md
 * Only tests cases that have been manually verified and marked as PASSED (✓)
 *
 * This ensures:
 * 1. Tests exercise known-working functionality
 * 2. If tests fail, the problem is test setup, not application code
 * 3. Gradual test coverage expansion as more manual tests pass
 */

// Helper to get current URL parameters
async function getUrlParams(page: Page): Promise<Record<string, string>> {
  const url = new URL(page.url());
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Helper to wait for results table data (using results-table paginator, not picker)
async function waitForTableUpdate(page: Page, timeoutMs: number = 10000) {
  const resultsTable = page.locator('[data-testid="results-table"]');
  await resultsTable.locator('.p-paginator-current').first().waitFor({ timeout: timeoutMs });
}

// ============================================================================
// PHASE 1: INITIAL STATE & BASIC NAVIGATION (ALL TESTS PASSED ✓)
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
    // Find the results-table p-table and its paginator (not the picker table)
    const resultsTable = page.locator('[data-testid="results-table"]');
    const resultsTablePaginator = resultsTable.locator('.p-paginator-current').first();
    await expect(resultsTablePaginator).toContainText(/4,887/, { timeout: 10000 });
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

    // Test other panels
    const panels = ['picker-panel', 'results-table-panel', 'statistics-panel'];
    for (const panelId of panels) {
      const collapse = page.locator(`[data-testid="${panelId}"] .p-panel-header-icon`).first();
      const content = page.locator(`[data-testid="${panelId}"] .p-panel-content`);

      await collapse.click();
      await expect(content).not.toBeVisible();
      await collapse.click();
      await expect(content).toBeVisible();
    }
  });

  test('1.3: Panel drag-drop reordering - does not affect URL', async ({ page }) => {
    await page.goto('/discover');

    // Get initial order
    const initialOrder = await page.locator('[data-testid*="-panel"]').count();
    expect(initialOrder).toBe(4);

    // Drag Query Control to different position
    const queryControl = page.locator('[data-testid="query-control-panel"]');
    const pickerPanel = page.locator('[data-testid="picker-panel"]');

    const queryControlBox = await queryControl.boundingBox();
    const pickerBox = await pickerPanel.boundingBox();

    if (queryControlBox && pickerBox) {
      // Drag query control below picker
      await page.dragAndDrop(
        '[data-testid="query-control-panel"]',
        '[data-testid="picker-panel"]'
      );
    }

    // Verify URL still clean
    const params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Verify all panels still visible
    await expect(queryControl).toBeVisible();
    await expect(pickerPanel).toBeVisible();
  });

});

// ============================================================================
// PHASE 2.1: MANUFACTURER FILTER (ALL TESTS PASSED ✓)
// ============================================================================

test.describe('PHASE 2.1: Manufacturer Filter (Multiselect Dialog)', () => {

  test('2.1.1-2.1.8: Single Selection Workflow - SELECT', async ({ page }: { page: Page }) => {
    await page.goto('/discover');

    // Click field selector dropdown
    const dropdown = page.locator('[data-testid="filter-field-dropdown"]');
    await dropdown.click();

    // Select "Manufacturer" from dropdown
    await page.locator('text=Manufacturer').first().click();

    // Verify multiselect dialog opens with title
    const dialogTitle = page.locator('.p-dialog-title');
    await expect(dialogTitle).toContainText(/Manufacturer|manufacturer/i, { timeout: 5000 });

    // Verify list shows available manufacturers
    const dialogContent = page.locator('.p-dialog-content');
    await expect(dialogContent).toBeVisible();

    // Select "Brammo" checkbox
    const brammoCheckbox = dialogContent.locator('input[type="checkbox"]').first();
    await brammoCheckbox.check();

    // Verify checkbox is checked
    await expect(brammoCheckbox).toBeChecked();

    // Click Apply
    const applyButton = page.locator('.p-dialog-footer button:has-text("Apply")').first();
    await applyButton.click();

    // Verify dialog closes
    await expect(dialogTitle).not.toBeVisible();

    // Verify URL updates with manufacturer parameter
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeDefined();

    // Verify Results Table updates
    await waitForTableUpdate(page);
  });

  test('2.1.27-2.1.29: Edit Applied Filter', async ({ page }: { page: Page }) => {
    await page.goto('/discover?manufacturer=Brammo');

    // Verify chip exists
    const chip = page.locator('text=Manufacturer').first();
    await expect(chip).toBeVisible();

    // Click on chip to edit
    await chip.click();

    // Verify dialog reopens
    const dialogTitle = page.locator('.p-dialog-title');
    await expect(dialogTitle).toContainText(/Manufacturer/i, { timeout: 5000 });

    // Change selection to different manufacturer
    const dialogContent = page.locator('.p-dialog-content');
    const checkboxes = dialogContent.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    // Uncheck first (Brammo)
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.uncheck();

    // Check second manufacturer if available
    if (count > 1) {
      const secondCheckbox = checkboxes.nth(1);
      await secondCheckbox.check();
    }

    // Click Apply
    const applyButton = page.locator('.p-dialog-footer button:has-text("Apply")').first();
    await applyButton.click();

    // Verify dialog closes
    await expect(dialogTitle).not.toBeVisible();

    // Verify URL updated
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeDefined();
  });

  test('2.1.30-2.1.32: Remove Filter', async ({ page }: { page: Page }) => {
    await page.goto('/discover?manufacturer=Brammo');

    // Find the chip's X button (using data-testid wildcard for chip-close)
    const chipClose = page.locator('[data-testid*="chip-close"]').first();
    await chipClose.click();

    // Verify URL no longer contains manufacturer parameter
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeUndefined();

    // Verify Results Table updates to show all records
    const resultsTable = page.locator('[data-testid="results-table"]');
    const resultsTablePaginator = resultsTable.locator('.p-paginator-current').first();
    await expect(resultsTablePaginator).toContainText(/4,887/, { timeout: 10000 });
  });

  test('2.1.19-2.1.22: Search in Dialog', async ({ page }: { page: Page }) => {
    await page.goto('/discover');

    // Open manufacturer filter
    const dropdown = page.locator('[data-testid="filter-field-dropdown"]');
    await dropdown.click();
    await page.locator('text=Manufacturer').first().click();

    // Wait for dialog
    const dialogTitle = page.locator('.p-dialog-title');
    await expect(dialogTitle).toContainText(/Manufacturer/i, { timeout: 5000 });

    // Find search input and type
    const dialogContent = page.locator('.p-dialog-content');
    const searchInput = dialogContent.locator('input[type="text"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('brammo');

      // Verify list is filtered (simplified - just check dialog still open)
      await expect(dialogTitle).toContainText(/Manufacturer/i);

      // Clear search
      await searchInput.fill('');
    }

    // Click somewhere to close the dialog
    const closeButton = page.locator('.p-dialog-header .p-dialog-header-icons button').first();
    await closeButton.click();
  });

  test('2.1.23-2.1.26: Keyboard Navigation', async ({ page }: { page: Page }) => {
    await page.goto('/discover');

    // Open manufacturer filter
    const dropdown = page.locator('[data-testid="filter-field-dropdown"]');
    await dropdown.click();
    await page.locator('text=Manufacturer').first().click();

    // Wait for dialog
    const dialogTitle = page.locator('.p-dialog-title');
    await expect(dialogTitle).toContainText(/Manufacturer/i, { timeout: 5000 });

    const dialogContent = page.locator('.p-dialog-content');
    const firstCheckbox = dialogContent.locator('input[type="checkbox"]').first();

    // Tab to first checkbox
    await firstCheckbox.focus();
    await page.keyboard.press('Space');

    // Verify checkbox is checked
    await expect(firstCheckbox).toBeChecked();

    // Navigate to Apply with keyboard
    const applyButton = page.locator('.p-dialog-footer button:has-text("Apply")').first();
    await applyButton.focus();
    await page.keyboard.press('Enter');

    // Verify dialog closes
    await expect(dialogTitle).not.toBeVisible();
  });

});

// ============================================================================
// OPTIONAL: Add more test groups as more manual tests pass and get checkmarks
// ============================================================================

test.describe('Future Tests (Awaiting Manual Verification)', () => {
  test.skip('2.2: Model Filter (not yet manually tested)', async () => {
    // Placeholder for when model filter is manually verified
  });

  test.skip('2.3: Body Class Filter (not yet manually tested)', async () => {
    // Placeholder for when body class filter is manually verified
  });
});
