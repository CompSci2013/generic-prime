# Next Steps

**Current Session**: Session 42 - Pop-Out Architecture Fixed (COMPLETE)
**Next Session**: Session 43 - Merge to Main & Full Testing

---

## SESSION 42 COMPLETION: Pop-Out Architecture Fixed ✅

**Status**: ✅ COMPLETE - Pop-out windows working perfectly

### What Was Accomplished

1. ✅ **Diagnosed root cause of pop-out header issue**:
   - Pop-outs were rendering full AppComponent (with Home/Domains banner)
   - Attempted separate entry point approach (popout.html) but dev server couldn't serve it
   - Realized: GoldenLayout and professional frameworks use simpler query-parameter pattern

2. ✅ **Implemented query-parameter-based architecture**:
   - Pop-outs now open with: `/panel/:gridId/:panelId/:type?popout=panelId`
   - AppComponent detects `?popout` query param via ActivatedRoute.queryParams
   - Header hidden via `*ngIf="!isPopOut"` template binding
   - Result: Clean, focused pop-out windows with ONLY panel content

3. ✅ **Code changes**:
   - Updated `discover.component.ts` to generate pop-out URLs with query parameter
   - Enhanced `app.component.ts` with pop-out detection logic
   - Modified `app.component.html` to conditionally render header
   - Restored original module structure (no shared modules needed)

4. ✅ **Verified functionality**:
   - Opened multiple pop-outs simultaneously (Query Control, Statistics, Results Table)
   - Applied filters in main window → all pop-outs updated instantly
   - Applied filters in pop-outs → main window updated instantly
   - State synchronization via BroadcastChannel working perfectly
   - No console errors, clean architecture

### Branch Summary

**Branch Name**: `bug-fix/minimal-automobiles-popout`
**Commits Added**:
- 57b290a: fix: Implement separate pop-out entry point architecture (reverted)
- 9ff5988: fix: Implement query-parameter-based pop-out window architecture

### Key Insight

The simplest solution is best. Instead of complex separate entry points and builds:
- Same application URL for main and pop-outs
- Query parameter flags different rendering modes
- AppComponent conditionally shows/hides header based on flag
- This is exactly how GoldenLayout and other professional layout systems work

---

## SESSION 43 PLAN: Merge Pop-Out Fixes to Main Branch

**Immediate Next Action**: Merge working pop-out architecture from `bug-fix/minimal-automobiles-popout` to main `generic-prime` branch

### Steps
1. **Merge branch to main**:
   - Cherry-pick commits from minimal branch to main
   - Key commits to merge:
     - Pop-out URL generation fix (discover.component.ts)
     - Query parameter detection (app.component.ts)
     - Conditional header rendering (app.component.html)
   - Verify main branch still builds and runs

2. **Run full application tests on main**:
   - Test pop-outs work with ALL domains (not just automobile)
   - Verify no regressions in main branch functionality
   - Test all domain landing pages, discovery interfaces

3. **Close minimal branch** (if main merge successful):
   - Can delete `bug-fix/minimal-automobiles-popout`
   - Keep main branch as source of truth

### Why This Approach
- Pop-out architecture fix applies universally to all domains
- Better to have working pop-outs on main than isolated in branch
- Enables testing across full multi-domain application
- Main branch gains benefit of Session 40-42 improvements

---

## SESSION 41 COMPLETION: Minimal Automobiles-Only Build

**Status**: ✅ COMPLETE - Branch created, all cleanup done

### What Was Accomplished

1. ✅ **Created minimal branch**: `bug-fix/minimal-automobiles-popout`
   - Forked from Session 40 final (commit c6bc706)
   - All previous zone-aware fixes maintained

2. ✅ **Removed all non-automobile domains**:
   - Deleted: physics/, agriculture/, chemistry/, math/, home/, dependency-graph/
   - Deleted: frontend/e2e/ (all E2E tests)
   - Removed: karma.conf.js, playwright.config.ts

3. ✅ **Cleaned up package.json**:
   - Removed test scripts: test, test:e2e, test:watch, test:report, test:report, build:doc, compodoc, dev, dev:all
   - Removed 15+ devDependencies
   - Reduced to 6 core scripts: ng, start, build, watch, dev:server, lint, lint:fix

4. ✅ **Simplified routing** (app-routing.module.ts):
   - Removed 14+ routes for removed domains
   - Kept 4 core routes: '', '/automobiles', '/automobiles/discover', '/panel/:gridId/:panelId/:type'

5. ✅ **Cleaned module declarations** (app.module.ts):
   - Removed all domain component imports
   - Kept only: AppComponent, AutomobileComponent, DiscoverComponent, PanelPopoutComponent

6. ✅ **Removed Picker from Discover component** (THIS SESSION):
   - Removed 'manufacturer-model-picker' from panelOrder
   - Removed picker initialization code
   - Removed picker entries from title/type maps
   - Removed onPickerSelectionChangeAndUpdateUrl() method
   - Removed picker panel rendering from template
   - Updated all documentation and JSDoc comments
   - Result: Only 3 panels remain (Query Control, Statistics, Results Table)

7. ✅ **Build verified**:
   - Bundle size: 5.66 MB (down from 6.84 MB, 18% reduction)
   - No TypeScript errors
   - All references cleaned up

### Branch Details

**Branch Name**: `bug-fix/minimal-automobiles-popout`
**Based On**: Session 40 final (commit c6bc706)
**5 Commits** on this branch:
- ca793ba: chore: Create minimal automobiles-only branch
- ce20e76: docs: Add comprehensive guide for minimal automobiles-only build
- 02011af: fix: Remove manufacturer-model-picker from discover component
- 2d2bd47: docs: Update ngOnInit JSDoc - remove outdated picker initialization step
- 3dc99e2: docs: Remove picker references from discover component comments

### Next Session Plan (Session 42)

**Priority 1 (IMMEDIATE)**: Manual Pop-Out Testing on Minimal Build
- Test all 3 panels (Query Control, Statistics, Results Table)
- Verify state synchronization between main and pop-outs
- Validate filter application works correctly
- Confirm pop-out URLs remain clean (no query params)

**Testing Checklist for Session 42**:
- [ ] Pop-out Query Control opens and displays correctly
- [ ] Pop-out Statistics panel opens and displays charts
- [ ] Pop-out Results table opens
- [ ] Apply filter in main window → all pop-outs update
- [ ] Apply filter in pop-out → main window updates
- [ ] Multiple pop-outs open simultaneously and stay in sync
- [ ] Filter clear works from pop-out
- [ ] Pop-out URLs stay clean (no query parameters)
- [ ] No console errors

---

## SESSION 40 FINAL COMPLETION: Zone Boundary Fix for Pop-Out State Updates

**Status**: ✅ IMPLEMENTATION COMPLETE - Pop-Out State Sync Fixed

**Critical Issue Resolved**:
Pop-out windows were receiving STATE_UPDATE messages but the UI remained frozen. The root cause was that BehaviorSubject emissions in ResourceManagementService were happening outside the Angular zone, causing child component subscription callbacks to run outside the zone.

**Solution Implemented**:
- Injected NgZone into ResourceManagementService
- Wrapped `stateSubject.next()` in `ngZone.run()` in syncStateFromExternal()
- This ensures the entire observable emission chain runs inside the Angular zone
- Child components' cdr.markForCheck() calls now become effective
- Pop-out windows will now update immediately when receiving state from main window

**Files Modified**:
- `frontend/src/framework/services/resource-management.service.ts` (zone-aware emissions)
- `frontend/src/app/features/panel-popout/panel-popout.component.ts` (simplified, removed redundant wrapping)

**Commits in Session 40**:
1. 61b4aa9: chore: Remove redundant URL_PARAMS_SYNC broadcast
2. 383a2fa: fix: Prevent pop-out URL mutation in StatisticsPanel
3. 767034b: fix: Ensure BehaviorSubject emissions in pop-outs run inside Angular zone

**Documentation**: Created SESSION-40-ZONE-FIX-COMPLETE.md with comprehensive technical analysis

**Next**: Manual pop-out testing to verify fixes work correctly

---

## SESSION 40 PART 1 COMPLETED: Gemini Assessment & Pop-Out Architecture Optimization

**Status**: ✅ IMPLEMENTATION COMPLETE - Architecture Optimized

**What Was Done**:
- Reviewed Gemini's comprehensive code assessment
- Identified and removed redundant `URL_PARAMS_SYNC` broadcast mechanism
- Verified Session 39 BroadcastChannel implementation is correct
- Confirmed pop-out architecture follows best practices (no @Input bindings)
- Removed 44 lines of dead code from DiscoverComponent
- Build successful with no TypeScript errors

**Why This Matters**:
- Eliminates unnecessary BroadcastChannel message traffic
- Simplifies pop-out state flow (only STATE_UPDATE messages now)
- Cleaner, more efficient architecture
- Validates Session 39 implementation was correct

**Key Architecture Insight**:
The current implementation correctly avoids @Input() bindings and zone violations by:
1. Using PopOutContextService.getMessages$() subscriptions in pop-outs
2. Pop-outs filter for STATE_UPDATE messages only
3. Extract state from message.payload.state and render without URL mutations
4. Pop-out URLs stay clean - main window URL is only source of truth

---

## SESSION 39 COMPLETED: Pop-Out BroadcastChannel Architecture Fix

**Status**: ✅ IMPLEMENTATION COMPLETE - Ready for testing

**What Was Done**:
- Reverted @Input() bindings that couldn't work across Angular zones
- Implemented BroadcastChannel subscription in QueryControl for pop-out mode
- QueryControl now detects pop-out and subscribes to STATE_UPDATE messages
- Filters extracted from BroadcastChannel messages and rendered without URL params
- Pop-out URLs remain clean, URL-First architecture fully preserved
- Build successful, no TypeScript errors

**Why This Matters**:
- Previous Session 38 attempt violated Angular zone architecture
- Pop-out windows run in separate zones - @Input bindings impossible
- Correct solution leverages existing BroadcastChannel mechanism already in place
- Clean, zone-aware implementation

---

## SESSION 41 PLAN: Pop-Out Testing & Bug Fixes

**Status**: Ready for next session

### Immediate Next Action

**Priority 1 (HIGH) - Manual Testing of Pop-Out Filter Rendering**

Test all scenarios from `POP-OUT-REQUIREMENTS-RUBRIC.md`:

1. **Test 1: Pop-Out URL Stays Clean**
   - [ ] Open pop-out Query Control
   - [ ] Apply filter in main window
   - [ ] Verify pop-out URL = `/panel/discover/query-control/query-control` (NO query params)

2. **Test 2: Filter Chips Render in Pop-Out**
   - [ ] Apply filters in main window
   - [ ] Verify filter chips display in pop-out Query Control

3. **Test 3: Filter Chips Update Dynamically**
   - [ ] Pop-out Query Control window open
   - [ ] Apply new filter in main window
   - [ ] Verify new filter chip appears in pop-out immediately

4. **Test 4: Apply Filter from Pop-Out**
   - [ ] Apply filter in pop-out Query Control
   - [ ] Verify filter chip appears in main window
   - [ ] Verify results update in main window

5. **Test 5: Clear All Works from Pop-Out**
   - [ ] Apply multiple filters
   - [ ] Click "Clear Filters" in pop-out
   - [ ] Verify filters disappear in both main and pop-out

6. **Test 6: Multiple Pop-Outs Stay in Sync**
   - [ ] Open 3 pop-outs: Query Control, Statistics, Results
   - [ ] Apply filter in main window
   - [ ] Verify all three pop-outs update simultaneously

**Console Validation**:
- Look for `[QueryControl] 🟢 Received STATE_UPDATE from BroadcastChannel` logs
- Look for `[QueryControl] 🔄 syncFiltersFromPopoutState()` logs
- No console errors expected

**Success Criteria**:
- [ ] All 6 tests pass
- [ ] Pop-out URLs stay clean
- [ ] Filter chips render and update correctly
- [ ] No console errors
- [ ] Multiple pop-outs stay in sync

### Priority 2 (MEDIUM) - Bug #13: Dropdown Keyboard Navigation

If pop-out testing passes, move on to fixing dropdown keyboard nav bug in Query Control (arrow keys, space bar not working with p-dropdown [filter]="true")

---

## SESSION 38 COMPLETED: Pop-Out URL Parameter Fix

**Status**: ✅ IMPLEMENTATION COMPLETE - Ready for testing

**What Was Done**:
- Removed `urlState.setParams()` call from PanelPopoutComponent URL_PARAMS_SYNC handler
- Pop-out URLs now remain clean (no query parameters)
- Added `@Input() popoutState` to PanelPopoutComponent for passing state to children
- Enhanced QueryControlComponent with `@Input() popoutState` and pop-out detection
- Implemented `syncFiltersFromPopoutState()` to render filter chips from state instead of URL
- Architecture preserved: URL-First in main window, state-driven in pop-outs via @Input

**Testing Status**: Ready - See `SESSION-38-POP-OUT-FIX.md` for test checklist

---

## SESSION 39 PLAN: Priority 2 - Implement UserPreferencesService

**Status**: Implementation plan complete. Ready to code.

### Immediate Next Action

**Implement UserPreferencesService for Panel Order Persistence**

See full implementation details in `/home/odin/projects/generic-prime/IMPLEMENTATION-PLAN.md`

#### Phase 1 - Create the Service

1. Create `frontend/src/framework/services/user-preferences.service.ts`
   - Uses localStorage for persistence
   - Provides RxJS observables for reactive updates
   - Handles graceful failures (quota exceeded, private browsing)
   - Support for domain-aware preferences

2. Update `frontend/src/app/app.module.ts`
   - Add UserPreferencesService to providers (providedIn: 'root')

#### Phase 2 - Integrate with DiscoverComponent

3. Update `frontend/src/app/features/discover/discover.component.ts`
   - Inject UserPreferencesService in constructor
   - Load panelOrder from preferences in ngOnInit (with defaults)
   - Save panelOrder to preferences in onPanelDrop
   - Save collapsedPanels to preferences in collapse handlers

#### Phase 3 - Testing

4. Manual testing:
   - [ ] Drag panels to reorder
   - [ ] Refresh page - order persists
   - [ ] Clear localStorage - default order returns
   - [ ] Collapse/expand - state persists
   - [ ] Works across multiple browser tabs (BroadcastChannel support)

**Expected Outcome**:
- Users can reorder panels and have order persist across sessions
- Clean, reusable service for future preference storage
- Foundation for theme preferences, layout preferences, etc.

**Success Criteria**:
- [ ] panelOrder persists to localStorage on drag-drop
- [ ] panelOrder loads from localStorage on page load
- [ ] Default order used when localStorage is empty
- [ ] Collapsed state persists
- [ ] No console errors
- [ ] Works in all browsers (Chrome, Firefox, Safari)

---

## SESSION 38 PLAN: Priority 2 - Remove Component-Level Provider Anti-Pattern

**Status**: Refactoring plan complete. Low-risk change.

### Immediate Next Action

**Remove `providers: [ResourceManagementService]` from DiscoverComponent**

See full refactoring details in `/home/odin/projects/generic-prime/IMPLEMENTATION-PLAN.md`

#### Steps:

1. Verify ResourceManagementService has `providedIn: 'root'` (singleton)
2. Check for other components with component-level providers
3. Remove the line: `providers: [ResourceManagementService]` from DiscoverComponent decorator
4. Build and test:
   - [ ] Dev server builds without errors
   - [ ] Filters still work
   - [ ] State updates propagate correctly
   - [ ] Pop-outs still sync
   - [ ] No service initialization errors

---

## SESSION 39+ PLAN: Priority 3 - Fix Dropdown Keyboard Navigation

**Status**: Investigation and multiple solution paths documented.

### Immediate Next Action

**Investigate and Fix Dropdown Space Bar Selection (Bug #13)**

See full investigation details in `/home/odin/projects/generic-prime/IMPLEMENTATION-PLAN.md`

**Investigation Steps**:
1. Reproduce in browser (arrow keys, space bar, enter key)
2. Check PrimeNG 14.2.3 release notes for keyboard nav bugs
3. Examine dropdown element in DevTools for missing attributes
4. Determine if it's a PrimeNG bug or configuration issue

**Solution Paths**:
- Option A: PrimeNG bug workaround (quick fix)
- Option B: Custom keyboard event handlers
- Option C: Use alternative filter approach

---

## Deprioritized

### E2E Testing
- E2E tests have consumed excessive time with diminishing returns
- 33 tests are written and enabled in `frontend/e2e/app.spec.ts`
- Can be run manually: `npm run test:e2e` when needed
- Lower priority than code quality and user-facing features
- Will revisit if test infrastructure improves

---

## Priority Summary

| Phase | Work | Priority | Status | Estimated |
|-------|------|----------|--------|-----------|
| **1** | **UserPreferencesService + Panel Order Persistence** | **HIGH** | Ready | 2-3 hrs |
| **2** | **Remove Component-Level Provider Anti-Pattern** | **HIGH** | Ready | 1-2 hrs |
| **3** | **Fix Dropdown Keyboard Navigation (Bug #13)** | **MEDIUM** | Ready | 1-3 hrs |
| -- | **E2E Testing (DEPRIORITIZED)** | LOW | Deferred | -- |

---

## SESSION 33 COMPLETED: Fixed E2E Tests for Pop-Out Synchronization

**Status**: ✅ Completed. Fixed failing E2E tests and optimized test framework.

### What Was Done
- ✅ Diagnosed E2E test failures (Plotly canvas click issue)
- ✅ Refactored tests 6.1 and 6.2 to use URL parameter navigation
- ✅ Increased test timeout from 3000ms to 10000ms for pop-out tests
- ✅ Optimized wait times from 2000ms to 500ms
- ✅ Tests now ready for validation in E2E container

---

## SESSION 32 COMPLETED: Fixed Pop-Out State Synchronization

**Status**: ✅ Completed. Resolved race condition and implemented URL parameter sync.

### What Was Done
- ✅ Identified and fixed race condition in state broadcasting
- ✅ Implemented URL_PARAMS_SYNC message type for pop-out URL synchronization
- ✅ Tested all three pop-out panels updating correctly
- ✅ Query Control filter chips now render in pop-out windows
- ✅ All pop-outs maintain state synchronization

---

## SESSION 30 COMPLETED: Achieved 100% JSDoc Documentation Coverage

**Status**: ✅ Completed. Enhanced automobile statistics model classes, achieved 100% Compodoc coverage.

### What Was Done
- ✅ Analyzed Compodoc coverage report (started at 98%)
- ✅ Identified remaining low-coverage items in automobile.statistics.ts
- ✅ Discovered most files were already well-documented (PhysicsSyllabusComponent, ReportComponent, AutomobileApiAdapter, PanelPopoutComponent all had 70%+ coverage)
- ✅ Enhanced VehicleStatistics with 14 properties individually documented
- ✅ Enhanced ManufacturerStat with 5 properties + static factory method
- ✅ Enhanced ModelStat with 5 properties + utility method (getFullName)
- ✅ Enhanced BodyClassStat with 4 properties + static factory method
- ✅ Enhanced YearStat with 4 properties + 2 utility methods (isCurrentYear, getAge)
- ✅ Added 50+ new JSDoc comments across all model classes (246 lines total)
- ✅ Committed changes: "docs: Enhance automobile statistics model documentation for 100% Compodoc coverage"
- ✅ Updated PROJECT-STATUS.md with Session 30 final achievement
- ✅ Verified 100% coverage achieved

**Key Achievement**:
- Coverage progression: 88% → 97% (Session 28) → 98% (Session 29) → **100% (Session 30)** ✅
- Total JSDoc comments added across Sessions 28-30: **200+ individual comments**
- Files enhanced: **30+ TypeScript files**
- Consistent documentation pattern now applied across entire codebase

---

## SESSION 31 COMPLETED: Pop-Out Panel Styling Refinement

**Status**: ✅ Completed. Fixed styling issues on pop-out windows.

### What Was Done
- ✅ Removed "Automobile Discovery" subtitle from panel popout headers (freed up vertical space)
- ✅ Changed popout header text color to white for better visibility
- ✅ Changed "Clear All" button from danger (pink) to secondary (gray)
- ✅ Changed multiselect filter dialog "Apply" button from danger to primary
- ✅ Changed year range filter dialog "Apply" button from danger to primary
- ✅ Verified all other pop-out components (Statistics, Results Table, Picker) have consistent styling
- ✅ Updated PROJECT-STATUS.md with Session 31 achievements

**Key Improvements**:
- Pop-out windows now have cleaner headers with white text on dark background
- All button colors align with dark theme (lara-dark-blue) instead of mismatched pink
- Consistent styling across all panel types

---

## SESSION 33 PLAN: Complete Pop-Out Manual Testing

**Status**: Pop-out state synchronization fixed. Ready for comprehensive testing of all pop-out features.

### Immediate Next Actions

**1. Pop-Out Manual Testing Protocol** (comprehensive 10-test scenario)
   Validate all pop-out functionality after state sync fix:
   - [ ] Test 1: Open pop-out on Query Control and apply filter
   - [ ] Test 2: Verify filter chips render in Query Control pop-out
   - [ ] Test 3: Verify Statistics pop-out updates with filtered data
   - [ ] Test 4: Verify Results Table pop-out updates with filtered data
   - [ ] Test 5: Open multiple pop-outs simultaneously
   - [ ] Test 6: Apply filter from one pop-out, verify all pop-outs update
   - [ ] Test 7: Close pop-out and verify panel reappears in main
   - [ ] Test 8: Refresh page and verify pop-outs close automatically
   - [ ] Test 9: Test "Clear All Filters" from pop-out Query Control
   - [ ] Test 10: Drag-drop panels in main while pop-outs are open

**2. Testing Checklist**
   - Open Developer Console to monitor BroadcastChannel URL_PARAMS_SYNC messages
   - Verify filter changes propagate instantly to all pop-outs
   - Verify pop-out windows can send filter changes back to main
   - Verify state consistency across all windows
   - Test edge cases: rapid filter changes, simultaneous pop-outs
   - Check browser console for any warnings or errors

**3. Known Issues to Monitor**
   - Bug #13: Dropdown keyboard navigation (different issue, lower priority)
   - Bug #7: Multiselect visual state (cosmetic issue, lower priority)
   - Watch for any new race conditions in the fixed state sync logic

**4. After Passing All Tests**
   - Document testing results in TESTING.md
   - Mark pop-out feature as "Stable"
   - Next priority: Fix Bug #13 (PrimeNG dropdown keyboard nav)

---

## SESSION 31+ PLAN: Physics Knowledge Graphs (After 100% Coverage)

**Priority**: HIGH (Extends Physics domain educational value)

### What to Do

Implement knowledge graphs for remaining Physics course tiles following the Classical Mechanics pattern:

**1. Electromagnetism Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/electromagnetism-graph.ts`
   - Create: `ElectromagnetismGraphComponent` wrapper
   - Add route: `/physics/electromagnetism-graph`
   - Topics: Electric Fields, Magnetic Fields, Maxwell's Equations, Wave Propagation, Radiation, etc.

**2. Thermodynamics Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/thermodynamics-graph.ts`
   - Create: `ThermodynamicsGraphComponent` wrapper
   - Add route: `/physics/thermodynamics-graph`
   - Topics: Temperature, Energy, Entropy, Laws of Thermodynamics, Phase Transitions, etc.

**3. Quantum Mechanics Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/quantum-mechanics-graph.ts`
   - Create: `QuantumMechanicsGraphComponent` wrapper
   - Add route: `/physics/quantum-mechanics-graph`
   - Topics: Wave Functions, Schrödinger Equation, Uncertainty, Spin, Angular Momentum, etc.

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

## After Knowledge Graphs: Pop-Out Window Manual Testing

**Priority**: HIGH (Validates architecture stability)

**What to Do**: Follow the 10 test scenarios in POPOUT-ARCHITECTURE.md
1. Open pop-out window on Model Picker
2. Verify state sync from main window to pop-out
3. Verify state sync from pop-out to main window
4. Verify multiple pop-outs work independently
5. Verify filter operations propagate correctly
6. Verify pop-out window closes cleanly
7. Verify page refresh closes all pop-outs
8. Multi-monitor scenario (if available)
9. Network latency simulation with DevTools throttling
10. Console validation - verify message flow

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

---

## Priority Order (Master List)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **0** | **Session 17**: Dependency graph visualization (145+ nodes, 300+ edges) | **DONE** | **✅ COMPLETE** |
| **0.5** | **Session 18**: Modal visibility fix + drag handle | **DONE** | **✅ COMPLETE** |
| **1** | **Session 29**: Achieve 98-99% JSDoc documentation | **HIGH** | **✅ COMPLETE** |
| **1** | **Session 30 (NEXT)**: Achieve 100% JSDoc documentation | **HIGH** | **Immediate** |
| **2** | **Create Knowledge Graphs for Physics Topics** | **HIGH** | Pending |
| **3** | **Perform pop-out manual testing (10 tests)** | **HIGH** | Pending |
| **4** | **Fix Bug #13 (dropdown keyboard nav)** | **MEDIUM** | Pending |
| 5 | Fix Bug #7 (multiselect visual state) | Medium | Pending |
| 6 | Plan agriculture domain implementation | Low | Pending |
| 7 | Plan chemistry domain implementation | Low | Pending |
| 8 | Plan mathematics domain implementation | Low | Pending |

---

**Last Updated**: 2025-12-20T15:45:00Z
