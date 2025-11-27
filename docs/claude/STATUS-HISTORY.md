# Status History

**Purpose**: Archive of previous PROJECT-STATUS.md versions.

**Usage**: Before updating PROJECT-STATUS.md, copy the current version here with a separator.

---

## Archive

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
