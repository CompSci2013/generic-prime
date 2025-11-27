# Project Status

**Version**: 1.7
**Timestamp**: 2025-11-27T21:00:00Z
**Updated By**: Bug #10 isolation testing session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Bug #11 FULLY RESOLVED** - Picker working with 881 combinations
- **Bug #10 SIGNIFICANT PROGRESS** - Pop-out communication working
- Discover page in **ISOLATION MODE** - testing QueryControl only
- Backend upgraded to `generic-prime-backend-api:v1.3.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-27)

### Isolation Testing Strategy

Simplified Discover page to test QueryControl in isolation. Removed picker, statistics, and results panels.

### Fixes Applied (Working)

| Fix | File | Description |
|-----|------|-------------|
| Pop-out → Main URL sync | `panel-popout.component.ts` | Send `URL_PARAMS_CHANGED` via BroadcastChannel |
| Main handles pop-out messages | `discover.component.ts` | Handle `URL_PARAMS_CHANGED`, update URL |
| Close pop-outs on refresh | `discover.component.ts` | `beforeunload` broadcasts `CLOSE_POPOUT` |

### Test Results

| Test | Status |
|------|--------|
| Main window filter add | ✅ Working |
| URL paste in main window | ✅ Working |
| Pop-out receives state via BroadcastChannel | ✅ Working |
| Pop-out filter change → main URL update | ✅ Working |
| Pop-outs close on page refresh | ✅ Working |

### Remaining QueryControl Issues

- Minor bugs to address in next session (not documented yet)

### Files Modified This Session

| File | Change |
|------|--------|
| `discover.component.html` | Isolation mode - QueryControl only + debug panel |
| `discover.component.ts` | Debug URL display, `beforeunload` handler, `closeAllPopOuts()` |
| `discover.component.scss` | Styles for isolation notice and debug panel |
| `panel-popout.component.ts` | Implement `URL_PARAMS_CHANGED` message sending |

---

## Governing Tactic

**Continue isolation testing approach.**

1. Finish testing QueryControl bugs
2. Remove QueryControl, add Picker
3. Test Picker in isolation
4. Repeat for Statistics and Results
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
| **Backend Image** | `localhost/generic-prime-backend-api:v1.3.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | **RESOLVED** | Picker shows 881 combos with server-side pagination |
| #10 | Medium | **MOSTLY RESOLVED** | Pop-out communication working, close on refresh |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Fix QueryControl bugs** - Address remaining issues found during isolation testing
2. **Test Picker in isolation** - Swap QueryControl for Picker
3. **Fix Bug #7** - Checkbox visual state

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
