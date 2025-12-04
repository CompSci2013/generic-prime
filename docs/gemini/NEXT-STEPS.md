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

## Current Priority: RESUME PHASE 2.1 MANUAL TESTING

**Status**: ✅ BUGS FIXED - Ready to Resume Testing

### Governing Tactic (from PROJECT-STATUS.md)

> **Bug #15 and #16 are NOW FIXED and VERIFIED:**
> 1. **Bug #16** ✅ FIXED: Results Table syncs immediately with filter changes (combineLatest race condition eliminated)
> 2. **Bug #15** ✅ FIXED: Dialog reopens correctly, arrow keys navigate, spacebar selects
>
> **Phase 2.1 testing can now resume with all remaining subsections:**

---

## Completed This Session (2025-12-04 Evening - Bug Fixes #15 & #16)

### Session 2025-12-04 Evening Achievements ✅

1. **Fixed Bug #16 (Results Table Sync) - COMPLETED ✓**
   - **Root Cause**: `combineLatest([filters$, results$, totalResults$, loading$])` race condition
   - **Solution**: Replaced with 4 independent subscriptions in `results-table.component.ts`
   - **Verification**: User manual testing confirmed results update immediately when filters change
   - **Build**: Compiles successfully (30+ seconds)

2. **Fixed Bug #15 (Dialog & Keyboard Issues) - COMPLETED ✓**
   - **Issue 1 - Arrow Keys**: Changed from opening dialogs to navigating only
     - Solution: Check `event.originalEvent.key` and skip dialog for arrow navigation
   - **Issue 2 - Spacebar**: Now selects highlighted options instead of adding space
     - Solution: Intercept spacebar keydown, find `.p-highlight` option, call selection
   - **Issue 3 - Multiple Dialogs**: Prevented simultaneous dialog opens
     - Solution: Close previous dialogs before opening new one
   - **Issue 4 - Invalid Options**: Removed "Highlight*" options from dropdown
     - Solution: Initialize with only `queryControlFilters`, not `highlightFilters`
   - **Verification**: User confirmed all issues resolved

3. **Comprehensive Documentation Created - COMPLETED ✓**
   - `docs/gemini/BUG-16-FIX-DOCUMENTATION.md` - With 3 Mermaid diagrams
   - `docs/gemini/BUG-15-FIX-DOCUMENTATION.md` - Two-way binding analysis
   - `docs/gemini/BUG-15-ACTUAL-ROOT-CAUSE.md` - Arrow key and spacebar issues
   - `docs/gemini/SESSION-2025-12-04-BUGS-15-16-FIXES.md` - Complete session summary

4. **Documentation Updated - COMPLETED ✓**
   - Updated STATUS-HISTORY.md with complete session snapshot (v2.13 → v2.14)
   - Updated PROJECT-STATUS.md with both bugs marked as FIXED
   - Updated NEXT-STEPS.md to reflect ready-to-resume status
   - Appended current session timestamp and findings

---

## Immediate Actions (Next Session - SESSION CONTINUATION)

### PRIORITY 1: CONTINUE PHASE 2.1 MANUAL TESTING ✅ In Progress (12.5% Complete)

**Current Progress**: 3 of 24 tests complete
- ✅ Test 2.1.9: Dialog Cancel Behavior (Multiselect to Multiselect) - PASS
- ✅ Test 2.1.10: Cancel Behavior (Multiselect to Range) - PASS
- ✅ Test 2.1.11: Dialog Reopen After Apply (**BUG #15 FIX VALIDATED**) - PASS

**Next Immediate Action**: Resume with Test 2.1.12

**Phase 2.1 Remaining Subsections** (in execution order):
1. **Remaining Dialog Cancel Behavior Tests** (Tests 2.1.12-2.1.13) - 2 tests pending
   - ✅ 2.1.9-2.1.11: COMPLETE
   - ⏳ 2.1.12: Range Dialog Reopen validation
   - ⏳ 2.1.13: Multiple Filters Active behavior
2. **Multiple Selection Tests** (Tests 2.1.14-2.1.18) - 5 tests pending
   - Select multiple values in single filter (e.g., Brammo, Ford, GMC)
   - Verify all values appear in chip
   - Verify URL updates with all values
3. **Search/Filter in Dialog** (Tests 2.1.19-2.1.22) - 4 tests pending
   - Type text in dialog search field
   - Verify list filters to matching options
   - Test search with 0 results
4. **Keyboard Navigation in Dialog** (Tests 2.1.23-2.1.26) - 4 tests pending
   - Tab/Shift+Tab between checkboxes
   - Arrow keys to navigate list
   - Space to toggle checkboxes
   - Enter to Apply, Escape to Cancel
5. **Clear/Edit Manufacturer Filter** (Tests 2.1.27-2.1.29) - 3 tests pending
   - Click existing filter chip to edit
   - Verify previous selections are pre-checked
   - Add/remove values and Apply
6. **Remove Manufacturer Filter** (Tests 2.1.30-2.1.32) - 3 tests pending
   - Click X on filter chip to remove
   - Verify URL updates
   - Verify Results Table updates

**Testing Workflow**:
- Execute each subsection sequentially
- Mark tests as `[X]` on success or document failures
- Use mouse clicks for initial field selection (arrow nav works differently per Bug #14)
- Document any new findings or regressions
- Build verification before committing

### PRIORITY 2: FIX BUG #7 (LOW - After Phase 2.1)

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

**Last Updated**: 2025-12-05T00:30:00Z
**Status**: ✅ Phase 2.1 testing resumed - 3 tests complete, 21 tests pending, 1 new bug found
