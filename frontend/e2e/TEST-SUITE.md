# E2E Test Suite Architecture

**Created**: 2025-12-25
**Purpose**: Define the testing strategy and organization for the Generic Prime application

---

## Test Organization Philosophy

### One Test File Per Angular Component

Yes, the recommended approach is **one test file per Angular component**. This provides:

1. **Clear ownership** - Each component's tests live in one place
2. **Isolation** - Component tests don't interfere with each other
3. **Maintainability** - Easy to find and update tests when component changes
4. **Parallel execution** - Playwright can run test files in parallel

### Directory Structure

```
frontend/e2e/
├── TEST-SUITE.md                    # This file - test architecture documentation
├── test-logger.ts                   # Shared test utilities (console/network capture)
├── test-helpers.ts                  # Shared helper functions (to be created)
│
├── components/                      # Phase 1: Component Tests
│   ├── query-control.spec.ts        # Query Control component tests
│   ├── results-table.spec.ts        # Results Table component tests
│   ├── statistics-panel.spec.ts     # Statistics Panel component tests
│   ├── picker.spec.ts               # Manufacturer-Model Picker tests
│   └── charts/                      # Chart components
│       ├── bar-chart.spec.ts
│       ├── pie-chart.spec.ts
│       └── line-chart.spec.ts
│
├── integration/                     # Phase 2: Integration Tests
│   ├── filter-propagation.spec.ts   # Filters affect all components
│   ├── url-state-sync.spec.ts       # URL ↔ Component state synchronization
│   └── cross-component.spec.ts      # Multi-component interactions
│
├── popout/                          # Phase 3: Pop-Out Window Tests
│   ├── popout-sync.spec.ts          # Pop-out synchronization
│   ├── popout-query-control.spec.ts # Query Control in pop-out
│   ├── popout-results-table.spec.ts # Results Table in pop-out
│   └── multi-popout.spec.ts         # Multiple pop-outs simultaneously
│
├── regression/                      # Bug Regression Tests
│   ├── bug-11-picker-count.spec.ts
│   ├── bug-15-dropdown-filter.spec.ts
│   └── ... (one file per bug)
│
└── domains/                         # Domain-Specific Tests (future)
    ├── automobiles.spec.ts
    ├── physics.spec.ts
    └── ...
```

---

## Phase 1: Component Tests

### Purpose
Test each Angular component in isolation. Verify all user interactions work correctly.

### Test File Template

```typescript
// frontend/e2e/components/query-control.spec.ts

import { test, expect } from '@playwright/test';
import { TestLogger } from '../test-logger';

test.describe('Query Control Component', () => {
  let logger: TestLogger;

  test.beforeEach(async ({ page }) => {
    logger = new TestLogger(page);
    await page.goto('/automobiles/discover');
    await page.waitForSelector('[data-testid="query-control-panel"]', { timeout: 10000 });
  });

  test.afterEach(async () => {
    logger.printSummary();
  });

  // ==================== Dropdown Tests ====================
  test.describe('Filter Dropdown', () => {
    test('opens when clicked', async ({ page }) => { /* ... */ });
    test('shows all filter options', async ({ page }) => { /* ... */ });
    test('filters options when typing', async ({ page }) => { /* ... */ });
    test('selects option with mouse click', async ({ page }) => { /* ... */ });
    test('selects option with keyboard (ArrowDown + Enter)', async ({ page }) => { /* ... */ });
    test('selects correct option when filtered (Bug #15)', async ({ page }) => { /* ... */ });
  });

  // ==================== Filter Dialog Tests ====================
  test.describe('Multiselect Dialog', () => {
    test('opens when Manufacturer selected', async ({ page }) => { /* ... */ });
    test('loads options from API', async ({ page }) => { /* ... */ });
    test('filters options with search', async ({ page }) => { /* ... */ });
    test('selects multiple options', async ({ page }) => { /* ... */ });
    test('Apply button updates URL', async ({ page }) => { /* ... */ });
    test('Cancel button closes without changes', async ({ page }) => { /* ... */ });
  });

  test.describe('Year Range Dialog', () => {
    test('opens when Year selected', async ({ page }) => { /* ... */ });
    test('accepts min year only', async ({ page }) => { /* ... */ });
    test('accepts max year only', async ({ page }) => { /* ... */ });
    test('accepts both min and max', async ({ page }) => { /* ... */ });
    test('validates year range', async ({ page }) => { /* ... */ });
  });

  // ==================== Filter Chip Tests ====================
  test.describe('Filter Chips', () => {
    test('appear after filter applied', async ({ page }) => { /* ... */ });
    test('show correct label and values', async ({ page }) => { /* ... */ });
    test('clicking chip opens edit dialog', async ({ page }) => { /* ... */ });
    test('X button removes filter', async ({ page }) => { /* ... */ });
    test('removing filter updates URL', async ({ page }) => { /* ... */ });
  });

  // ==================== Clear All Button ====================
  test.describe('Clear All Button', () => {
    test('is disabled when no filters', async ({ page }) => { /* ... */ });
    test('is enabled when filters exist', async ({ page }) => { /* ... */ });
    test('removes all filters when clicked', async ({ page }) => { /* ... */ });
    test('updates URL to remove all params', async ({ page }) => { /* ... */ });
  });
});
```

### Components to Test

| Component | Test File | Key Test Areas |
|-----------|-----------|----------------|
| **Query Control** | `query-control.spec.ts` | Dropdown, dialogs, chips, Clear All |
| **Results Table** | `results-table.spec.ts` | Pagination, sorting, row display, column visibility |
| **Statistics Panel** | `statistics-panel.spec.ts` | Charts render, data accuracy, click interactions |
| **Picker** | `picker.spec.ts` | Lazy loading, selection, search, pagination |

---

## Phase 2: Integration Tests

### Purpose
Test that components work together correctly. When one component changes state, others update appropriately.

### Key Integration Scenarios

#### 1. Filter Propagation (`filter-propagation.spec.ts`)

```typescript
test.describe('Filter Propagation', () => {
  test('Query Control filter updates Results Table', async ({ page }) => {
    // 1. Navigate to discover page
    await page.goto('/automobiles/discover');

    // 2. Verify initial state (4887 results)
    await expect(page.locator('.results-count')).toContainText('4887');

    // 3. Apply Manufacturer=Chevrolet filter via Query Control
    // ... (apply filter)

    // 4. Verify Results Table updated
    await expect(page.locator('.results-count')).toContainText('849');

    // 5. Verify all visible rows are Chevrolet
    const rows = page.locator('.results-table tr');
    // ... (check manufacturer column)
  });

  test('Query Control filter updates Statistics Panel', async ({ page }) => {
    // Apply Model=Camaro, verify statistics show only Camaro data
  });

  test('Query Control filter updates Picker counts', async ({ page }) => {
    // Apply filter, verify picker shows filtered counts
  });

  test('Picker selection updates Query Control chips', async ({ page }) => {
    // Select in picker, verify chip appears in Query Control
  });
});
```

#### 2. URL State Synchronization (`url-state-sync.spec.ts`)

```typescript
test.describe('URL State Synchronization', () => {
  test('URL params populate Query Control on page load', async ({ page }) => {
    await page.goto('/automobiles/discover?manufacturer=Ford&yearMin=2020');
    // Verify chips show Ford and Year: 2020+
  });

  test('Filter changes update URL', async ({ page }) => {
    // Apply filter, verify URL updated
  });

  test('Browser back button restores previous filter state', async ({ page }) => {
    // Apply filter, apply another, press back, verify first filter restored
  });

  test('URL changes trigger data fetch', async ({ page }) => {
    // Navigate with URL params, verify API called with correct params
  });
});
```

#### 3. Cross-Component Interactions (`cross-component.spec.ts`)

```typescript
test.describe('Cross-Component Interactions', () => {
  test('Selecting chart segment applies filter', async ({ page }) => {
    // Click pie chart segment, verify filter applied
  });

  test('Table row click affects detail view', async ({ page }) => {
    // Click row, verify detail panel updates
  });

  test('Multiple filters combine correctly (AND logic)', async ({ page }) => {
    // Apply Manufacturer=Ford AND yearMin=2020
    // Verify results match both criteria
  });
});
```

---

## Phase 3: Pop-Out Window Tests

### Purpose
Test that pop-out windows synchronize correctly with the main window.

### Key Scenarios

```typescript
// popout/popout-sync.spec.ts

test.describe('Pop-Out Synchronization', () => {
  test('Pop-out receives initial state from main window', async ({ context }) => {
    // 1. Apply filters in main window
    // 2. Open pop-out
    // 3. Verify pop-out shows same filter state
  });

  test('Main window filter change propagates to pop-out', async ({ context }) => {
    // 1. Open pop-out
    // 2. Change filter in main window
    // 3. Verify pop-out updates
  });

  test('Pop-out filter change propagates to main window', async ({ context }) => {
    // 1. Open Query Control pop-out
    // 2. Apply filter in pop-out
    // 3. Verify main window URL and state update
  });

  test('Multiple pop-outs stay synchronized', async ({ context }) => {
    // 1. Open Query Control pop-out
    // 2. Open Results Table pop-out
    // 3. Change filter in Query Control pop-out
    // 4. Verify BOTH main window AND Results Table pop-out update
  });

  test('Pop-out URL remains clean (no query params)', async ({ context }) => {
    // Pop-out should use /panel/:gridId/:panelId/:type format
    // NOT have query parameters in its URL
  });
});
```

---

## Regression Tests

### Purpose
Prevent previously fixed bugs from reoccurring. Each bug gets its own test file.

### Naming Convention
`bug-{number}-{short-description}.spec.ts`

### Template

```typescript
/**
 * Bug #{number} Regression Test: {Title}
 *
 * Original Issue: {description of the bug}
 * Root Cause: {what caused it}
 * Fix: {what was changed}
 * Fixed In: {commit hash or session number}
 */

import { test, expect } from '@playwright/test';
import { TestLogger } from '../test-logger';

test.describe('Bug #{number}: {Title}', () => {
  test('reproduction scenario', async ({ page }) => {
    // Exact steps that triggered the bug
    // This test should FAIL before the fix
    // This test should PASS after the fix
  });
});
```

---

## Test Execution

### Run All Tests
```bash
npx playwright test
```

### Run Specific Phase
```bash
# Component tests only
npx playwright test components/

# Integration tests only
npx playwright test integration/

# Pop-out tests only
npx playwright test popout/

# Regression tests only
npx playwright test regression/
```

### Run Single Test File
```bash
npx playwright test components/query-control.spec.ts
```

### Run with UI Mode (debugging)
```bash
npx playwright test --ui
```

### Run Headed (see browser)
```bash
npx playwright test --headed
```

---

## Test Development Workflow

### Creating New Tests

1. **Identify the component/feature** to test
2. **Create test file** in appropriate directory
3. **Write test cases** covering:
   - Happy path (normal usage)
   - Edge cases
   - Error conditions
   - Accessibility (keyboard navigation)
4. **Run tests** to verify they pass
5. **Commit** with descriptive message

### Bug Regression Workflow (FAIL FIRST)

1. **Create reproduction test** that demonstrates the bug
2. **Run test** - verify it FAILS
3. **Fix the bug** in the application code
4. **Run test again** - verify it PASSES
5. **Run all related tests** - verify no regressions
6. **Commit** both fix and test

---

## Shared Utilities

### TestLogger (`test-logger.ts`)

Captures console logs and network traffic for debugging.

```typescript
import { TestLogger } from './test-logger';

test('example', async ({ page }) => {
  const logger = new TestLogger(page);

  // ... test code ...

  // Check for console errors
  expect(logger.hasConsoleErrors()).toBeFalsy();

  // Verify API was called
  logger.assertApiCall('/api/specs/v1/vehicles/details', 200);

  // Print summary for debugging
  logger.printSummary();
});
```

### Test Helpers (`test-helpers.ts`) - To Be Created

Common operations used across tests:

```typescript
// Example helpers to create
export async function applyManufacturerFilter(page: Page, manufacturer: string) { }
export async function applyYearRange(page: Page, min: number, max: number) { }
export async function openPopout(page: Page, panelType: string): Promise<Page> { }
export async function waitForApiCall(page: Page, urlPattern: string) { }
export async function getResultsCount(page: Page): Promise<number> { }
export async function clearAllFilters(page: Page) { }
```

---

## Test Data Expectations

### Automobile Domain Baseline Data

| Metric | Value | Notes |
|--------|-------|-------|
| Total records | 4,887 | Unfiltered count |
| Manufacturer: Chevrolet | 849 | |
| Manufacturer: Ford | ~600 | Approximate |
| Model: Camaro | 59 | |
| Year Range 2020-2024 | ~290 | |
| Manufacturer-Model combinations | 881 | |

Use these values for assertions when testing filter behavior.

---

## Priority Order for Implementation

### Immediate (This Session)
1. ✅ `test-logger.ts` - Already exists
2. ✅ `bug-15-dropdown-filter.spec.ts` - Already created
3. ⏳ `query-control.spec.ts` - Full component test suite

### Short Term
4. `results-table.spec.ts` - Component tests
5. `filter-propagation.spec.ts` - Integration tests
6. `popout-sync.spec.ts` - Pop-out tests (partially exists)

### Medium Term
7. `statistics-panel.spec.ts`
8. `picker.spec.ts`
9. `url-state-sync.spec.ts`

### Ongoing
- Add regression tests as bugs are discovered and fixed
- Expand integration tests as features are added

---

## Best Practices

### 1. Use data-testid Attributes
Prefer `[data-testid="..."]` selectors over CSS classes for stability.

### 2. Wait for Stability
Use `waitForSelector` and `waitForTimeout` appropriately to handle async operations.

### 3. Verify API Calls
Use TestLogger to verify correct API endpoints are called with correct parameters.

### 4. Check Console for Errors
Every test should verify no console errors occurred.

### 5. Clean State
Each test should start from a clean state (fresh page load).

### 6. Descriptive Names
Test names should clearly describe what is being tested and expected outcome.

### 7. Fail First for Bugs
When fixing bugs, always write the failing test BEFORE implementing the fix.

---

## Lessons Learned (from Bug #14 Case Study)

1. **Test integration scenarios, not just components** - A component may work fine alone but fail in combination
2. **Test pop-outs with BOTH windows active** - Don't test pop-outs in isolation
3. **Comprehensive logging beats hypothesis testing** - When confused, add logging
4. **Don't declare victory prematurely** - Verify with complete test cases
5. **If a test fails 3 times, ask for help** - Don't keep editing blindly

---

**Last Updated**: 2025-12-25
**Author**: Claude (Monster Watch Session)
