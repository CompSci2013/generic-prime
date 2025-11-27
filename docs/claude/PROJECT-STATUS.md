# Project Status

**Version**: 1.1
**Timestamp**: 2025-11-27T14:30:00Z
**Updated By**: Backend investigation session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- Backend investigation **COMPLETE** - root cause identified
- **Backend rewrite required** before frontend work can continue
- Configuration-driven architecture (good design, incomplete execution)

### Port 4201 (autos-prime-ng) - REFERENCE
- Largely bug-free and functional
- Serves as the working reference for expected behavior

---

## Investigation Findings (2025-11-27)

### Bug #11 Root Cause: CONFIRMED

**Problem**: `/manufacturer-model-combinations` endpoint uses **in-memory pagination** disguised as server-side pagination.

| Issue | Current | Required |
|-------|---------|----------|
| ES Query | Nested `terms` with `size: 100` | Composite aggregation with cursor |
| Pagination | JavaScript `.slice()` | ES `after` cursor |
| Scalability | ~10K max rows | Millions of rows |
| Response | 72 manufacturers (nested) | 881 combinations (flat) |

### Verified Data (Direct ES Queries)

| Metric | Count | Verified |
|--------|-------|----------|
| Unique manufacturers | 72 | ✓ |
| Unique manufacturer-model combinations | 881 | ✓ |
| Vehicle specifications (`autos-unified`) | 4,887 | ✓ |
| VIN records (`autos-vins`) | 55,463 | ✓ |

### Data Truncation Identified

| Manufacturer | Actual Models | API Returns | Missing |
|--------------|---------------|-------------|---------|
| Chevrolet | 112 | 100 | 12 |
| Ford | 111 | 100 | 11 |
| **Total** | | | **23** |

---

## Architectural Requirements Documented

Two non-negotiable requirements identified and documented:

1. **Frontend must accept ANY data structure** (flat or nested)
   - Future domains will have APIs we cannot control
   - See: [docs/plan/07-DATA-MAPPER-SERVICE.md](../plan/07-DATA-MAPPER-SERVICE.md)

2. **Server-side pagination is mandatory**
   - Expect millions of rows
   - No hardcoded size limits
   - No in-memory pagination disguised as server-side

---

## Decision Made

**Backend fix deferred to next session.**

Reason: Backend rewrite is significant (~2-4 hours). Session documented findings completely for continuity.

---

## Governing Tactic (Updated)

**Fix backend API before any frontend work.**

The `/manufacturer-model-combinations` endpoint must be rewritten to use ES composite aggregation for true server-side pagination.

**DO NOT modify frontend code until backend is fixed.**

---

## Known Facts (Updated)

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Verified via ES |
| Backend Source | `backend-specs/src/` | JavaScript/Express |
| Backend Image | `localhost/generic-prime-backend:v1.0.1` | K8s deployment |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | ROOT CAUSE FOUND | Backend pagination is in-memory, needs composite agg |
| #10 | Medium | Not started | Pop-out statistics panel breaks with pre-selected filters |
| #7 | Low | Not started | Checkboxes remain visually checked after clearing |

---

## Documentation Created This Session

1. [docs/plan/07-DATA-MAPPER-SERVICE.md](../plan/07-DATA-MAPPER-SERVICE.md)
   - Frontend flexibility requirements
   - DataMapperService design (future work)

2. [docs/investigation/BACKEND-PAGINATION-ANALYSIS.md](../investigation/BACKEND-PAGINATION-ANALYSIS.md)
   - Complete backend analysis
   - ES composite aggregation solution
   - Tested queries
   - Implementation plan

---

## Next Session: Fix Backend

See [NEXT-STEPS.md](NEXT-STEPS.md) for detailed actions.

**Summary**: Rewrite `getManufacturerModelCombinations()` to use ES composite aggregation with cursor-based pagination.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
