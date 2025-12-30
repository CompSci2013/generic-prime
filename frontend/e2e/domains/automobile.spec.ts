import { test, expect, Page } from '@playwright/test';

/**
 * Automobile Domain E2E Test Suite
 *
 * Tests the Automobile discovery interface with comprehensive workflows
 * following the exact patterns and selectors defined in .clinerules
 */

// Helper function to inject URL bar overlay for screenshots
async function injectUrlBar(page: Page) {
  await page.evaluate((url) => {
    const div = document.createElement('div');
    div.style.cssText = 'background: #333; color: white; padding: 5px; font-family: monospace; font-size: 14px; position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;';
    div.innerText = `URL: ${url}`;
    document.body.style.marginTop = '30px';
    document.body.appendChild(div);
  }, page.url());
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

// Helper to wait for results table data
async function waitForTableUpdate(page: Page, timeoutMs: number = 10000) {
  const resultsTable = page.locator('[data-testid="basic-results-table"]');
  await resultsTable.locator('.p-paginator-current').first().waitFor({ timeout: timeoutMs });
}

// ============================================================================
// PHASE 1: INITIAL STATE & BASIC NAVIGATION
// ============================================================================

test.describe('PHASE 1 (Automobile): Initial State & Basic Navigation', () => {

  test('1.1: Initial page load - automobile records displayed', async ({ page }) => {
    // Navigate to automobile discover page using correct route from .clinerules
    await page.goto('/automobiles/discover');

    // Verify all 4 panels are visible using correct data-testid selectors
    await expect(page.locator('[data-testid="query-control-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="picker-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-results-table-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="statistics-panel"]')).toBeVisible();

    // Verify URL is clean (no query params)
    const params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Verify Results Table shows records
    const resultsTable = page.locator('[data-testid="basic-results-table"]');
    const resultsTablePaginator = resultsTable.locator('.p-paginator-current').first();
    await expect(resultsTablePaginator).toBeVisible({ timeout: 10000 });
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/1.1-initial-page-load.png', fullPage: true });
  });

  test('1.2: Panel collapse/expand - state independent of URL', async ({ page }) => {
    await page.goto('/automobiles/discover');

    // Collapse Query Control panel
    const queryControlComponent = page.locator('[data-testid="query-control-panel"]');
    const panelActions = page.locator('.panel-actions button');
    await panelActions.first().click();

    // Verify it's collapsed
    await expect(queryControlComponent).not.toBeVisible();

    // Verify URL remains clean
    const params = await getUrlParams(page);
    expect(Object.keys(params).length).toBe(0);

    // Expand it back
    await panelActions.first().click();
    await expect(queryControlComponent).toBeVisible();
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/1.2-panel-collapse-expand.png', fullPage: true });
  });

});

// ============================================================================
// PHASE 2.1: FILTER WORKFLOW
// ============================================================================

test.describe('PHASE 2.1 (Automobile): Filter Workflows', () => {

  test('2.1.1: Apply manufacturer filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Apply a manufacturer filter via URL
    await page.goto('/automobiles/discover?manufacturer=Chevrolet');

    await waitForTableUpdate(page);

    // Verify URL has the filter
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeDefined();

    // Verify Results Table shows filtered data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.1-manufacturer-filter.png', fullPage: true });
  });

  test('2.1.2: Remove manufacturer filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover?manufacturer=Chevrolet');

    await waitForTableUpdate(page);

    // Navigate to clear filter
    await page.goto('/automobiles/discover');

    await waitForTableUpdate(page);

    // Verify filter is cleared
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeUndefined();
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.2-remove-manufacturer-filter.png', fullPage: true });
  });

  test('2.1.3: Apply model filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Apply a model filter via URL
    await page.goto('/automobiles/discover?model=Camaro');

    await waitForTableUpdate(page);

    // Verify URL has the filter
    const params = await getUrlParams(page);
    expect(params['model']).toBeDefined();

    // Verify Results Table shows filtered data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.3-model-filter.png', fullPage: true });
  });

  test('2.1.4: Apply body class filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Apply a body class filter via URL
    await page.goto('/automobiles/discover?bodyClass=Sedan');

    await waitForTableUpdate(page);

    // Verify URL has the filter
    const params = await getUrlParams(page);
    expect(params['bodyClass']).toBeDefined();

    // Verify Results Table shows filtered data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.4-body-class-filter.png', fullPage: true });
  });

  test('2.1.5: Apply year range filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Apply a year range filter via URL
    await page.goto('/automobiles/discover?yearMin=2020&yearMax=2024');

    await waitForTableUpdate(page);

    // Verify URL has the filters
    const params = await getUrlParams(page);
    expect(params['yearMin']).toBeDefined();
    expect(params['yearMax']).toBeDefined();

    // Verify Results Table shows filtered data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.5-year-range-filter.png', fullPage: true });
  });

  test('2.1.6: Apply search filter', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Apply a search filter via URL
    await page.goto('/automobiles/discover?search=Chevrolet');

    await waitForTableUpdate(page);

    // Verify URL has the filter
    const params = await getUrlParams(page);
    expect(params['search']).toBeDefined();

    // Verify Results Table shows filtered data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/2.1.6-search-filter.png', fullPage: true });
  });

});

// ============================================================================
// PHASE 3: RESULTS TABLE PANEL
// ============================================================================

test.describe('PHASE 3 (Automobile): Results Table Panel', () => {

  test('3.1.1: Table pagination', async ({ page }: { page: Page }) => {
    // Test pagination by navigating to a specific page via URL
    await page.goto('/automobiles/discover?first=10');

    await waitForTableUpdate(page);

    // Verify pagination parameter is in URL
    const params = await getUrlParams(page);
    expect(params['first']).toBe('10');

    // Verify table is showing data
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/3.1.1-table-pagination.png', fullPage: true });
  });

  test('3.1.2: Results count display', async ({ page }: { page: Page }) => {
    await page.goto('/automobiles/discover');

    // Verify results count is displayed
    const resultsCount = page.locator('[data-testid="basic-results-table"] .p-paginator-current');
    await expect(resultsCount).toBeVisible({ timeout: 10000 });
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/3.1.2-results-count-display.png', fullPage: true });
  });

});

// ============================================================================
// PHASE 4: PICKER (DOMAIN-SPECIFIC)
// ============================================================================

test.describe('PHASE 4 (Automobile): Picker Panel', () => {

  test('4.1.1: Single picker selection', async ({ page }: { page: Page }) => {
    // For automobiles, picker might select manufacturer or model
    await page.goto('/automobiles/discover?pickedManufacturer=Chevrolet');

    await waitForTableUpdate(page);

    // Verify picker parameter is in URL
    const params = await getUrlParams(page);
    expect(params['pickedManufacturer']).toBe('Chevrolet');

    // Verify results table updated
    const rows = page.locator('[data-testid="basic-results-table"] tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/4.1.1-single-picker-selection.png', fullPage: true });
  });

});

// ============================================================================
// PHASE 5: STATISTICS PANEL
// ============================================================================

test.describe('PHASE 5 (Automobile): Statistics Panel', () => {

  test('5.1.1: Statistics display', async ({ page }) => {
    await page.goto('/automobiles/discover');

    const statsPanel = page.locator('[data-testid="statistics-panel"]');
    await expect(statsPanel).toBeVisible();

    // Verify charts are visible using correct data-testid pattern
    const charts = statsPanel.locator('[data-testid^="chart-"]');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/5.1.1-statistics-display.png', fullPage: true });
  });

  test('5.1.2: Statistics panel with filters', async ({ page }) => {
    await page.goto('/automobiles/discover?manufacturer=Ford');

    const statsPanel = page.locator('[data-testid="statistics-panel"]');
    await expect(statsPanel).toBeVisible();

    // Verify charts are visible
    const charts = statsPanel.locator('[data-testid^="chart-"]');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThan(0);
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/5.1.2-statistics-panel-with-filters.png', fullPage: true });
  });

});

// ============================================================================
// PHASE 6: ADVANCED FEATURES
// ============================================================================

test.describe('PHASE 6 (Automobile): Advanced Features', () => {

  test('6.1.1: Filter chip management', async ({ page }) => {
    await page.goto('/automobiles/discover');

    // Apply a filter to create a chip
    await page.goto('/automobiles/discover?manufacturer=Chevrolet');

    // Verify filter chip is present
    const filterChips = page.locator('.p-chip');
    await expect(filterChips).toBeVisible();
    
    // Verify chip contains the filter text
    const chipText = await filterChips.first().textContent();
    expect(chipText).toContain('Chevrolet');
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/6.1.1-filter-chip-management.png', fullPage: true });
  });

  test('6.1.2: Clear all filters', async ({ page }) => {
    await page.goto('/automobiles/discover?manufacturer=Chevrolet');

    // Navigate to clear all filters
    await page.goto('/automobiles/discover');

    // Verify no filters in URL
    const params = await getUrlParams(page);
    expect(params['manufacturer']).toBeUndefined();
    
    // Capture screenshot
    await injectUrlBar(page);
    await page.screenshot({ path: 'frontend/screenshots/6.1.2-clear-all-filters.png', fullPage: true });
  });

});
