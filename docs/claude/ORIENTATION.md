# Claude Orientation

**Purpose**: Static infrastructure knowledge for all Claude sessions.

**Do NOT include session-specific information here.** This file only changes when architecture fundamentally changes.

---

## Project Summary

**Generic Discovery Framework** - A domain-agnostic Angular 14 application for browsing and analyzing data. Currently configured for automobile data, designed to work with any domain (agriculture, real estate, etc.).

**Architecture**: PrimeNG-First + URL-First State Management + Configuration-Driven

**Grade**: B+ (84/100) - Production-ready with minor improvements needed

---

## Key Architectural Patterns

1. **URL-First State**: URL is single source of truth. All state changes sync to URL via `UrlStateService`.
2. **Configuration-Driven**: Domain specifics in config files (`domain-config/automobile/`), not code.
3. **PrimeNG-First**: Use PrimeNG components directly. NO custom table wrappers.
4. **Domain-Agnostic Framework**: Code in `framework/` works with ANY domain via adapters.
5. **Pop-out Windows**: Secondary windows via `PanelPopoutComponent` with `BroadcastChannel` inter-window communication.

---

## Project Structure

```
~/projects/generic-prime/           # FRONTEND (this repo)
├── frontend/src/
│   ├── app/                        # App bootstrap, routing
│   ├── framework/                  # Domain-agnostic framework
│   │   ├── components/             # BasePicker, ResultsTable, Charts, etc.
│   │   ├── services/               # UrlState, API, ResourceManagement, etc.
│   │   └── models/                 # Interface definitions
│   └── domain-config/
│       └── automobile/             # Automobile domain implementation
│           ├── models/             # AutoSearchFilters, VehicleResult
│           ├── adapters/           # API adapter, URL mapper
│           └── configs/            # Filter defs, table config, charts
├── k8s/                            # Frontend K8s manifests
└── docs/                           # Documentation

~/projects/data-broker/generic-prime/  # BACKEND (separate repo on host)
├── src/                            # Node.js/Express API source
├── infra/                          # Dockerfile + K8s manifests
└── docs/                           # Backend documentation
```

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 14.2.0 | Core framework |
| **PrimeNG** | 14.2.3 | UI components (table, dropdown, multiselect, panel, etc.) |
| **RxJS** | 7.5.0 | Reactive programming |
| **Angular CDK** | 14.2.7 | Drag-drop, virtual scroll |
| **TypeScript** | 4.7.2 | Language |
| **Plotly.js** | Latest | Charts for statistics panel |
| **Playwright** | 1.57.0 | E2E testing |

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Host Machine: Thor (192.168.0.244)                         │
│  Working Directory: ~/projects/generic-prime (frontend)     │
│  Backend Source: ~/projects/data-broker/generic-prime       │
└─────────────────────────────────────────────────────────────┘
         │
         ├── Kubernetes Cluster (K3s)
         │   ├── Namespace: generic-prime
         │   │   ├── generic-prime-backend-api (2 replicas, v1.5.0)
         │   │   └── generic-prime-frontend (prod deployment)
         │   │
         │   └── Namespace: data
         │       └── elasticsearch (autos-unified, autos-vins indices)
         │
         └── Development Container (Podman)
             └── generic-prime-frontend-dev (port 4205)
```

**Frontend Ports**:
- **4201**: autos-prime-ng (reference implementation in K8s)
- **4205**: generic-prime (development container)
- **80**: K8s ingress (generic-prime.minilab)

**Backend**:
- **K8s Service**: `generic-prime-backend-api` (namespace: generic-prime)
- **API Endpoint**: `http://generic-prime.minilab/api/specs/v1/...`
- **Source**: JavaScript/Express (`~/projects/data-broker/generic-prime/src/`)
- **Image**: `localhost/generic-prime-backend-api:v1.5.0`

**Elasticsearch**:
- **Endpoint**: `elasticsearch.data.svc.cluster.local:9200` (K8s internal)
- **Index: autos-unified** - 4,887 vehicle spec documents
- **Index: autos-vins** - 55,463 VIN records

---

## Development Environment

**All Angular/npm commands run INSIDE the container:**

### Start Dev Server
```bash
cd ~/projects/generic-prime/frontend

# Start container (if not running)
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev

# Run dev server (in container)
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205
```

### Run Commands in Container
```bash
podman exec -it generic-prime-frontend-dev npm install
podman exec -it generic-prime-frontend-dev ng build
podman exec -it generic-prime-frontend-dev npm run test:e2e
podman exec -it generic-prime-frontend-dev sh  # Interactive shell
```

### Backend Deployment (when backend code changes)
```bash
cd ~/projects/data-broker/generic-prime

# Build and import image
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:vX.Y.Z .
podman save localhost/generic-prime-backend-api:vX.Y.Z -o /tmp/backend-vX.Y.Z.tar
sudo k3s ctr images import /tmp/backend-vX.Y.Z.tar
sudo rm /tmp/backend-vX.Y.Z.tar

# Update K8s deployment
kubectl set image deployment/generic-prime-backend-api -n generic-prime \
  backend-api=localhost/generic-prime-backend-api:vX.Y.Z

# Or restart to pick up new image with same tag
kubectl rollout restart deployment/generic-prime-backend-api -n generic-prime
```

---

## Known Data Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Manufacturers | 72 | Verified via Elasticsearch |
| Manufacturer-Model Combos | 881 | Working in picker, paginated |
| Body Classes | 12 | Via `/agg/body_class` endpoint |
| Vehicle Specs (ES) | 4,887 docs | Index: autos-unified |
| VIN Records (ES) | 55,463 docs | Index: autos-vins |

---

## Domain Configuration

**Automobile Domain** (currently active):
- Location: `frontend/src/domain-config/automobile/`
- Filters: Manufacturer, Model, Year, Body Class, Price Range, Mileage
- Models: `AutoSearchFilters`, `VehicleResult`, `VehicleStatistics`
- Adapters: API adapter, URL mapper, cache key builder

**Domain-Agnostic Architecture**:
- To add a new domain, create a folder in `domain-config/` with:
  - `models/` - Domain data structures
  - `adapters/` - API & URL handling
  - `configs/` - Table, filter, chart definitions
  - `chart-sources/` - Chart data sources
- Register in `frontend/src/domain-config/domain-providers.ts`

---

## Testing Policy

- **Unit Tests**: Deferred to dedicated project (NOT in scope)
- **E2E Tests**: Playwright, located in `frontend/e2e/`
- **Manual Testing**: Expected during development

---

**Last Updated**: 2025-12-06
