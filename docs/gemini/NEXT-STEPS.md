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

## Current Priority: RESUME PHASE 2.2 MANUAL TESTING

**Status**: ✅ PHASE 2.1 COMPLETE - All 24 tests passed

### Governing Tactic (from PROJECT-STATUS.md)

> **Phase 2.1 Complete. Resume Phase 2.2-2.7 testing systematically.**
> 1. **Phase 2.1** ✅ COMPLETE: All 24 tests passed (24/24)
> 2. **Phase 2.2** ⏳ PENDING: Model Filter testing (~5 tests)
> 3. **Phase 2.3-2.7** ⏳ PENDING: Body Class, Year, Search, Size, Clear All (~30 tests)
>
> **Continue testing with Phase 2.2 (Model Filter workflow):**

---

## Completed This Session (2025-12-05 Continued - Phase 2.1 Manual Testing)

### Session 2025-12-05 Achievements ✅

1. **Phase 2.1 Manual Testing COMPLETED - All 24 tests PASSED ✓**
   - **Tests 2.1.12-2.1.13 (Dialog Cancel Behavior)**: 2 tests PASSED
     - Range Dialog Reopen validation - Dialog opens/closes correctly
     - Multiple Filters Active behavior - Correct dialogs open when switching
   - **Tests 2.1.14-2.1.18 (Multiple Selection)**: 5 tests PASSED
     - Selected 3 models, URL updated correctly, Results Table synced immediately
     - BUG #16 fix validated - no stale data
   - **Tests 2.1.19-2.1.22 (Search/Filter in Dialog)**: 4 tests PASSED
     - Search filters list correctly, all results reappear when cleared
   - **Tests 2.1.23-2.1.26 (Keyboard Navigation)**: 4 tests PASSED
     - Tab/Space/Enter all work; Shift+Tab efficient for backward navigation
   - **Tests 2.1.27-2.1.29 (Clear/Edit Filter)**: 3 tests PASSED
     - Chip editing reopens dialog with previous selections pre-checked
   - **Tests 2.1.30-2.1.32 (Remove Filter)**: 3 tests PASSED
     - X button removes chips and updates URL/Results Table

2. **Bug Fixes Validated ✓**
   - **BUG #15**: Dialog reopen, arrow keys, spacebar all confirmed working
   - **BUG #16**: Results Table and Statistics sync immediately when filters change

3. **Documentation Updated - COMPLETED ✓**
   - Updated MANUAL-TEST-PLAN.md with all Phase 2.1 test results
   - Updated PROJECT-STATUS.md to v2.16
   - Updated NEXT-STEPS.md to reflect Phase 2.1 completion

---

## Immediate Actions (Next Session - PHASE 2.2+)

### PRIORITY 1: CONTINUE PHASE 2.2+ MANUAL TESTING ✅ Ready to Resume

**Current Progress**: Phase 2.1 complete (24/24 tests)
- ✅ Phase 2.1: Manufacturer Filter - COMPLETE (24 tests, 100% passed)

**Next Immediate Action**: Begin Phase 2.2 (Model Filter testing)

**Phases 2.2-2.7 Remaining** (estimated ~30 tests):
1. **Phase 2.2: Model Filter** (~5 tests pending)
   - Single Selection Workflow
   - Combined Filters Test
   - Edit Model Filter
   - Remove Model Filter
2. **Phase 2.3: Body Class Filter** (~4 tests pending)
   - Single Selection Workflow
   - Multiple Body Classes
   - Combined with Previous Filters
   - Remove Body Class Filter
3. **Phase 2.4: Year Range Filter** (~5 tests pending)
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

**Last Updated**: 2025-12-05T02:15:00Z
**Status**: ✅ Phase 2.1 testing complete - 24/24 tests passed, ready for Phase 2.2
