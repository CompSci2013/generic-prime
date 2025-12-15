# Next Steps

**Current Session**: Physics Knowledge Graphs Complete - Expanding Knowledge Graph System

---

## Immediate Action: Create Knowledge Graphs for Other Physics Topics

**Priority**: HIGH (Extends Physics domain educational value)

**What to Do**:

Implement knowledge graphs for the remaining Physics course tiles following the Classical Mechanics pattern:

1. **Electromagnetism Knowledge Graph**
   - Create: `electromagnetism-graph.ts` (15-20 topics)
   - Create: `ElectromagnetismGraphComponent` wrapper
   - Add route: `/physics/electromagnetism-graph`
   - Topics to include:
     - Foundational: Electric Fields, Magnetic Fields, Vector Calculus
     - Intermediate: Maxwell's Equations, Wave Propagation, Electromagnetic Potentials
     - Advanced: Radiation, Relativity & EM, Quantum Effects in EM
   - Map concept-graph node click (e.g., 'electromagnetism' node) to new route

2. **Thermodynamics Knowledge Graph**
   - Create: `thermodynamics-graph.ts` (15-20 topics)
   - Create: `ThermodynamicsGraphComponent` wrapper
   - Add route: `/physics/thermodynamics-graph`
   - Topics to include:
     - Foundational: Temperature, Energy, Entropy Basics
     - Intermediate: First & Second Laws, Phase Transitions, Statistical Basis
     - Advanced: Non-equilibrium, Fluctuations, Applications

3. **Quantum Mechanics Knowledge Graph**
   - Create: `quantum-mechanics-graph.ts` (15-20 topics)
   - Create: `QuantumMechanicsGraphComponent` wrapper
   - Add route: `/physics/quantum-mechanics-graph`
   - Topics to include:
     - Foundational: Wave Functions, Schrödinger Equation, Uncertainty
     - Intermediate: Perturbation Theory, Spin, Angular Momentum
     - Advanced: Quantum Field Theory, Dirac Equation, Applications

**Implementation Steps** (for each subject):
1. Define 15-20 topic nodes with appropriate levels and colors
2. Map 20-30 edges showing prerequisites and relationships
3. Create wrapper component using generic KnowledgeGraphComponent
4. Add route to app-routing.module.ts
5. Add component declaration to app.module.ts
6. Update physics-concept-graph.component.ts navigateToNodeGraph() to map node clicks
7. Build and test visualization

**Testing Checklist**:
- [ ] Navigate from concept-graph node → knowledge graph displays
- [ ] Zoom/pan controls work smoothly
- [ ] Click nodes → info panel shows correctly
- [ ] Hover edges → tooltips appear
- [ ] Fit-to-View button resets visualization
- [ ] Back button returns to physics page

---

## After Knowledge Graphs: Continue Pop-Out Manual Testing

**Priority**: HIGH (Validates architecture stability)

**What to Do**:

Follow the 10 test scenarios in [POPOUT-ARCHITECTURE.md](../../docs/POPOUT-ARCHITECTURE.md):
1. **Test 1**: Open pop-out window on Model Picker
2. **Test 2**: Verify state sync from main window to pop-out
3. **Test 3**: Verify state sync from pop-out to main window
4. **Test 4**: Verify multiple pop-outs work independently
5. **Test 5**: Verify filter operations propagate correctly
6. **Test 6**: Verify pop-out window closes cleanly
7. **Test 7**: Verify page refresh closes all pop-outs
8. **Test 8**: Multi-monitor scenario (if available)
9. **Test 9**: Network latency simulation with DevTools throttling
10. **Test 10**: Console validation - verify message flow

**Testing Environment**:
- URL: `http://192.168.0.244:4205/automobiles/discover` (or localhost:4205)
- Backend API: `generic-prime.minilab` (or configured endpoint)
- Browser: Chrome/Chromium with DevTools
- Need at least 2 windows for testing

**Expected Output**:
- ✅ Pop-outs open, display correctly, close without errors
- ✅ State synchronization works in both directions
- ✅ Multiple pop-outs can operate simultaneously
- ✅ Console shows proper message flow with no errors
- ✅ No memory leaks or event listener cleanup issues
- Document any issues found for follow-up debugging

---

## After Pop-Out Testing: Fix Known Bugs

**Priority**: MEDIUM (User Experience)

### Bug #13: PrimeNG Dropdown Keyboard Navigation
**Component**: p-dropdown with `[filter]="true"` in Query Control (Manufacturer filter)
**Issue**: Keyboard navigation broken - arrow keys don't highlight, Enter/Space don't select
**Workaround**: Mouse click works fine
**Fix Steps**:
1. Inspect component in browser DevTools for missing tabindex/accessibility attributes
2. Test if issue is PrimeNG bug or configuration conflict
3. Check if `[editable]="true"` + `[filter]="true"` combination causes issue
4. Implement onKeyDown event handler as workaround if needed
5. Verify with other filters (Body Class, etc.)

### Bug #7: Multiselect Visual State
**Component**: p-multiSelect (Body Class filter)
**Issue**: Checkboxes remain checked visually after clearing filters (filtering works correctly)
**Impact**: Visual inconsistency - misleads users about active filters
**Fix Steps**:
1. Inspect p-multiSelect state after filter clear
2. Manually update visual state after API response
3. Force change detection or component refresh
4. Test with various filter combinations

---

## Priority Order (Updated)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **1** | **Perform pop-out manual testing (10 tests)** | **HIGH** | **IN PROGRESS** |
| **2** | **Fix Bug #13 (dropdown keyboard nav)** | **MEDIUM** | Pending |
| 3 | Fix Bug #7 (multiselect visual state) | Medium | Pending |
| 4 | Document source code fully (framework services, components) | High | Pending |
| 5 | Plan agriculture domain implementation | Low | Pending |
| 6 | Plan chemistry domain implementation | Low | Pending |
| 7 | Plan mathematics domain implementation | Low | Pending |

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

**Last Updated**: 2025-12-14T19:35:00Z
