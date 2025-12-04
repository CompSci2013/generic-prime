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

## Current Priority: FIX CRITICAL BUGS #15 AND #16 BEFORE RESUMING TESTING

**Status**: ⏸️ MANUAL TESTING PAUSED - Two critical bugs discovered that block further progress

### Governing Tactic (from PROJECT-STATUS.md)

> **Phase 2.1 Single Selection tests PASSED (8/8) but BLOCKED by two critical bugs:**
> 1. **Bug #16** (HIGHEST PRIORITY): Results Table doesn't sync with URL - violates core URL-First architecture
> 2. **Bug #15** (HIGH PRIORITY): Dialog reopen broken via dropdown - blocks Dialog Cancel Behavior tests
>
> **Recommendation: Fix bugs first, then resume testing**

---

## Completed This Session (2025-12-04 Evening - Phase 2.1 Continuation & Bug Discovery)

### Session 2025-12-04 Evening Achievements

1. **Phase 2.1 Dialog Cancel Behavior Tests - STARTED BUT BLOCKED ✗**
   - Attempted tests 2.1.9 (Dialog Cancel Behavior - First Step)
   - **Blocker**: Bug #15 - Dialog fails to reopen when re-selecting filter via dropdown
   - Cannot proceed without fix

2. **Phase 2.1 Multiple Selection Tests - EXECUTED WITH BUG DISCOVERY ⚠️**
   - Executed test 2.1.14 using chip edit workaround (Bug #15 circumvention)
   - Successfully selected 3 manufacturers: Brammo, Ford, GMC
   - **CRITICAL FINDING**: URL updated correctly BUT Results Table didn't sync
   - Required manual page refresh (F5) to see filtered data
   - Identified Bug #16 (Results Table sync failure)

3. **Bug #15 Discovery & Documentation - COMPLETED ✓**
   - **Issue**: Multiselect dialog fails to reopen on second selection of same filter field
   - **Root Cause**: Two-way binding issue with PrimeNG Dialog `[(visible)]` property
   - **Impact**: Blocks Dialog Cancel Behavior test workflow
   - **Workaround**: Click chip to edit filter (circumvents dropdown)
   - **Documentation**: Created `docs/gemini/BUG-15-DIALOG-REOPEN.md` with full analysis

4. **Bug #16 Discovery & Documentation - COMPLETED ✓**
   - **Issue**: Results Table and Statistics don't update when filter is modified (stale data)
   - **Root Cause**: Likely async/await race condition in DiscoverComponent event chain
   - **Impact**: CRITICAL - Violates URL-First architecture (URL is not reliable source of truth)
   - **Workaround**: Manual page refresh (F5)
   - **Documentation**: Created `docs/gemini/BUG-16-RESULTS-TABLE-SYNC.md` with full analysis and investigation steps

5. **Documentation Updated - COMPLETED ✓**
   - Updated MANUAL-TEST-PLAN.md with Phase 2.1 Dialog Cancel Behavior and Multiple Selection results
   - Added Bug #15 and #16 to MANUAL-TEST-PLAN.md Critical Issues Found section
   - Updated PROJECT-STATUS.md Critical Bugs table (added #16, prioritized #15)
   - Appended current session to STATUS-HISTORY.md (v2.12 → v2.13)
   - Updated NEXT-STEPS.md with bug fix priority recommendation

---

## Immediate Actions (Next Session)

### PRIORITY 1: FIX BUG #16 (CRITICAL - Architecture Violation)

**Why First**: Violates core URL-First principle - URL updates but components don't sync. This is a fundamental architecture problem that invalidates the entire testing approach.

**Investigation Required**:
1. Trace event chain: ApplyFilter → urlParamsChange → DiscoverComponent.onUrlParamsChange()
2. Verify `setParams()` is being properly awaited in DiscoverComponent
3. Check ResourceManagementService.watchUrlChanges() subscription
4. Verify ResultsTableComponent receives data update observable
5. Check if change detection is triggered properly

**Files to Review**:
- `discover.component.ts` - Event handlers and async/await chain
- `resource-management.service.ts` - watchUrlChanges() method
- `results-table.component.ts` - Change detection strategy and subscriptions
- `url-state.service.ts` - BehaviorSubject emission

**Expected Fix**: Similar to Bug #1.3 fix - likely missing await on setParams() or change detection not triggering

### PRIORITY 2: FIX BUG #15 (HIGH - Blocks Testing)

**Why Second**: Blocks Dialog Cancel Behavior tests and dropdown filter re-selection workflow. Must be fixed to fully test Phase 2.1.

**Investigation Required**:
1. Replace `[(visible)]="showMultiselectDialog"` with one-way binding `[visible]="showMultiselectDialog"`
2. Add explicit `(onHide)="onDialogHide()"` event handler
3. Test if state change from `false` → `true` is properly detected
4. May need to use `detectChanges()` instead of `markForCheck()` in openMultiselectDialog()

**Files to Review**:
- `query-control.component.html` - Dialog visible binding (line 72)
- `query-control.component.ts` - openMultiselectDialog() method (line 250)

**Expected Fix**: Replace two-way binding with explicit one-way binding + event handler

### PRIORITY 3: RESUME PHASE 2.1 TESTING (After Bugs Fixed)

**Remaining Phase 2.1 Subsections** (in order):
- **Dialog Cancel Behavior (Side Effect)** - 5 tests (was blocked by Bug #15)
- **Multiple Selection Tests** - 5 tests (was blocked by Bug #16)
- **Search/Filter in Dialog** - 4 tests
- **Keyboard Navigation in Dialog** - 4 tests
- **Clear/Edit Manufacturer Filter** - 3 tests
- **Remove Manufacturer Filter** - 3 tests

**Testing Workflow** (Once bugs are fixed):
- Execute each subsection sequentially
- Mark tests as `[X]` on success or document failures
- Use mouse clicks for field selection (keyboard nav works differently per Bug #14)
- Continue with remaining Phase 2.2, 2.3, etc.

### PRIORITY 4: Document Testing Results

**Deliverable**: Update TEST-RESULTS section in MANUAL-TEST-PLAN.md with:
- Phase 2.1 final test count and status
- Complete list of bugs found
- Workarounds discovered
- Ready for Phase 2.2+ testing

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

**Last Updated**: 2025-12-04T22:15:00Z
