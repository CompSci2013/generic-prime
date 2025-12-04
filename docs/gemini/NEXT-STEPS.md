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

## Current Priority: Execute Phase 2 Manual Tests (Updated Test Plan)

**Status**: Build compiles successfully. UX standards documented. Test plan updated for actual workflow. Ready for manual testing.

### Governing Tactic (from PROJECT-STATUS.md)

> **Understand dropdown UX patterns → Execute Phase 2 manual tests → Resolve Bug #13 if needed**
> **Current focus: Validate that all filter workflows (multiselect dialogs, range inputs, search) work correctly per updated test plan and UX standards.**

---

## Completed This Session (2025-12-04 - UX Documentation & Test Plan Updates)

### Session 2025-12-04 Achievements

1. **UX Standards Documentation - COMPLETED ✓**
   - Created `docs/gemini/UX.md` (industry-standard dropdown UX patterns)
   - Created `docs/gemini/UX-IMPLEMENTATION.md` (Angular 14 + PrimeNG implementation)
   - Comprehensive research on ARIA Combobox and Modal Dialog patterns
   - Bug #13 investigation complete: Arrow keys **should work** but don't with `[filter]="true"`

2. **Manual Test Plan Updated - COMPLETED ✓**
   - Phase 2 sections (2.1-2.7) completely rewritten for actual workflow
   - Added "Dialog Cancel Behavior (Side Effect)" tests
   - Aligned tests with real user workflows (field selector → dialog → chips)
   - Test plan now reflects dialog workflow + side effect behavior

3. **Documentation Updated**
   - Appended session snapshot to STATUS-HISTORY.md
   - Updated PROJECT-STATUS.md to v2.11
   - Updated NEXT-STEPS.md (this file)

---

## Immediate Actions (Next Session)

### 1. Execute MANUAL-TEST-PLAN Phase 2 Tests

**Priority**: HIGH - This tests the core filter workflow

**Tests to Execute** (in order from updated test plan):
- **2.1 Manufacturer Filter** - Multiselect dialog workflow with side effect test
- **2.2 Model Filter** - Combined with Manufacturer
- **2.3 Body Class Filter** - Combined with previous filters
- **2.4 Year Range Filter** - Range dialog workflow
- **2.5 Search Filter** - Live text filtering
- **2.6 Page Size** - Results table control
- **2.7 Clear All** - Combined filter clearing

**Testing Workflow**:
- Execute each test item one-by-one
- Mark checkbox `[X]` on success, or `fail` with description
- Record failures in TEST-RESULTS section
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

**Last Updated**: 2025-12-04T18:30:00Z
