# Project Status

**Version**: 1.6
**Timestamp**: 2025-11-27T19:30:00Z
**Updated By**: Bug #10 investigation session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Bug #11 FULLY RESOLVED** - Picker working with 881 combinations
- **Bug #10 IN PROGRESS** - Partial fix applied, not resolved
- Backend upgraded to `generic-prime-backend-api:v1.3.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Bug #10 Investigation (2025-11-27)

### Problem Statement
Pop-out statistics panel breaks with pre-selected filters:
1. Initial state showed unfiltered data instead of filtered data
2. Changing filters (e.g., Ford → Buick) doesn't update pop-out or main window chips

### Root Cause Identified

**`UrlStateService` is a root singleton** (`providedIn: 'root'`) that was using `ActivatedRoute` for URL state. The root-level `ActivatedRoute` doesn't receive query param updates from child routes like `/discover`.

### Fixes Applied (Partial - Not Working)

**File: `frontend/src/framework/services/url-state.service.ts`**

1. **`watchRouteChanges()`** - Changed from `ActivatedRoute.queryParams` to `Router.events` with `NavigationEnd` filter
2. **`initializeFromRoute()`** - Changed from `route.snapshot.queryParams` to `router.parseUrl(router.url).queryParams`

**File: `frontend/src/app/features/panel-popout/panel-popout.component.ts`**

3. **`autoFetch: false`** - Prevents pop-out from making its own API calls (fixed initial state issue)

### What's Still Broken

URL params change correctly (URL bar updates), but:
- Active Filter chips in QueryControl don't update
- Pop-out window doesn't receive new state
- State propagation broken somewhere in: `UrlStateService` → `ResourceManagementService` → components

### Files Modified This Session

| File | Change |
|------|--------|
| `url-state.service.ts` | Use `Router.events` instead of `ActivatedRoute.queryParams` |
| `url-state.service.ts` | Use `router.url` instead of `route.snapshot` for initialization |
| `panel-popout.component.ts` | Added `autoFetch: false` |

---

## Governing Tactic

**Bug #10 requires deeper investigation into state propagation.**

The `UrlStateService` changes appear correct but state isn't flowing to downstream consumers. Debug logging needed to trace:
1. `UrlStateService.paramsSubject.next()` emissions
2. `ResourceManagementService.watchUrlChanges()` subscription
3. `filters$` observable emissions
4. Component subscriptions receiving updates

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
| #10 | Medium | **IN PROGRESS** | URL-First architecture broken, partial fix applied |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Continue Bug #10** - Add debug logging to trace state propagation
2. **Fix Bug #7** - Checkbox visual state (if #10 resolved)

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
