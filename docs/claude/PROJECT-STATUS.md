# Project Status

**Version**: 1.4
**Timestamp**: 2025-11-27T14:15:00Z
**Updated By**: Bug #11 fix session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Bug #11 FIXED** - Backend returns 881 combinations (was 72)
- Backend upgraded to `generic-prime-backend-api:v1.2.0`
- Frontend picker config updated for flat format
- Ready for frontend testing

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Bug #11 Fix Completed (2025-11-27)

### What Changed

| Component | Before | After |
|-----------|--------|-------|
| ES Query | Nested `terms` (size: 100) | Composite aggregation |
| Pagination | In-memory `.slice()` | ES cursor (`afterKey`) |
| Response | 72 manufacturers (nested) | 881 combinations (flat) |
| Total Count | Manufacturer count | Cardinality of combos |

### Files Modified

**Backend** (`~/projects/data-broker/generic-prime/`):
- `src/services/elasticsearchService.js` - Composite aggregation + cardinality
- `src/controllers/specsController.js` - Cursor param handling
- `infra/k8s/deployment.yaml` - v1.1.0 → v1.2.0

**Frontend** (`~/projects/generic-prime/frontend/`):
- `src/domain-config/automobile/configs/automobile.picker-configs.ts` - Flat format, client pagination

### API Changes

**Old (v1.1.0):**
```
GET /manufacturer-model-combinations?page=1&size=50
→ { "data": [{ "manufacturer": "Ford", "models": [...] }], "total": 72 }
```

**New (v1.2.0):**
```
GET /manufacturer-model-combinations?size=50
→ { "data": [{ "manufacturer": "Ford", "model": "F-150", "count": 23 }], "total": 881, "afterKey": {...} }
```

### Deployment

| Resource | Version | Status |
|----------|---------|--------|
| Backend Image | `localhost/generic-prime-backend-api:v1.2.0` | Deployed |
| Backend Pods | 2 replicas | Running |
| API Endpoint | `/api/specs/v1/manufacturer-model-combinations` | Verified (881 total) |

---

## Governing Tactic (Updated)

**Bug #11 fixed. Test frontend, then proceed to Bug #10 or #7.**

Frontend picker has been updated to use flat format with client-side pagination.
Need to verify the UI works correctly with the new API response.

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | **881** | **NOW RETURNED BY API** |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.2.0` | **UPDATED** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | **FIXED** | API now returns 881 combos with cursor pagination |
| #10 | Medium | Not started | Pop-out statistics breaks with filters |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Test frontend** - Start dev server, verify picker shows 881 combinations
2. **Fix Bug #10** - Pop-out statistics panel
3. **Fix Bug #7** - Checkbox visual state

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
