# Project Status

**Version**: 2.3
**Timestamp**: 2025-11-30T18:45:00Z
**Updated By**: Layout Restoration Session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Draggable panel layout restored** - Panels are now draggable with collapse functionality
- **Isolation mode removed** - All 4 panels active (Query Control, Picker, Statistics, Results Table)
- **All bug fixes preserved** - beforeunload, clearAllFilters, pop-out communication intact
- Backend at `generic-prime-backend-api:v1.5.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-30)

### Layout Restoration

Restored the original draggable panel layout from before isolation mode (commit dc952da~1):

| Component | Change |
|-----------|--------|
| `discover.component.html` | Restored `cdkDropList`, `*ngFor` iteration, drag handles, collapse buttons |
| `discover.component.ts` | Added `getPanelType()` method, removed debug panel code |
| `discover.component.scss` | Removed `.isolation-notice` and `.debug-panel` styles |

### Features Restored

- ✅ Draggable panels with `cdkDrag` and `cdkDragHandle`
- ✅ Collapse/expand buttons (chevron icons)
- ✅ Panel reordering via drag-drop
- ✅ All 4 panels visible (no isolation mode)

### Bug Fixes Preserved

| Fix | Status |
|-----|--------|
| `beforeUnloadHandler` for closing pop-outs on refresh | ✅ Preserved |
| `(clearAllFilters)` event binding on query-control | ✅ Preserved |
| Pop-out communication via BroadcastChannel | ✅ Preserved |

---

## Governing Tactic

**Validate the new domain architecture.**

The layout has been restored. The next step is to prove the domain architecture by adding a second domain.

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Working in picker |
| Unique Body Classes | 12 | Via /agg/body_class |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.5.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #13 | Medium | Not started | Dropdown keyboard navigation (arrow keys, Enter/Space) broken |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Add a new "agriculture" domain** - Create a new domain configuration to prove the new architecture.
2. **Fix Bug #13** - Dropdown keyboard navigation (may be PrimeNG issue)
3. **Fix Bug #7** - Checkbox visual state

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
