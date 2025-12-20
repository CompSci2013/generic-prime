# Development Quick Start

## TL;DR - Just Do This

```bash
cd ~/projects/generic-prime/frontend
npm run dev:all
```

Then open three browser windows:
1. **Dev App**: http://192.168.0.244:4205
2. **Tests**: http://localhost:3000
3. **Results**: http://192.168.0.244:9323

Edit code → See changes → Tests auto-run → Done! 🚀

---

## What `npm run dev:all` Does

Starts **three services in one terminal** with colored output:

```
[DEV]    ✓ Compiled successfully (port 4205)
[TEST]   ✓ Tests passed: 33/33
[REPORT] ✓ Report server running (port 9323)
```

- **Dev App** (port 4205): Your application
- **Playwright UI** (port 3000): Auto-runs tests, shows execution
- **Report Server** (port 9323): HTML test results

Stop everything: Press **Ctrl+C**

---

## All npm Commands

| Command | What it does | One terminal? |
|---------|-------------|---|
| `npm run dev:all` | All three services together | ✅ YES |
| `npm run dev:server` | Just the dev server | Manual 1 |
| `npm run test:e2e` | Run tests once | No |
| `npm run test:watch` | Interactive test mode | Manual 1 |
| `npm run test:report` | Just the report server | Manual 1 |

---

## Development Workflow

### I'm actively coding:
```bash
npm run dev:all
# Edit code → see changes compile → tests auto-run → see results
```

### I'm debugging a single test:
```bash
# Terminal 1:
npm run dev:server

# Terminal 2:
npm run test:watch
# Use Playwright UI to step through test
```

### I just want to validate tests:
```bash
npm run test:e2e
# Run all tests once and exit
```

### I want to see test results in a browser:
```bash
npm run test:report
# Open http://192.168.0.244:9323
```

---

## Ports Used

| Port | Service | Access |
|------|---------|--------|
| 4205 | Angular Dev Server | http://192.168.0.244:4205 |
| 3000 | Playwright UI | http://localhost:3000 |
| 9323 | Test Report Server | http://192.168.0.244:9323 |

---

## Troubleshooting

**"Cannot connect to port 4205"**
- Dev server not running
- Run `npm run dev:server` in a terminal

**"Cannot connect to port 9323"**
- Report server not running
- Run `npm run test:report` in a terminal

**"Tests won't start"**
- Dev server might not be ready
- Wait 5-10 seconds after starting dev server
- Tests need the app to be available on port 4205

**"Port already in use"**
```bash
# Kill process on port 4205
lsof -i :4205
kill -9 <PID>

# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Kill process on port 9323
lsof -i :9323
kill -9 <PID>
```

---

## System Info

- **Node**: v20.19.6 (via NVM at `~/.nvm/`)
- **npm**: 10.8.2
- **Angular**: 14.2.13
- **Playwright**: 1.57.0

---

## See Also

- [ORIENTATION.md](../docs/claude/ORIENTATION.md) - Full architecture guide
- [scripts/README.md](scripts/README.md) - Advanced workflows
- [playwright.config.ts](playwright.config.ts) - Test configuration
- [e2e/app.spec.ts](e2e/app.spec.ts) - All test definitions

---

Last Updated: 2025-12-20
