# Project Status

**Version**: 1.2
**Timestamp**: 2025-11-27T15:45:00Z
**Updated By**: Backend migration session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- Backend **MIGRATED** to `~/projects/data-broker/generic-prime/`
- Backend needs deployment and validation before Bug #11 fix
- Configuration-driven architecture (good design, incomplete execution)

### Port 4201 (autos-prime-ng) - REFERENCE
- Largely bug-free and functional
- Serves as the working reference for expected behavior

---

## Migration Completed (2025-11-27)

### Backend Moved to data-broker

The backend API has been moved from `~/projects/generic-prime/backend-specs/` to `~/projects/data-broker/generic-prime/`.

**New Location**: `~/projects/data-broker/generic-prime/`

```
data-broker/generic-prime/
├── docs/
│   └── README.md
├── infra/
│   ├── Dockerfile
│   └── k8s/
│       ├── deployment.yaml
│       └── service.yaml
├── package.json
└── src/
    ├── index.js
    ├── config/elasticsearch.js
    ├── controllers/specsController.js
    ├── routes/specsRoutes.js
    ├── services/elasticsearchService.js   ← Bug #11 fix goes here
    └── utils/
```

### Naming Changes

| Item | Old | New |
|------|-----|-----|
| K8s Deployment | `generic-prime-backend` | `generic-prime-backend-api` |
| K8s Service | `generic-prime-backend` | `generic-prime-backend-api` |
| Docker Image | `generic-prime-backend` | `generic-prime-backend-api` |
| package.json name | `auto-discovery-specs-api` | `generic-prime-backend-api` |

### Files Remaining in generic-prime/k8s/

- `namespace.yaml` - shared namespace
- `ingress.yaml` - updated to reference `generic-prime-backend-api`
- `frontend-deployment.yaml`
- `frontend-service.yaml`

---

## Governing Tactic (Updated)

**Deploy and validate backend API, THEN fix Bug #11.**

1. Build new container image with renamed service
2. Deploy to Kubernetes
3. Validate endpoints respond correctly
4. THEN proceed with Bug #11 composite aggregation fix

**DO NOT modify frontend code until backend is deployed and validated.**

---

## Known Facts (Updated)

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Verified via ES |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | **MOVED** |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.1.0` | **RENAMED** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | BLOCKED (deploy first) | Backend needs composite aggregation |
| #10 | Medium | Not started | Pop-out statistics breaks with filters |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session: Deploy Backend

See [NEXT-STEPS.md](NEXT-STEPS.md) for detailed actions.

**Summary**: Build and deploy `generic-prime-backend-api:v1.1.0`, validate it works, then proceed with Bug #11 fix.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
