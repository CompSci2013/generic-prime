# Status History

**Purpose**: Archive of previous PROJECT-STATUS.md versions.

**Usage**: Before updating PROJECT-STATUS.md, copy the current version here with a separator.

---

## Archive

---

## Version 1.1 - 2025-11-27T14:30:00Z

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
   - See: docs/plan/07-DATA-MAPPER-SERVICE.md

2. **Server-side pagination is mandatory**
   - Expect millions of rows
   - No hardcoded size limits
   - No in-memory pagination disguised as server-side

---

## Governing Tactic

**Fix backend API before any frontend work.**

The `/manufacturer-model-combinations` endpoint must be rewritten to use ES composite aggregation for true server-side pagination.

**DO NOT modify frontend code until backend is fixed.**

---

## Known Facts

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

## Version 1.0 - 2025-11-27T06:15:00Z

# Project Status

**Version**: 1.0
**Timestamp**: 2025-11-27T06:15:00Z
**Updated By**: Documentation session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- A significant portion of the application has been written
- **Riddled with bugs** - multiple known issues affecting core functionality
- Configuration-driven architecture (good design, incomplete execution)

### Port 4201 (autos-prime-ng) - REFERENCE
- Largely bug-free and functional
- **Not easy to use or extend** - legacy implementation patterns
- Serves as the working reference for expected behavior

---

## Key Problem

**Constant confusion over data sources and infrastructure.**

There has been ongoing uncertainty about:
- Where application data is coming from
- How data is being served from an infrastructure perspective
- Whether backend services are correct

---

## Pragmatic Tactic (Current Approach)

**Backend-first investigation before any frontend work.**

1. **Discover backend resources** - Identify what backend services port 4205 is actually using
2. **Examine source code** - Read backend services, controllers, and routes
3. **Verify with Elasticsearch** - Use curl commands to directly query ES indices and confirm data correctness
4. **Decision point**: Based on findings:
   - If backend is wrong → Fix backend first
   - If backend is correct → Resume frontend bug fixing

**DO NOT modify frontend code until backend is verified.**

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Backend Namespace | `generic-prime` | K8s namespace |
| Backend Service | `generic-prime-backend` | Port 3000 |
| API Base URL | `http://generic-prime.minilab/api/specs/v1/` | Via ingress |

---

## Critical Bugs

| Bug | Severity | Summary |
|-----|----------|---------|
| #11 | CRITICAL | Picker shows 72 entries instead of ~881 manufacturer-model combinations |
| #10 | Medium | Pop-out statistics panel breaks with pre-selected filters |
| #7 | Low | Checkboxes remain visually checked after clearing |

---

## Session Instructions

1. **Start with backend investigation** - Do not touch frontend
2. **Query Elasticsearch directly** - Verify data structure and counts
3. **Read backend source code** - Understand what APIs actually do
4. **Document findings** - Update this status after investigation
5. **Make decision** - Fix backend OR proceed to frontend

---

## Next Session Actions

- [ ] Port-forward Elasticsearch: `kubectl port-forward -n data svc/elasticsearch 9200:9200`
- [ ] Query ES indices to verify document counts and structure
- [ ] Locate backend source: `~/projects/generic-prime/backend-specs/`
- [ ] Trace API routes for `/manufacturer-model-combinations` endpoint
- [ ] Compare backend response with raw ES data
- [ ] Document findings and update PROJECT-STATUS.md

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**

---

<!--
TEMPLATE FOR ARCHIVING:

## Version X.X - YYYY-MM-DDTHH:MM:SSZ

[Paste full content of PROJECT-STATUS.md here]

---

-->
