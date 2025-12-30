# Cline Troubleshooting Guide

**Purpose**: Help Cline (and other AI assistants) self-diagnose and fix common issues when working with this project.

---

## Quick Diagnostic Checklist

Before debugging test failures, verify these basics:

1. **Dev server running?** `curl -s http://localhost:4205 | head -1`
2. **Correct route?** Must be `/automobiles/discover` (NOT `/discover/automobile`)
3. **Correct selectors?** Main page uses `basic-results-table` (NOT `results-table`)

---

## Common Failure Patterns

### Pattern 1: "element(s) not found" or "locator timeout"

**Symptom:**
```
Error: expect(locator).toBeVisible() failed
Locator: locator('[data-testid="results-table"]')
Expected: visible
Error: element(s) not found
```

**Diagnosis Steps:**

1. **Check if the selector exists in the DOM:**
```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4205/automobiles/discover');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const testIds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-testid]'))
      .map(el => el.getAttribute('data-testid'));
  });
  console.log('Available data-testid values:', testIds);
  await browser.close();
})();
"
```

2. **Compare with what you're looking for.** Common mistakes:
   - `results-table` vs `basic-results-table` (main page uses Basic)
   - `results-table-panel` vs `basic-results-table-panel`

**Fix:** Update selectors to match actual DOM. See `.clinerules` for correct values.

---

### Pattern 2: "No tests found"

**Symptom:**
```
Error: No tests found
```

**Causes:**
1. `--grep` pattern doesn't match any test names
2. Test file path is wrong
3. All tests in file are `test.skip()`

**Diagnosis:**
```bash
# List all test names in a file
npx playwright test e2e/domains/automobile.spec.ts --list
```

**Fix:** Adjust grep pattern or remove it entirely.

---

### Pattern 3: Connection refused / timeout on page.goto

**Symptom:**
```
Error: net::ERR_CONNECTION_REFUSED at http://localhost:4205
```

**Diagnosis:**
```bash
# Check if dev server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:4205/automobiles/discover
# 200 = running, 000 = not running
```

**Fix:**
```bash
# Start dev server (in separate terminal)
cd ~/projects/generic-prime/frontend
npm run dev:server
```

---

### Pattern 4: Port already in use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use 127.0.0.1:4205
```

**Diagnosis:**
```bash
lsof -i :4205
# or
ss -tlnp | grep 4205
```

**Fix:**
```bash
# Kill the process using the port
pkill -f "ng serve"
# or for report server on 9323
pkill -f "playwright show-report"
```

---

### Pattern 5: API calls succeed but UI assertions fail

**Symptom:** Test logs show successful API calls (200 status), but element assertions timeout.

**Example:**
```
[API] GET http://generic-prime.minilab/api/specs/v1/vehicles/details -> 200
...
Error: locator('[data-testid="results-table"]') not found
```

**Diagnosis:** The data loaded, but you're looking for the wrong element.

1. The app has TWO table components:
   - `BasicResultsTable` (used on main page) → `basic-results-table`
   - `ResultsTable` (used in pop-outs) → `results-table`

2. Check which component renders on your target page:
```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4205/automobiles/discover');
  await page.waitForLoadState('networkidle');

  const hasBasic = await page.locator('[data-testid=\"basic-results-table\"]').count();
  const hasResults = await page.locator('[data-testid=\"results-table\"]').count();
  console.log('basic-results-table:', hasBasic > 0 ? 'FOUND' : 'not found');
  console.log('results-table:', hasResults > 0 ? 'FOUND' : 'not found');
  await browser.close();
})();
"
```

**Fix:** Use `basic-results-table` for main page, `results-table` for pop-outs.

---

### Pattern 6: Wrong route (404 or blank page)

**Symptom:** Page loads but shows 404 or Angular routing error.

**Diagnosis:**
```bash
# Check what routes exist
curl -s http://localhost:4205/automobiles/discover | head -5
# Should return HTML with <app-root>

curl -s http://localhost:4205/discover/automobile | head -5
# Wrong route - may return 404 or redirect
```

**Common mistakes:**
| Wrong | Correct |
|-------|---------|
| `/discover/automobile` | `/automobiles/discover` |
| `/automobile/discover` | `/automobiles/discover` |
| `/discover` | `/automobiles/discover` |

**Fix:** Always use `/automobiles/discover`

---

## Self-Repair Workflow

When a test fails, follow this sequence:

### Step 1: Read the error message
- What locator failed?
- What was expected vs actual?

### Step 2: Verify the selector exists
Run the DOM inspection script above to list all `data-testid` values.

### Step 3: Check `.clinerules`
The `.clinerules` file contains the authoritative list of correct:
- Routes
- data-testid selectors
- Test patterns

### Step 4: Fix and re-run
After identifying the issue:
1. Update the test file with correct selectors
2. Re-run: `npx playwright test path/to/test.ts --reporter=list`
3. Verify all tests pass

---

## Reference: Correct Selectors

From `.clinerules`:

| Component | Test ID | When to Use |
|-----------|---------|-------------|
| Query Panel | `query-panel` | Always |
| Query Control | `query-control-panel` | Always |
| **Basic Results Table** | `basic-results-table` | **Main discover page** |
| **Basic Results Table Panel** | `basic-results-table-panel` | **Main discover page** |
| Results Table | `results-table` | Pop-out windows only |
| Results Table Panel | `results-table-panel` | Pop-out windows only |
| Picker Panel | `picker-panel` | Always |
| Picker Table | `picker-table` | Always |
| Statistics Panel | `statistics-panel` | Always |
| Charts | `chart-{id}` | e.g., `chart-manufacturer-distribution` |

---

## Reference: Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/domains/automobile.spec.ts

# Run with visible output
npx playwright test e2e/domains/automobile.spec.ts --reporter=list

# Run specific test by name
npx playwright test --grep "Initial page load"

# List tests without running
npx playwright test --list

# View test report
npm run test:report
# or
npx playwright show-report --host 0.0.0.0
```

---

## Lessons Learned (Session 67)

1. **Always verify selectors against actual DOM** before writing tests
2. **The main page uses `BasicResultsTable`**, not `ResultsTable`
3. **Read `.clinerules` first** - it has project-specific guidance
4. **When tests fail, inspect the DOM** rather than guessing at fixes

---

**Last Updated**: 2025-12-30
