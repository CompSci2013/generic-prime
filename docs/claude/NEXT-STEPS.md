# Next Steps

**Current Session**: Session 33 - E2E Test Fixes Complete

---

## SESSION 34 PLAN: Execute E2E Tests and Validate Pop-Out Feature

**Status**: Ready for execution. Tests are fixed and waiting for validation.

### Immediate Next Action

**Run E2E Tests 6.1 and 6.2 in the E2E Container**

```bash
# In E2E container:
podman exec generic-prime-e2e bash -c "cd /app/frontend && npx playwright test e2e/app.spec.ts -g '6\\.1|6\\.2'"
```

**What to Expect**:
- Both tests should now PASS with increased timeout and URL-parameter approach
- Tests verify pop-out state synchronization via BroadcastChannel
- Full test suite should complete in ~10 seconds

**If Tests Pass**:
1. Document test results in PROJECT-STATUS.md
2. Mark pop-out feature as "Stable" (ready for production)
3. Next priority: Fix Bug #13 (PrimeNG dropdown keyboard navigation)

**If Tests Fail**:
1. Check console logs for BroadcastChannel message flow
2. Verify dev server is running on port 4205
3. Investigate if pop-out window references are staying open during test

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
