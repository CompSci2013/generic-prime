# Project Status

**Version**: 2.0
**Timestamp**: 2025-11-27T19:00:00Z
**Updated By**: Results Table isolation testing session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Results Table isolation testing IN PROGRESS**
- **Dropdown improvements implemented** - Dynamic options from backend
- **Generic /agg/:field endpoint added** - Backend v1.5.0
- Discover page in **ISOLATION MODE** - testing Picker + Results Table
- Backend at `generic-prime-backend-api:v1.5.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-27 - Afternoon)

### Results Table Isolation Testing

Testing Results Table component alongside Picker for easier testing.

| Test | Status |
|------|--------|
| Results Table loads data | PASS |
| Filters update URL | PASS |
| Filter clearing removes from URL | PASS |
| Dropdown search works | PASS |
| Dropdown options sorted alphabetically | PASS |
| All body classes available | PASS |

### Dropdown Improvements

Implemented data-driven dropdown options instead of hard-coded values:

| Component | Change |
|-----------|--------|
| Backend `elasticsearchService.js` | Added generic `getAggregation()` function |
| Backend `specsController.js` | Added `getAggregationHandler` controller |
| Backend `specsRoutes.js` | Added `GET /agg/:field` route |
| Frontend `domain-config.interface.ts` | Added `optionsEndpoint` to FilterDefinition |
| Frontend `automobile.filter-definitions.ts` | Changed bodyClass to use `optionsEndpoint: 'body_class'` |
| Frontend `results-table.component.ts` | Added dynamic option loading from API |
| Frontend `results-table.component.html` | Added `[filter]="true"` to dropdown for search |

### API Changes (v1.5.0)

New generic aggregation endpoint:
```
GET /api/specs/v1/agg/:field?order=alpha&limit=1000
Response: {
  field: "body_class",
  values: [
    { value: "Convertible", count: 21 },
    { value: "Coupe", count: 494 },
    ...
  ]
}
```

### Filter Clearing Fix

Fixed bug where clearing filters didn't remove them from URL:
- Modified `updateFilters()` to explicitly set `null` for removed params
- Modified `clearFilters()` to use same pattern

### Bugs Found

| Bug | Description | Priority | Status |
|-----|-------------|----------|--------|
| #13 | Dropdown keyboard navigation broken | Medium | **NEW** |
|     | Down arrow should highlight options, Enter/Space should select | | Not started |

---

## Governing Tactic

**Continue isolation testing approach.**

1. ~~Test QueryControl in isolation~~ DONE
2. ~~Test Picker in isolation~~ DONE
3. Test Statistics in isolation
4. ~~Test Results in isolation~~ IN PROGRESS
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
| Unique Body Classes | 12 | Via /agg/body_class |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.5.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | **RESOLVED** | Picker shows 881 combos with server-side pagination |
| #10 | Medium | **RESOLVED** | Pop-out communication working |
| #12 | Low | **RESOLVED** | Picker search partial match (changed from fuzzy to wildcard) |
| #13 | Medium | Not started | Dropdown keyboard navigation (arrow keys, Enter/Space) broken |
| #7 | Low | Not started | Checkboxes stay checked after clearing |
| NEW | Low | Not started | URL params are case sensitive |

---

## Next Session

1. **Fix Bug #13** - Dropdown keyboard navigation (may be PrimeNG issue)
2. **Test Statistics in isolation** - Swap Picker for Statistics panel
3. **Fix Bug #7** - Checkbox visual state
4. **Re-enable all panels** when individually verified

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
