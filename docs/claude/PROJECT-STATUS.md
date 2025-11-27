# Project Status

**Version**: 1.3
**Timestamp**: 2025-11-27T13:25:00Z
**Updated By**: Backend deployment session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- Backend **DEPLOYED** to Kubernetes (`generic-prime-backend-api:v1.1.0`)
- All endpoints validated and working
- Ready for Bug #11 fix (composite aggregation)

### Port 4201 (autos-prime-ng) - REFERENCE
- Verified unaffected by new deployment
- Continues to serve as working reference

---

## Deployment Completed (2025-11-27)

### What Was Deployed

| Resource | Name | Version |
|----------|------|---------|
| Deployment | `generic-prime-backend-api` | v1.1.0 |
| Service | `generic-prime-backend-api` | ClusterIP:3000 |
| Ingress | `generic-prime-ingress` | Routes `/api` to backend |
| Pods | 2 replicas | Running on Thor |

### Validation Results

| Endpoint | Status | Result |
|----------|--------|--------|
| `/api/specs/v1/manufacturer-model-combinations` | OK | Returns 72 manufacturers |
| `/api/specs/v1/vehicles/details` | OK | Returns 4,887 vehicles |
| `/api/specs/v1/filters/manufacturers` | OK | Returns 72 manufacturers |
| Old service (`auto-discovery.minilab`) | OK | Unaffected |

### No Conflicts with Port 4201

| Aspect | Port 4201 (old) | Port 4205 (new) |
|--------|-----------------|-----------------|
| Namespace | `auto-discovery` | `generic-prime` |
| Ingress Host | `auto-discovery.minilab` | `generic-prime.minilab` |
| Service | `auto-discovery-specs-api` | `generic-prime-backend-api` |

---

## Governing Tactic (Updated)

**Backend deployed. Now fix Bug #11.**

The `/manufacturer-model-combinations` endpoint must be rewritten to use ES composite aggregation for true server-side pagination.

**Bug #11 is now UNBLOCKED and is the immediate priority.**

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Verified via ES |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.1.0` | Deployed |
| **Bug #11 Fix Location** | `elasticsearchService.js` | Line ~50-150 |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | **READY TO FIX** | Backend returns 72 mfrs, needs 881 combos |
| #10 | Medium | Not started | Pop-out statistics breaks with filters |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session: Fix Bug #11

See [NEXT-STEPS.md](NEXT-STEPS.md) for implementation details.

**Summary**: Implement composite aggregation in `elasticsearchService.js` to return 881 manufacturer-model combinations with cursor-based pagination.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
