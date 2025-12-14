# Next Steps

**Current Session**: Source Code Documentation & Pop-Out Manual Testing

---

## Immediate Action: Document Source Code Fully

**Priority**: CRITICAL (Blocks all other work)

**What to Do**:

1. **Framework Services** (highest priority - shared across domains)
   - Add comprehensive inline documentation to all services in `framework/services/`
   - Focus on: UrlStateService, ResourceManagementService, PopOutContextService, PickerConfigRegistry
   - Document: purpose, public methods, usage examples, state flow

2. **Component Documentation**
   - Add detailed comments to all components in `framework/components/`
   - Focus on: DiscoverComponent, PanelPopoutComponent, BasePicker, ResultsTable, StatisticsPanel, QueryControl
   - Document: responsibility, data flow, event handling, pop-out behavior

3. **Domain Configuration**
   - Document domain-config pattern with Automobile as example
   - Explain: models, adapters, configs, chart-sources
   - Create inline comments in `domain-config/automobile/`

4. **Key Architectural Files**
   - Add architectural comments to: app.module.ts, app-routing.module.ts
   - Document injection patterns, provider setup, multi-domain support

**Expected Output**:
- All public methods have JSDoc comments
- Complex logic has inline explanations
- Configuration examples show expected data structures
- Architectural decisions are documented at file level

---

## After Documentation: Perform Manual Pop-Out Testing

**Priority**: HIGH (Validates architecture)

**Test Scenarios** (see [POPOUT-ARCHITECTURE.md](../../docs/POPOUT-ARCHITECTURE.md) for detailed steps):
1. Open pop-out window - verify rendering and routing
2. State sync main → pop-out - verify real-time updates
3. State sync pop-out → main - verify URL updates and sync
4. Multiple pop-outs - verify independent operation
5. Filter operations - verify filter state propagation
6. Pop-out window close - verify cleanup
7. Page refresh - verify auto-close of pop-outs
8. Multi-monitor scenario - verify smooth operation
9. Network latency - verify eventual consistency
10. Console validation - verify message flow and channel communication

**Testing Approach**:
- Follow the 10 test scenarios in [POPOUT-ARCHITECTURE.md](../../docs/POPOUT-ARCHITECTURE.md)
- Document any issues found
- Create bug reports for any failures
- Note any UI improvements needed

---

## Priority Order (Updated)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **1** | **Document source code fully** | **CRITICAL** | **TO START** |
| **2** | **Manual testing: pop-outs** | **HIGH** | Pending |
| 3 | Clean up uncommitted work | High | Pending |
| 4 | Update E2E tests for `/automobiles/discover` | Medium | Pending |
| 5 | Complete automobile domain testing | Medium | Pending |
| 6 | Fix Bug #13 (dropdown keyboard nav) | Medium | Pending |
| 7 | Fix Bug #7 (multiselect visual state) | Low | Pending |
| 8 | Plan agriculture domain implementation | Low | Pending |

---

## Known PrimeNG Bug (Deferred): Fix Dropdown Keyboard Navigation (Bug #13)

**Priority**: Medium (User Experience - Filter Usability)

**Bug Details**:
- Component: `p-dropdown` in Query Control panel (Manufacturer filter)
- Issue: Keyboard navigation broken with `[filter]="true"` attribute
- Expected: Arrow keys highlight options, Enter/Space selects
- Actual: Keyboard keys do nothing, mouse click is only workaround

**What to Do**:

1. **Investigate Root Cause**
   - Located in: `frontend/src/domain-config/automobile/configs/filter-definitions.ts`
   - PrimeNG version: 14.2.3
   - Check if issue is PrimeNG bug or configuration conflict
   - Test with filter disabled to isolate the cause

2. **Attempt Fixes** (in order of complexity):
   - Verify `[showToggleAll]="true"` doesn't interfere with keyboard handling
   - Check if `[editable]="true"` and `[filter]="true"` together cause issue
   - Inspect DOM for missing `tabindex` or accessibility attributes
   - Test with `onKeyDown` event handler as workaround if needed

3. **Verify PrimeNG Version**
   - Current: 14.2.3
   - Check if newer version (14.3+) or patch fixes this
   - Document version constraint if upgrade needed

4. **Testing**
   - Verify arrow keys highlight options in dropdown
   - Verify Enter key selects highlighted option
   - Verify Space key selects highlighted option
   - Ensure mouse interaction still works
   - Test with other filters (Body Class, etc.)

---

## Deferred Work: Live Report Updates (Architectural Issue)

**Status**: Investigation Complete - Deferred (Low Priority)

**Why Deferred**:
- Root cause: Angular dev-server cannot inject cache-control headers for static assets
- Client-side cache-busting (iframe + timestamp) insufficient due to browser caching layers
- **Solution requires architectural change**: Separate Node.js/Express server
- Not worth time investment when tests generate fresh data on each run

**Future Options** (if prioritized):
- **Option A** (Recommended): Lightweight Node.js/Express server on port 4206 serving `playwright-report/`
- **Option B** (Complex): WebSocket-based report watcher with real-time updates
- **Option C** (Production Grade): Third-party service integration (Currents.dev, Testomat.io)

**Code Status**:
- `proxy.conf.js` implemented and left in place for reference
- `ReportComponent` updated with iframe + timestamp cache-busting
- Both approaches documented in `PROJECT-STATUS.md` Session 12

See `docs/claude/PROJECT-STATUS.md` for complete technical analysis and architectural solutions.

---

## Completed Work

**Session 12: Live Report Updates Research**
- ✅ Deep research into browser caching (20+ sources)
- ✅ Analyzed Playwright report architecture
- ✅ Investigated Angular dev-server proxy limitations
- ✅ Implemented proxy.conf.js with cache headers + ETag rotation
- ✅ Updated ReportComponent with iframe cache-busting
- ✅ Documented root causes and architectural solutions
- ✅ Documented why problem persists despite attempted fixes

**Session 11: Live Report Updates Investigation**
- ✅ Investigated Playwright report caching issues
- ✅ Analyzed root cause: HTTP cache preventing fresh loads
- ✅ Identified proper solution: proxy configuration with cache-control headers
- ✅ Discovered implementation error: JSON cannot contain functions
- ✅ Reverted invalid changes to maintain stable codebase

**Session 9: Kubernetes Infrastructure Testing**
- ✅ Tested backend service scaling to zero replicas
- ✅ Verified service recovery and auto-restart
- ✅ Identified missing error handling in frontend
- ✅ Documented all findings and recovery procedures

**Session 8: E2E Test Suite Complete**
- ✅ Refactored 10 failing tests using URL-first approach
- ✅ Achieved 100% pass rate (33/33 tests)
- ✅ Improved execution time: 39.5 seconds (down from 51.6s with failures)
- ✅ Established URL-first testing pattern for stable test automation

---

## Optional: Add Backend Error Handling (Future Session)

**Priority**: Medium (User Experience Gap)

**Context**: Session 9 identified that frontend lacks error handling when backend service is unavailable. Users see blank/frozen UI instead of helpful error messages.

**What to Do** (when prioritized):

1. Create Error Boundary Component
   - Location: `frontend/src/app/features/error/`
   - Global error handler for HTTP failures
   - Display user-friendly messages for API errors

2. Update HTTP Interceptor
   - Catch 5xx errors (backend down)
   - Catch network timeouts
   - Implement retry logic with exponential backoff

3. Add Loading States
   - Show spinner during API calls
   - Display timeout notifications after 10+ seconds
   - Provide manual retry button

---

## Optional: Expand E2E Coverage to Phases 6-9

**Priority**: Low (Nice-to-have, not blocking)

**What to Do** (if pursuing):

1. **Phase 6: Panel Pop-Out Windows**
   - Tests pop-out/undock panel behavior
   - Challenge: Playwright multi-window handling requires special setup
   - Recommendation: Manual testing for now (complex automation overhead)

2. **Phase 7: Edge Cases & Browser History**
   - Tests browser back/forward button behavior
   - Tests history state management with filters
   - Requires: Specialized Playwright history navigation patterns

3. **Phase 8: Keyboard Navigation & Accessibility**
   - Tests keyboard-only navigation paths
   - Tests focus management and ARIA attributes
   - Requires: Playwright accessibility assertions

4. **Phase 9: Performance & Data Handling**
   - Tests behavior with large result sets
   - Tests pagination with various page sizes
   - Tests filter combination performance

**Recommendation**:
- Phases 1-5 provide solid core functionality coverage
- Phases 6-9 have diminishing returns for automation effort
- Continue with manual spot-checks for these areas per MANUAL-TEST-PLAN.md
- Revisit if specific bugs emerge in these areas

---

## Current E2E Testing Status

**Pass Rate**: 33/33 (100%) ✅
- Phase 1: 3/3 tests passing ✓
- Phase 2.1: 4/4 tests passing ✓
- Phase 2.2: 3/3 tests passing ✓
- Phase 2.3: 3/3 tests passing ✓
- Phase 2.4: 4/4 tests passing ✓
- Phase 2.5: 3/3 tests passing ✓
- Phase 2.6: 2/2 tests passing ✓
- Phase 2.7: 1/1 test passing ✓
- Phase 3: 3/3 tests passing ✓
- Phase 4: 3/3 tests passing ✓
- Phase 5: 3/3 tests passing ✓

**Test Coverage**: ~40% of MANUAL-TEST-PLAN.md test cases automated

---

**Last Updated**: 2025-12-07T09:30:00Z
