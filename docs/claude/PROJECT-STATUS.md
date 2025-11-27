# Project Status

**Version**: 1.9
**Timestamp**: 2025-11-27T23:45:00Z
**Updated By**: Picker isolation testing session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Picker isolation testing COMPLETE** - All 4 tests passed
- **Column sorting implemented** - Backend v1.4.0 deployed
- Discover page in **ISOLATION MODE** - testing Picker only
- Backend at `generic-prime-backend-api:v1.4.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-27 - Late Evening)

### Picker Isolation Testing Results

| Test | Status |
|------|--------|
| Picker loads 881 combinations | PASS |
| Selection updates URL | PASS |
| URL paste updates picker selection | PASS |
| Pop-out picker syncs with main window | PASS |

### Column Sorting Implementation

Backend and frontend changes to enable column sorting:

| Component | Change |
|-----------|--------|
| Backend `specsController.js` | Added `sortBy` and `sortOrder` query params |
| Backend `elasticsearchService.js` | Sort cached combinations before pagination |
| Frontend `automobile.picker-configs.ts` | Pass sort params to API |
| Frontend `base-picker.component.html` | Replace `(onPage)`+`(onSort)` with `(onLazyLoad)` |
| Frontend `base-picker.component.ts` | Add `onLazyLoad()` handler |

**Key Learning**: PrimeNG with `[lazy]="true"` fires `(onLazyLoad)` event instead of separate `(onSort)` and `(onPage)` events.

### Backend Deployment Pattern Documented

Added to ORIENTATION.md:
```bash
podman save localhost/generic-prime-backend-api:vX.Y.Z -o /tmp/backend-vX.Y.Z.tar && \
  sudo k3s ctr images import /tmp/backend-vX.Y.Z.tar && \
  sudo rm /tmp/backend-vX.Y.Z.tar
```

### Bugs Found (Not Fixed)

| Bug | Description | Priority |
|-----|-------------|----------|
| Search filter partial match | Searching "15" returns no results (should match years like 2015) | Low |
| URL params case sensitive | `Ford` vs `ford` treated differently | Low |

---

## Governing Tactic

**Continue isolation testing approach.**

1. ~~Test QueryControl in isolation~~ DONE
2. ~~Test Picker in isolation~~ DONE
3. Test Statistics in isolation
4. Test Results in isolation
5. Re-enable all panels when individually verified

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Working in picker |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.4.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | **RESOLVED** | Picker shows 881 combos with server-side pagination |
| #10 | Medium | **RESOLVED** | Pop-out communication working |
| #7 | Low | Not started | Checkboxes stay checked after clearing |
| NEW | Low | Not started | Search filter doesn't match partial text |
| NEW | Low | Not started | URL params are case sensitive |

---

## Next Session

1. **Test Statistics in isolation** - Swap Picker for Statistics panel
2. **Test Results in isolation** - Add Results panel
3. **Fix Bug #7** - Checkbox visual state
4. **Re-enable all panels** when individually verified

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
