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

## Current Priority: Fix URL-First State Management Bug #1.3

**Status**: Async/await added to Discover component, but issue persists. Controls still not updating when URL changes.

### Governing Tactic (from PROJECT-STATUS.md)

> **Panel headers streamlined for consistent, compact UI. All 4 panels now follow unified design pattern.**
> Critical focus: **Fix URL-First state management so controls update when URL changes.**

---

## Completed This Session (2025-12-02 - URL-First Investigation)

- **Phase 1 Manual Testing Executed** - Found critical bug in test 1.3
- **Root Cause Analysis** - Identified race condition in Discover component
- **Applied Fix** - Added async/await to all URL state update calls
- **Build Verified** - Application compiles successfully
- **Testing** - Bug persists despite async/await fix, suggesting subscription or change detection issue

---

## Immediate Actions (CRITICAL)

### 1. Debug Query Control Component Subscriptions

**Status**: BLOCKED on investigation

Query Control is not updating when URL changes, even though URL correctly updates. Need to:

1. **Add debug logging to Query Control Component**
   - Log when `filters$` observable emits
   - Log when `urlState.params$` observable emits
   - Log when `syncFiltersFromUrl()` is called
   - Log when `ChangeDetectorRef.markForCheck()` is called

2. **Verify Observable Chain**
   - Check if ResourceManagementService `watchUrlChanges()` is firing
   - Verify filter mapper converts URL params to filter state correctly
   - Verify BehaviorSubject emits after URL navigation completes

3. **Check Change Detection**
   - Component uses OnPush - verify `markForCheck()` is being called
   - Check if `cdr.detectChanges()` needed instead of `markForCheck()`
   - Verify no subscription is unsubscribing prematurely

**Key Files:**
- `frontend/src/framework/components/query-control/query-control.component.ts` - Add debug logs
- `frontend/src/framework/services/resource-management.service.ts` - Verify `watchUrlChanges()` logic
- `frontend/src/domain-config/automobile/adapters/automobile-url-mapper.ts` - Test filter conversion

### 2. Trace Observable Flow

1. Open browser DevTools (F12)
2. Navigate to Discover page
3. Select a manufacturer in Query Control
4. Check console logs:
   - Does Discover emit URL change?
   - Does ResourceManagementService receive new params?
   - Does Query Control's subscription fire?
   - Is `syncFiltersFromUrl()` called?
   - Is `markForCheck()` called?

### 3. Test Hypothesis

Current hypothesis: Either:
- **A)** Query Control subscription doesn't fire when ResourceManagementService updates
- **B)** Filter mapper doesn't correctly convert URL params to filter state
- **C)** Change detection doesn't fire despite `markForCheck()`

---

## Secondary Actions (After Bug #1.3 Fixed)

### 4. Fix Bug #13 - Dropdown Keyboard Navigation

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

### 5. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

### 6. Add "Agriculture" Domain (AFTER #1.3 FIXED)

Create a new "agriculture" domain to validate the new flexible domain architecture.

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

**Last Updated**: 2025-12-02
