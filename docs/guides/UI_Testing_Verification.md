# UI Testing & Verification

**Purpose**: Guidelines for AI assistants (Cline, Claude Code, etc.) to exercise the UI and verify changes using Playwright.

---

## Project-Specific Configuration

### Routes
- **Main Discover Page**: `/automobiles/discover`
- **With Filters**: `/automobiles/discover?manufacturer=Chevrolet`
- **Base URL**: `http://localhost:4205` (dev server must be running)

### Data Test IDs (Available in Development)

These `data-testid` attributes are available when `environment.includeTestIds` is true:

| Component | Test ID | Notes |
|-----------|---------|-------|
| Query Panel | `query-panel` | Main filter container |
| Query Control | `query-control-panel` | Filter controls |
| Filter Dropdown | `filter-field-dropdown` | Field selector dropdown |
| Results Table Panel | `results-table-panel` | Container div |
| Results Table | `results-table` | The actual p-table |
| Basic Results Table Panel | `basic-results-table-panel` | Container div |
| Basic Results Table | `basic-results-table` | The actual p-table |
| Picker Panel | `picker-panel` | Manufacturer/Model picker container |
| Picker Table | `picker-table` | Picker p-table |
| Statistics Panel | `statistics-panel` | Stats/charts panel |
| Charts | `chart-{id}` | Individual chart components |

---

## Execution Environment

- **Tooling**: Use the project's local Playwright installation via `npx playwright`
- **Mode**: Run in headless mode (remote Linux server environment)
- **Dev Server**: Must be running on port 4205 before tests execute

### Running Tests

```bash
# From frontend/ directory
npm run test:e2e                    # Run all E2E tests
npx playwright test path/to/test.ts # Run specific test
npm run test:report                 # View test results (port 9323)
```

---

## Workflow for UI Verification Tasks

When asked to "check the UI" or "exercise the site":

1. **Confirm dev server is running** (ask user if unsure)
2. **Create temporary test script** in `frontend/e2e/tests/tmp/`
3. **Use correct routes**: `/automobiles/discover` (NOT `/discover/automobile`)
4. **Use correct test IDs**: See table above
5. **Take screenshots** with injected URL bar (headless has no address bar)
6. **Report results** in chat
7. **Clean up**: Delete temporary scripts after verification

---

## Note on Headless Screenshots

In headless mode, `page.screenshot()` only captures web content - no browser chrome (address bar, buttons, etc.).

**Solution**: Inject a fake URL bar before taking screenshots:

```typescript
const injectUrlBar = async (p: Page) => {
  await p.evaluate((url) => {
    const div = document.createElement('div');
    div.style.cssText = 'background: #333; color: white; padding: 5px; font-family: monospace; font-size: 14px; position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;';
    div.innerText = `URL: ${url}`;
    document.body.style.marginTop = '30px';
    document.body.appendChild(div);
  }, p.url());
};
```

---

## Multi-Window & Pop-out Testing

- Use `context.pages()` to track all open windows/popups
- Use `context.waitForEvent('page')` to catch new windows
- Iterate through ALL pages and screenshot each
- Name screenshots descriptively: `main-window.png`, `popup-1.png`

---

## Example: UI Exercise Script

```typescript
import { test, expect } from '@playwright/test';

test.describe('UI Exercise - Temporary', () => {
  test('Exercise discover page and capture screenshots', async ({ page, context }) => {
    // Navigate to the correct route
    await page.goto('/automobiles/discover');
    await page.waitForLoadState('networkidle');

    // Wait for main table to load
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 });

    // Helper to inject URL bar
    const injectUrlBar = async (p: typeof page) => {
      await p.evaluate((url) => {
        const div = document.createElement('div');
        div.style.cssText = 'background: #333; color: white; padding: 5px; font-family: monospace; font-size: 14px; position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;';
        div.innerText = `URL: ${url}`;
        document.body.style.marginTop = '30px';
        document.body.appendChild(div);
      }, p.url());
    };

    // Screenshot main page
    await injectUrlBar(page);
    await page.screenshot({ path: 'screenshots/main-discover.png', fullPage: true });

    // Apply a filter via URL
    await page.goto('/automobiles/discover?manufacturer=Chevrolet');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 });

    await injectUrlBar(page);
    await page.screenshot({ path: 'screenshots/filtered-chevrolet.png', fullPage: true });

    // Test pop-out if available
    const popoutButton = page.locator('button').filter({ has: page.locator('.pi-external-link') }).first();
    if (await popoutButton.isVisible()) {
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        popoutButton.click()
      ]);

      await popup.waitForLoadState('networkidle');
      await popup.bringToFront();
      await injectUrlBar(popup);
      await popup.screenshot({ path: 'screenshots/popout-window.png', fullPage: true });
    }

    // Capture all windows
    const allPages = context.pages();
    for (let i = 0; i < allPages.length; i++) {
      const p = allPages[i];
      await p.bringToFront();
      // Re-inject URL bar if needed
      await p.screenshot({ path: `screenshots/window-${i}.png`, fullPage: true });
    }
  });
});
```

---

## Project Test Utilities

The project includes a `TestLogger` utility for capturing console logs and API calls. For integration tests, use:

```typescript
import { TestLogger, createTestLogger } from '../test-logger';

test.describe('My Tests', () => {
  let logger: TestLogger;

  test.beforeEach(async ({ page }) => {
    logger = await createTestLogger(page);
  });

  test.afterEach(async () => {
    logger.printSummary();
  });

  test('example', async ({ page }) => {
    // ... test code ...
    const errors = logger.getConsoleErrors();
    expect(errors.length).toBe(0);
  });
});
```

---

## Cleanup

Delete temporary test scripts from `frontend/e2e/tests/tmp/` after verification tasks are complete.

---

**Last Updated**: 2025-12-30
