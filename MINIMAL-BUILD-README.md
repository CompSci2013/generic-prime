# Minimal Automobiles-Only Build

**Branch**: `bug-fix/minimal-automobiles-popout`

## Overview

This branch strips the codebase down to the absolute bare minimum needed to support the automobile discovery page with pop-out window support. All other domains, testing infrastructure, and documentation generation have been removed.

## What This Branch Contains

### ✅ KEPT - Core Features
- **Automobile Discovery** (`/automobiles/discover`)
  - Query Control panel
  - Statistics panel
  - Results Table panel
  - Pop-out window variants

- **Core Architecture**
  - BroadcastChannel-based state synchronization
  - ResourceManagementService with zone-aware observable emissions
  - URL-first state management (UrlStateService)
  - Pop-out context service for multi-window communication

- **Core Dependencies**
  - Angular 14
  - PrimeNG 14
  - RxJS 7
  - Plotly.js (for charts)
  - Cytoscape (kept for visualization, can be removed if not used)

## What Was Removed

### ❌ REMOVED - Entire Domains
- **Physics Domain**
  - All courses and learning materials
  - Concept graphs and knowledge graphs
  - Syllabus components

- **Agriculture Domain**
  - All discovery and landing pages

- **Chemistry Domain**
  - All components and pages

- **Mathematics Domain**
  - All components and pages

- **Home/Landing Page**
  - Domain selector
  - Multi-domain navigation

- **Developer Tools**
  - Dependency graph visualization component

### ❌ REMOVED - Testing Infrastructure
- E2E tests (e2e/ folder)
  - agriculture.spec.ts
  - app.spec.ts
  - chemistry.spec.ts
  - math.spec.ts
  - physics.spec.ts

- Test Configuration
  - playwright.config.ts
  - karma.conf.js
  - test-results.json
  - playwright-report/ folder
  - test-results/ folder

- Testing Dependencies
  - @playwright/test
  - playwright
  - @types/jasmine
  - jasmine-core
  - karma
  - karma-chrome-launcher
  - karma-coverage
  - karma-jasmine
  - karma-jasmine-html-reporter

### ❌ REMOVED - Documentation Generation
- Compodoc setup
  - @compodoc/compodoc
  - build:doc script
  - compodoc script
  - documents/ folder (can be regenerated if needed)

- Helper Tools
  - concurrently (used for dev:all, test:e2e, etc.)
  - http-server (used for compodoc serving)

### ❌ REMOVED - NPM Scripts
- `test` - ng test
- `dev:all` - concurrent dev + playwright + reporting
- `test:e2e` - playwright test
- `test:watch` - playwright test --ui
- `test:report` - playwright show-report
- `build:doc` - compodoc generation
- `compodoc` - documentation server
- `dev` - concurrent ng serve + compodoc

## New Simplified NPM Scripts

```bash
npm start              # Start dev server on port 4205
npm run dev:server    # Start dev server (explicit host/port)
npm run build         # Build for production
npm run watch         # Build with watch mode
npm run lint          # Run ESLint on src/
npm run lint:fix      # Run ESLint with auto-fix
```

## Routing

The application now supports only these routes:

```
/ → AutomobileComponent
/automobiles → AutomobileComponent
/automobiles/discover → DiscoverComponent (main discovery interface)
/panel/:gridId/:panelId/:type → PanelPopoutComponent (pop-out windows)
```

## Components Declared

Reduced from 15+ components to 4 core ones in AppModule:

1. **AppComponent** - Root component
2. **AutomobileComponent** - Domain landing page
3. **DiscoverComponent** - Main discovery interface with 4 panels
4. **PanelPopoutComponent** - Pop-out window handler

## Bundle Size Improvement

- **Before**: 6.84 MB (including all domains + testing)
- **After**: 5.66 MB (automobiles only)
- **Reduction**: ~18% smaller bundle

## Why This Build Exists

This minimal build serves a specific purpose:

### Focus Areas
✅ **Debug pop-out state synchronization** without distraction
✅ **Perfect state management** between main window and pop-outs
✅ **Identify zone boundary issues** more easily
✅ **Test BroadcastChannel** communication in isolation
✅ **Measure performance** without unnecessary code

### Benefits
✅ Faster builds (fewer components to compile)
✅ Smaller bundle size (easier to debug/trace)
✅ Clearer code paths (no domain switching logic)
✅ Easier to reproduce issues (consistent setup)
✅ Focused testing (automotive discovery only)

## How to Use This Branch

### 1. Check Out the Branch
```bash
git checkout bug-fix/minimal-automobiles-popout
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Development
```bash
npm run dev:server
# Or for explicit host:
npm start
```

### 4. Access the Application
- Main window: `http://localhost:4205`
- Opens to: `/automobiles` (AutomobileComponent)
- Discovery: Navigate to automobile discovery or use `/automobiles/discover`

### 5. Test Pop-Outs
1. On the discovery page, click "Open Pop-Out" for any panel
2. In main window, make a filter selection
3. Verify pop-out window updates immediately
4. Check browser console for zone-related messages
5. Monitor BroadcastChannel messages for state sync

## Development Workflow

### Working on Pop-Out State Management

1. **Build & Run**
   ```bash
   npm run build        # Verify clean build
   npm run dev:server   # Start development
   ```

2. **Test State Sync**
   - Open main discovery page
   - Click "Open Pop-Out" on any panel
   - Change filters/selections
   - Verify pop-out updates match main window

3. **Debug with Console**
   - Check for BroadcastChannel messages
   - Look for zone-related warnings
   - Verify `detectChanges()` is being called
   - Monitor ResourceManagementService emissions

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "fix: description"
   git push origin bug-fix/minimal-automobiles-popout
   ```

## If You Need Other Domains Back

**This branch is for focused debugging only.** If you need to restore other domains, work on the `main` branch instead. The full multi-domain application is preserved there.

To restore other domains:
```bash
git checkout main    # Switch back to full version
```

## Dependencies Overview

### Production Dependencies (Kept)
- @angular/* (14.2.0)
- @angular/cdk (14.2.7)
- primeng (14.2.3)
- primeicons (6.0.1)
- rxjs (7.5.0)
- plotly.js-dist-min (3.3.0)
- cytoscape (3.33.1)
- cytoscape-dagre (2.5.0)
- tslib (2.3.0)
- zone.js (0.11.4)

### Development Dependencies (Kept)
- @angular-devkit/build-angular (14.2.13)
- @angular/cli (14.2.13)
- @angular/compiler-cli (14.2.0)
- @types/plotly.js (3.0.8)
- @typescript-eslint/* (5.62.0)
- eslint (8.57.0)
- typescript (4.7.2)

### Development Dependencies (Removed)
- @playwright/test
- playwright
- @compodoc/compodoc
- concurrently
- http-server
- All Karma/Jasmine testing tools

## What's Next

After focusing on and perfecting the pop-out state management:

1. **Merge successful changes back to main**
   - Cherry-pick zone boundary fix commits
   - Keep minimal build on separate branch for future debugging

2. **Run full test suite on main**
   - E2E tests now restored
   - Verify all domains work with improved state management

3. **Deploy improved version**
   - Full multi-domain application with perfected state sync
   - Pop-outs work reliably across all domains

## Notes

- **All original code preserved on `main` branch**
- **This branch is development-only for focus and debugging**
- **Does not remove any core framework services or utilities**
- **Keeps all state management infrastructure intact**
- **Zone-aware observable emissions already implemented** (Session 40 fix)

---

**Created**: 2025-12-21
**Purpose**: Focus on pop-out state management without distraction
**Status**: Ready for development

