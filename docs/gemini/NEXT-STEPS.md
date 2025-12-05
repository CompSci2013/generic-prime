# Next Steps

**Purpose**: Actionable items for the current session.
**Update Policy**: Update this file AND [PROJECT-STATUS.md](PROJECT-STATUS.md) before ending each session.

---

## Session Start Checklist

1. Read [ORIENTATION.md](ORIENTATION.md) (~3 min)
2. Read [PROJECT-STATUS.md](PROJECT-STATUS.md) for current state and approach
3. Review this file for immediate actions
4. Discuss with developer before starting work

---

## Current Priority: IMPLEMENT E2E TEST AUTOMATION (Option 2 Environment-Based)

**Status**: ✅ INFRASTRUCTURE COMPLETE - Awaiting Component HTML Updates

### Governing Tactic (from PROJECT-STATUS.md)

> **E2E Test Automation is now ready for implementation. Use Option 2 (Environment-Based) approach to add test-ids without polluting production code.**
>
> 1. **Phase 1: E2E Infrastructure** ✅ COMPLETE
>    - Docker configuration ✓
>    - Playwright setup ✓
>    - Test suite (13 tests) ✓
>    - All documentation ✓
>
> 2. **Phase 2: Add Component Test-IDs (Option 2 Approach)** ⏳ NEXT
>    - Add `includeTestIds` flag to environment.ts and environment.prod.ts
>    - Update 4 component templates to bind test-ids conditionally
>    - Run tests and verify all 13 tests pass
>
> 3. **Phase 3: Expand Test Coverage** ⏳ AFTER PHASE 2
>    - Add Phase 2.3-2.7 tests (Body Class, Year, Search, Size, Clear All)
>    - Add pop-out window tests
>    - Integrate into CI/CD

---

## Completed This Session (2025-12-05 Evening - E2E Test Automation Setup)

### Session 2025-12-05 Achievements ✅

1. **E2E Test Automation Framework IMPLEMENTED - COMPLETE ✓**
   - **Port Configuration**: Fixed playwright.config.ts (4200 → 4205)
   - **Docker Setup**: Updated Dockerfile.e2e with dev server startup + test execution
   - **Playwright Upgrade**: v1.44.0 → v1.57.0 (matching @playwright/test package)
   - **Dependencies**: Added @playwright/test:^1.57.0 and playwright:^1.57.0
   - **Test Suite**: Expanded from 1 test to 13 comprehensive test cases
     - Phase 1: Initial state & panel controls (3 tests)
     - Phase 2.1: Manufacturer filter dialogs (6 test groups, 19 cases)
     - Phase 2.2: Model filter dialogs (2 test groups)
     - Phase 3+: Results table & statistics (2 tests)

2. **Critical Issues Identified & FIXED ✓**
   - **Issue 1**: Port mismatch (4200 vs 4205) - FIXED
   - **Issue 2**: Docker web server config (unconditional http-server) - Made conditional
   - **Issue 3**: Dockerfile incomplete (no server/test execution) - Added full startup
   - **Issue 4**: Test coverage too small (1 test) - Expanded to 13 tests

3. **Infrastructure Validation ✓**
   - **Docker Build**: ✅ Successful with playwright:v1.57.0
   - **Dev Server**: ✅ Starts on 0.0.0.0:4205 correctly
   - **Tests**: ✅ 13 tests discovered and executing
   - **Current Status**: Tests fail due to missing data-testid (EXPECTED - next step)

4. **Documentation Created - COMPREHENSIVE ✓**
   - **E2E-TEST-SETUP.md** (201 lines) - User guide for running tests
   - **E2E-TEST-IDS-REQUIRED.md** (265 lines) - Component modification spec
   - **E2E-AUTOMATION-ANALYSIS.md** (401 lines) - Technical deep-dive
   - **QUICKSTART-E2E-TESTS.md** (125 lines) - 5-minute quick reference
   - **SUMMARY-E2E-FIXES.txt** - Implementation checklist
   - **E2E-ISSUES-VISUAL.txt** - Visual before/after diagrams

5. **Test-ID Strategy Decided ✓**
   - **Approach**: Option 2 (Environment-Based) to avoid production pollution
   - **Design**: `includeTestIds` flag in environment configs
   - **Implementation**: Deferred to next session as requested by user

---

## Immediate Actions (Next Session - E2E TEST-ID IMPLEMENTATION)

### PRIORITY 1: IMPLEMENT OPTION 2 (ENVIRONMENT-BASED TEST-IDS) ⏳ Next Session

**Objective**: Add test-id attributes to components without polluting production code

**Timeline**: Estimated 1-2 hours

**Steps**:

1. **Update Environment Configs** (5 min)
   - Edit `frontend/src/environments/environment.ts`:
     ```typescript
     export const environment = {
       production: false,
       includeTestIds: true,  // ← Add this
     };
     ```
   - Edit `frontend/src/environments/environment.prod.ts`:
     ```typescript
     export const environment = {
       production: true,
       includeTestIds: false,  // ← Add this
     };
     ```

2. **Update Component Templates** (30-45 min)
   - `query-control.component.html` (3 test-ids):
     ```html
     <p-panel [attr.data-testid]="environment.includeTestIds ? 'query-control-panel' : null">
       <p-dropdown [attr.data-testid]="environment.includeTestIds ? 'filter-field-dropdown' : null"></p-dropdown>
       <!-- Chip close buttons: [attr.data-testid]="environment.includeTestIds ? ('chip-close-' + filter.field) : null" -->
     </p-panel>
     ```
   - `picker.component.html` (1 test-id):
     ```html
     <p-panel [attr.data-testid]="environment.includeTestIds ? 'picker-panel' : null">
     ```
   - `results-table.component.html` (2 test-ids):
     ```html
     <p-panel [attr.data-testid]="environment.includeTestIds ? 'results-table-panel' : null">
       <p-table [attr.data-testid]="environment.includeTestIds ? 'results-table' : null"></p-table>
     </p-panel>
     ```
   - `statistics-panel.component.html` (2+ test-ids):
     ```html
     <p-panel [attr.data-testid]="environment.includeTestIds ? 'statistics-panel' : null">
       <p-chart *ngFor="let config of chartConfigs"
         [attr.data-testid]="environment.includeTestIds ? ('chart-' + config.id) : null"></p-chart>
     </p-panel>
     ```

3. **Verify Production Build Strips Test-IDs** (10 min)
   ```bash
   ng build --configuration production
   # Search dist/frontend/main.*.js for "data-testid" - should find NONE
   ```

4. **Run Tests** (30 min)
   ```bash
   podman build --no-cache -f frontend/Dockerfile.e2e -t generic-prime-e2e .
   podman run --rm --ipc=host generic-prime-e2e
   # Verify all 13 tests PASS ✓
   ```

5. **Commit Changes** (5 min)
   ```bash
   git add frontend/src/environments/
   git add frontend/src/app/features/discover/panels/*/
   git commit -m "feat: Add environment-based test-ids for E2E testing"
   ```

**Documentation**:
- See [E2E-TEST-IDS-REQUIRED.md](E2E-TEST-IDS-REQUIRED.md) for detailed implementation guide
- See [E2E-TEST-SETUP.md](E2E-TEST-SETUP.md) for full setup instructions

### PRIORITY 2: EXPAND TEST COVERAGE (After Priority 1) ⏳ Later in Next Session

After all 13 tests pass, expand with:
- Phase 2.3-2.7 tests (Body Class, Year, Search, Size, Clear All)
- Pop-out window tests
- CI/CD integration
   - Minimum Year Tests
   - Maximum Year Tests
   - Year Range Only
   - Remove Year Range Filter
   - Invalid Range Tests
4. **Phase 2.5: Search/Text Filter** (~3 tests pending)
   - Basic Search Workflow
   - Search Combined with Other Filters
   - Clear Search
5. **Phase 2.6: Page Size Filter** (~3 tests pending)
   - Change Page Size
   - Page Size Options
   - Size with Query Filters
6. **Phase 2.7: Clear All Button** (~1 test pending)
   - Clear All Filters with multiple active

**Testing Workflow**:
- Execute each subsection sequentially
- Mark tests as `[X]` on success or document failures
- One test step at a time, pause for user response
- Document any new findings or regressions

### PRIORITY 2: OPTIONAL - Minor Issues to Fix (After Phase 2)

**Low Priority Fixes** (non-blocking):
1. Focus management: Dialog opens via spacebar, focus should go to first input (currently goes to search)
2. Tab order inefficiency: Shift+Tab works immediately to Apply, Tab requires ~50 presses

---

## Current Discover Page State

**FULL LAYOUT**: All 4 panels with drag-drop, collapse, and pop-out

```
discover.component.html:
├── Header (domain label) - White text on dark background
├── cdkDropList (panels-container)
│   ├── Query Control panel (dark themed) - draggable, collapsible, pop-out
│   ├── Manufacturer-Model Picker panel (dark themed) - draggable, collapsible, pop-out
│   ├── Statistics panel (dark themed) - draggable, collapsible, pop-out
│   │   └── 2×2 Chart Grid (dark Plotly charts with white text)
│   └── Results Table panel (dark themed, compact rows) - draggable, collapsible, pop-out
```

---

## Key Files for Current Work

| File | Purpose |
|------|---------|
| `frontend/src/framework/components/query-control/query-control.component.ts` | Filter UI - needs debug logging |
| `frontend/src/framework/services/resource-management.service.ts` | Data orchestration - verify watchUrlChanges() |
| `frontend/src/domain-config/automobile/adapters/automobile-url-mapper.ts` | Filter mapper - verify conversion logic |
| `frontend/src/app/features/discover/discover.component.ts` | Orchestrator - async/await fixed here |
| `frontend/src/framework/services/url-state.service.ts` | URL state - verify BehaviorSubject emits |

---

## Quick Commands

```bash
# Frontend dev server (already running on port 4205)
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Run in container bash
podman exec -it generic-prime-frontend-dev bash

# Check backend pods
kubectl get pods -n generic-prime

# Backend logs
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50
```

---

## Session End Checklist

Before ending session:

1. [ ] Archive current PROJECT-STATUS.md to STATUS-HISTORY.md (append, don't overwrite)
2. [ ] Update PROJECT-STATUS.md with:
   - New version number (increment)
   - New timestamp
   - Findings and decisions
3. [ ] Update this NEXT-STEPS.md with next actions
4. [ ] Commit changes: `git add -A && git commit -m "docs: session summary"`
5. [ ] Push if appropriate

---

**Last Updated**: 2025-12-05T XX:XX:XXZ
**Status**: ⏳ Phase 2.2 in progress - 2 of 4 tests passed, ready to resume Test 2.2.3
