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

## Current Priority: Execute Phase 2 Manual Tests - Continue from Phase 2.1

**Status**: Phase 2.1 Single Selection workflow tests PASSED (8/8). Ready to continue with remaining Phase 2.1 subsections.

### Governing Tactic (from PROJECT-STATUS.md)

> **Execute Phase 2 manual tests systematically → Document findings → Resolve any critical bugs if needed**
> **Current focus: Complete Phase 2.1 remaining subsections (Dialog Cancel Behavior, Multiple Selection, Search/Filter, Keyboard Navigation, Edit/Remove) before moving to Phase 2.2+**

---

## Completed This Session (2025-12-04 Afternoon - Phase 2.1 Manual Testing)

### Session 2025-12-04 Afternoon Achievements

1. **Phase 2.1 Single Selection Workflow Tests - COMPLETED ✓**
   - Executed tests 2.1.1 through 2.1.8 (8 tests total)
   - Result: 8/8 PASSED ✓
   - Verified manufacturer filter workflow: field selector → dialog → checkbox → apply → chip
   - URL updates correctly: `?manufacturer=Brammo`
   - Results Table and Statistics Panel filter to selected manufacturer

2. **Bug #14 Discovery & Documentation - COMPLETED ✓**
   - Discovered field selector auto-opens dialog on arrow key navigation
   - Clarified with user: This is current implementation behavior (not a bug)
   - Per UX.md mouse click pattern, this is expected
   - Workaround: Use mouse clicks instead of keyboard navigation
   - Documented in MANUAL-TEST-PLAN.md TEST RESULTS section

3. **Documentation Updated - COMPLETED ✓**
   - Updated MANUAL-TEST-PLAN.md with Phase 2.1 results and Bug #14 findings
   - Appended PROJECT-STATUS.md v2.11 session snapshot to STATUS-HISTORY.md
   - Updated PROJECT-STATUS.md to v2.12 with current session summary
   - Updated NEXT-STEPS.md governing tactic and completed items (this file)

---

## Immediate Actions (Next Session)

### 1. Continue Phase 2.1 Manufacturer Filter Tests

**Priority**: HIGH - Phase 2.1 is foundational for all remaining Phase 2 tests

**Remaining Phase 2.1 Subsections** (in order):
- **Dialog Cancel Behavior (Side Effect)** - 5 tests pending
  - Verify Cancel button exercised when switching to Model filter
  - Verify correct dialog opens for new filter
  - Verify previous filter remains active
- **Multiple Selection Tests** - 5 tests pending
  - Select 3 manufacturers: Brammo, Ford, GMC
  - Verify URL shows: `?manufacturer=Brammo,Ford,GMC`
  - Verify Results Table shows intersection (all 3 only)
- **Search/Filter in Dialog** - 4 tests pending
  - Type "bra" in search box
  - Verify list filters to matching options
  - Verify clear search shows all options again
- **Keyboard Navigation in Dialog** - 4 tests pending
  - Tab to checkbox, Space to toggle
  - Tab to Apply button, Enter to apply
- **Clear/Edit Manufacturer Filter** - 3 tests pending
  - Click chip to reopen dialog with pre-selected checkbox
  - Uncheck and select different value
  - Verify URL updates correctly
- **Remove Manufacturer Filter** - 3 tests pending
  - Click X on chip to remove filter
  - Verify URL reverts to clean state

**Testing Workflow**:
- Execute each subsection one-by-one
- Mark checkbox `[X]` on success, or record `fail` with description
- Use mouse clicks (not keyboard navigation) for field selection per current behavior
- Do NOT fix code; only document findings

**Expected Results**:
- All filters working correctly
- Dialogs opening and closing properly
- Cancel side effect working as expected
- URL updates and chip display working
- Combined filters working (intersection, not union)

### 2. Bug #13 - Keyboard Navigation Testing

**Included in Phase 2.1** (Search/Filter in Dialog, Keyboard Navigation in Dialog sections)

**Expected Outcome**:
- Tab navigation: ✅ Expected to work
- Space to toggle: ✅ Expected to work
- Arrow keys in field dropdown: ❌ Known broken (Bug #13)
- Document exact failures for future investigation

### 3. Bug #7 - Checkbox Visual State

**Included in Phase 2.1** (Clear/Edit Manufacturer Filter section)

**Expected Outcome**:
- Checkboxes should reset when Clear All is clicked
- Document if checkboxes stay checked (visual sync issue)

### 4. Document Phase 2 Results

**Deliverable**: Complete TEST-RESULTS section in MANUAL-TEST-PLAN.md with:
- Total tests run
- Passed/Failed count per section
- Critical issues found
- Minor issues found
- Any workarounds discovered

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
