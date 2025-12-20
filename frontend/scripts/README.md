# E2E Testing & Development Scripts

This directory contains helper scripts for managing development and testing workflows.

## Quick Start Workflows

### Workflow 1: Development with Live Test Results (Recommended)

Best for: Developing features while monitoring test results in real-time

```bash
# Terminal 1: Start dev server
npm run dev:server

# Terminal 2: Run tests once, then watch results
npm run test:report

# Terminal 3: Run tests
npm run test:e2e

# Then access:
# - Dev app: http://192.168.0.244:4205
# - Test results: http://192.168.0.244:9323
```

**Workflow**:
1. Edit code in VS Code
2. Watch dev app update at port 4205
3. Run tests when needed with `npm run test:e2e`
4. View test results immediately at port 9323
5. If tests fail but dev app looks OK, you've found a regression!

---

### Workflow 2: Development with Interactive Test Mode

Best for: Debugging specific tests or stepping through test execution

```bash
# Terminal 1: Start dev server
npm run dev:server

# Terminal 2: Start Playwright UI mode
npm run test:watch

# Then access:
# - Dev app: http://192.168.0.244:4205
# - Playwright UI: http://localhost:3000 (Playwright will display URL)
```

**Workflow**:
1. Edit code in VS Code
2. Watch dev app update at port 4205
3. Playwright UI automatically reruns tests when code changes
4. Step through individual tests, view logs, retry failures
5. See live execution with detailed debugging info

---

### Workflow 3: Run Tests Only (No Development)

Best for: CI/CD pipelines or pure test validation

```bash
# Terminal 1: Start dev server (required for tests)
npm run dev:server

# Terminal 2: Run all tests once
npm run test:e2e

# View results
npm run test:report
```

---

## npm Scripts Reference

All scripts run from the `frontend/` directory:

| Script | Purpose | Port | Notes |
|--------|---------|------|-------|
| `npm run dev:server` | Start Angular dev server | 4205 | Required for all E2E tests |
| `npm run test:e2e` | Run all tests once | - | Tests run against port 4205 |
| `npm run test:watch` | Run tests in UI mode | 3000 | Auto-reruns on code changes |
| `npm run test:report` | View test results | 9323 | Shows latest results |

---

## Advanced: Running Tests from Containers

### From Dev Container

```bash
# Start dev container (if not running)
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev

# Run dev server inside container
podman exec generic-prime-frontend-dev npm run dev:server

# In another terminal, run tests inside same container
podman exec -it generic-prime-frontend-dev npm run test:e2e
```

### From E2E Container

```bash
# Run tests in E2E container (dev server must be running on host port 4205)
podman exec generic-prime-e2e bash -c "cd /app/frontend && npm run test:e2e"

# View results from host
npm run test:report
```

---

## Troubleshooting

### "Cannot find module" errors

```bash
cd frontend
npm install
```

### Tests can't connect to dev server

Verify dev server is running:
```bash
curl http://localhost:4205
```

Should return HTML content, not a connection error.

### Tests pass locally but fail in CI

Check:
1. Timeout settings in `playwright.config.ts`
2. Network connectivity to backend API (http://generic-prime.minilab/api/)
3. Browser cache - try `npm run test:e2e -- --no-cache`

### Port 4205 already in use

```bash
# Find and kill process
lsof -i :4205
kill -9 <PID>
```

### Port 9323 already in use

```bash
# Find and kill process
lsof -i :9323
kill -9 <PID>
```

---

## File Structure

```
frontend/
├── scripts/
│   ├── README.md (this file)
│   ├── dev.sh (start dev server)
│   ├── test-watch.sh (Playwright UI mode)
│   └── test-report.sh (view test results)
├── e2e/
│   ├── app.spec.ts (test definitions)
│   └── ... (other test files)
├── playwright.config.ts (test configuration)
└── package.json (npm scripts)
```

---

## Configuration Reference

### playwright.config.ts

Key settings:
- **PORT**: 4205 (must match dev server)
- **timeout**: 10000ms (increased for pop-out tests)
- **baseURL**: http://localhost:4205
- **reporter**: HTML report in `playwright-report/`

### package.json scripts

Located in `frontend/package.json`:

```json
{
  "scripts": {
    "dev:server": "ng serve --host 0.0.0.0 --port 4205",
    "test:e2e": "npx playwright test",
    "test:watch": "npx playwright test --ui --host 0.0.0.0",
    "test:report": "npx playwright show-report --host 0.0.0.0"
  }
}
```

---

## Environment Variables

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `CI` | CI mode (skip retries, single worker) | undefined | `CI=true` |
| `PORT` | Dev server port | 4205 | `PORT=4300` |

---

Last Updated: 2025-12-20
