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

## Current Priority: Fix Bug #13 (Dropdown Keyboard Navigation)

**Status**: All critical bugs fixed. URL-First state management working. Ready for Phase 2 testing.

### Governing Tactic (from PROJECT-STATUS.md)

> **Panel headers streamlined for consistent, compact UI. All 4 panels now follow unified design pattern.**
> **All critical bugs fixed - URL-First architecture validated.**

---

## Completed This Session (2025-12-03 - Critical Bug Fixes)

### Session 2025-12-03 Achievements

1. **Bug #1.3 - FIXED ✓**
   - Fixed Query Control race condition in URL subscription
   - Changed from `combineLatest([filters$, highlights$])` to direct `urlState.params$` subscription
   - Chips now appear immediately when filter selected (verified working)

2. **Dropdown Interaction Issue - FIXED ✓**
   - Added `@ViewChild('filterFieldDropdown')` reference
   - Created `resetFilterDropdown()` helper to synchronize PrimeNG internal state
   - Dropdown now allows re-selection after dialog closes
   - Verified: Filter selection → URL update → Chip display → Re-selection all working

3. **Architecture Validation**
   - URL-First state management chain verified: URL → UrlStateService → ResourceManagementService → Components
   - Observable chain working correctly
   - Change detection strategy optimized

---

## Immediate Actions (Next Session)

### 1. Fix Bug #13 - Dropdown Keyboard Navigation

**Problem**: PrimeNG p-dropdown with `[filter]="true"` keyboard navigation broken:
- Down arrow should highlight next option
- Up arrow should highlight previous option
- Enter/Space should select highlighted option
- Currently: Arrow keys do nothing, can only click

**Investigation needed**:
- Check PrimeNG version compatibility
- Check if `[filter]="true"` disables keyboard nav
- Try PrimeNG accessibility settings
- May require downgrading to different PrimeNG version or using alternative component

### 2. Fix Bug #7 - Checkbox Visual State

**Problem**: Checkboxes stay checked after clearing filters
- Visual state not syncing with data model
- Low priority (cosmetic only)

**Investigation**:
- Verify checkbox model state syncs with data
- Test Clear All button behavior
- Check if form control state is being reset

### 3. Execute Full MANUAL-TEST-PLAN Phase 2

Run comprehensive Query Control test suite:
- Test all filter types (multiselect, range)
- Test pop-out Query Control windows
- Verify chip behavior
- Test drag-drop panel ordering persistence

### 4. Add "Agriculture" Domain (After Phase 2 Complete)

Create a new "agriculture" domain to validate the flexible domain architecture.

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

**Last Updated**: 2025-12-03
