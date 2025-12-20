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
┌───────────────────────────────────────────────────────────────────┐
│  Development Host: Thor (192.168.0.244)                           │
│  Working Directory: ~/projects/generic-prime (frontend)           │
│  Backend Source: ~/projects/data-broker/generic-prime             │
└───────────────────────────────────────────────────────────────────┘
         │
         ├── Kubernetes Cluster (K3s)
         │   ├── Control Plane: Loki (192.168.0.110)
         │   │   ├── K3s API Server (port 6443)
         │   │   ├── Traefik Ingress Controller (port 80)
         │   │   ├── Persistent Storage (/srv/k3s)
         │   │   └── Other cluster services
         │   │
         │   ├── Worker Node: Thor (192.168.0.244)
         │   │   ├── Namespace: generic-prime
         │   │   │   ├── generic-prime-backend-api (2 replicas, v1.5.0)
         │   │   │   └── generic-prime-frontend (prod deployment)
         │   │   │
         │   │   └── Namespace: data
         │   │       └── elasticsearch (autos-unified, autos-vins indices)
         │   │
         │   └── Pod distribution: May run on either node
         │
         └── Development Container (Podman on Thor)
             └── generic-prime-frontend-dev (port 4205)
```

**Frontend Access**:
- **4205**: generic-prime development server (Thor: 192.168.0.244:4205)
- **80**: K8s ingress via Traefik (Loki: generic-prime.minilab)
- **4201**: autos-prime-ng (reference implementation in K8s)

**Backend**:
- **K8s Service**: `generic-prime-backend-api` (namespace: generic-prime)
- **API Endpoint**: `http://generic-prime.minilab/api/specs/v1/...`
  - Resolves to **Loki (192.168.0.110)** - Traefik Ingress on control plane
  - Routed to backend pods (may run on Thor or Loki)
- **Source**: JavaScript/Express (`~/projects/data-broker/generic-prime/src/`)
- **Image**: `localhost/generic-prime-backend-api:v1.5.0`

**Elasticsearch**:
- **Endpoint**: `elasticsearch.data.svc.cluster.local:9200` (K8s internal)
- **Index: autos-unified** - 4,887 vehicle spec documents
- **Index: autos-vins** - 55,463 VIN records

---

## Backend Project Structure

The backend is a **separate project** under the multi-application `data-broker` umbrella:

```
~/projects/data-broker/                    # Multi-project backend umbrella
  └── generic-prime/                       # OUR BACKEND (separate repo)
      ├── infra/
      │   ├── Dockerfile                  # Image: localhost/generic-prime-backend-api
      │   └── k8s/
      │       ├── deployment.yaml         # Deploys to namespace: generic-prime (2 replicas)
      │       └── service.yaml            # Service: generic-prime-backend-api:3000 (ClusterIP)
      ├── src/                            # Node.js/Express API source
      └── docs/                           # Backend documentation
```

**Important**: Backend source code is NOT in this repo (`~/projects/generic-prime`). See `~/projects/data-broker/generic-prime/src/` for backend development.

---

## Docker/Podman Infrastructure

### Container Images

| Image | Location | Purpose | Network |
|-------|----------|---------|---------|
| `localhost/generic-prime-frontend:dev` | `Dockerfile.dev` | Development environment for ng serve | `--network host` |
| `localhost/generic-prime-frontend:prod` | `Dockerfile.prod` | Production nginx server | Built for K8s |
| `mcr.microsoft.com/playwright:v1.57.0-jammy` | `Dockerfile.e2e` | E2E test runner | Isolated + hardcoded /etc/hosts |
| `localhost/generic-prime-backend-api:v1.5.0` | `~/projects/data-broker/generic-prime/infra/Dockerfile` | Backend API (Node.js/Express) | K8s ClusterIP |

### Frontend Development Container

**Image**: `localhost/generic-prime-frontend:dev`
**Location**: `frontend/Dockerfile.dev`

```bash
# Start the dev container (with --network host for K8s service access)
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev

# Run Angular dev server (port 4205)
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Run any npm command in container
podman exec -it generic-prime-frontend-dev npm install
podman exec -it generic-prime-frontend-dev ng build
podman exec -it generic-prime-frontend-dev npm run test:e2e
podman exec -it generic-prime-frontend-dev sh  # Interactive shell
```

**Key Flag**: `--network host` allows the dev container to access K8s services via hostnames like `generic-prime.minilab`

### E2E Test Container

**Image**: `mcr.microsoft.com/playwright:v1.57.0-jammy`
**Location**: `frontend/Dockerfile.e2e`
**Special Config**: Hardcoded /etc/hosts entry for backend access

```bash
# Run E2E tests (dev container - see container-specific curl commands below)
podman exec -it generic-prime-frontend-dev npm run test:e2e

# Or run from e2e image directly
docker run --rm \
  -v $(pwd):/app \
  -w /app/frontend \
  mcr.microsoft.com/playwright:v1.57.0-jammy \
  npm run test:e2e
```

**Why /etc/hosts entry?**: The E2E container runs in isolated network mode. The `Dockerfile.e2e` adds:
```
192.168.0.110 generic-prime-dockview generic-prime-dockview.minilab
```
This maps `generic-prime-dockview.minilab` to Loki's IP (192.168.0.110), allowing curl/API calls to reach the Traefik ingress and backend API.

### Backend Build & Deployment

**Source**: `~/projects/data-broker/generic-prime/`

```bash
cd ~/projects/data-broker/generic-prime

# Build image
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:vX.Y.Z .

# Save and import into K3s
podman save localhost/generic-prime-backend-api:vX.Y.Z -o /tmp/backend-vX.Y.Z.tar
sudo k3s ctr images import /tmp/backend-vX.Y.Z.tar
sudo rm /tmp/backend-vX.Y.Z.tar

# Update K8s deployment (set new image)
kubectl set image deployment/generic-prime-backend-api -n generic-prime \
  backend-api=localhost/generic-prime-backend-api:vX.Y.Z

# Or restart to pick up new image (if tag is same)
kubectl rollout restart deployment/generic-prime-backend-api -n generic-prime
```

---

## Network Configuration & Debugging

### Frontend Access: Development vs Production

**DEVELOPMENT** (Current active environment):
- **URL**: `http://192.168.0.244:4205` (Thor IP + port)
- **Why**: Running `ng serve` in development container on Thor
- **Access from**: Windows: Can use IP directly or add to hosts → `192.168.0.244 thor`
- **Backend API**: Hardcoded to `http://generic-prime.minilab/api/specs/v1/`
  - Must resolve to **Loki (192.168.0.110)** for Traefik ingress routing

**PRODUCTION** (When frontend deployed to Kubernetes):
- **URL**: `http://generic-prime.minilab/` (fully qualified domain name)
- **Why**: Frontend served via Kubernetes Ingress + Traefik on Loki control plane
- **Access from**: Windows: Must add to hosts → `192.168.0.110 generic-prime.minilab` (Loki)
- **Backend API**: Same `http://generic-prime.minilab/api/specs/v1/` (via Traefik ingress on Loki)

### /etc/hosts Entries (Windows Client)

Add these lines to `C:\Windows\System32\drivers\etc\hosts`:

```
192.168.0.244   thor thor.minilab
192.168.0.110   loki loki.minilab generic-prime.minilab generic-prime-dockview.minilab
```

**Explanation**:
- `192.168.0.244 thor` - Direct access to Thor for development server (port 4205)
- `192.168.0.110 generic-prime.minilab` - **CRITICAL**: Points to Loki control plane where Traefik ingress runs
  - Routes both development and production API requests through Traefik
  - Traefik on Loki forwards `/api` requests to backend pods (wherever they run)
  - This is required for both dev and production environments to access the backend API

### /etc/hosts Entries (Thor Host - Already Configured)

Thor should have these entries in `/etc/hosts`:

```
192.168.0.110   loki loki.minilab
192.168.0.244   thor thor.minilab
192.168.0.110   generic-prime.minilab generic-prime-dockview.minilab
```

**Note**: This matches Windows hosts file for consistency.

**Key Hostnames for generic-prime**:
- `generic-prime.minilab` → `192.168.0.110` (Loki) - Traefik ingress (on control plane)
  - Routes both development and production requests through Traefik
  - Traefik forwards `/api` requests to backend pods
- `generic-prime-dockview.minilab` → `192.168.0.110` (Loki) - Alternative backend access (E2E fallback)

### Network Access Paths

**DEVELOPMENT** (Current):
```
Windows Browser (http://192.168.0.244:4205)
  ↓
  Direct to Thor:4205 (ng serve dev container)
  ↓
  Frontend makes API calls to: http://generic-prime.minilab/api/specs/v1/
  ↓ (resolves to 192.168.0.110 via /etc/hosts)
  Traefik Ingress on Loki:80 (control plane)
  ↓
  Traefik routes /api → generic-prime-backend-api:3000 (service)
  ↓
  Backend Pod (Node.js Express) - may run on Thor or Loki
  ↓
  Elasticsearch: elasticsearch.data.svc.cluster.local:9200
```

**PRODUCTION** (When frontend deployed to K8s):
```
Windows Browser (http://generic-prime.minilab/)
  ↓ (resolves to 192.168.0.110 via /etc/hosts)
  Traefik Ingress on Loki:80 (control plane)
  ↓
  Traefik routes:
    / → generic-prime-frontend:80 (Frontend Pod)
    /api → generic-prime-backend-api:3000 (Backend Pod)
  ↓
  Backend Pod (Node.js Express) - may run on Thor or Loki
  ↓
  Elasticsearch: elasticsearch.data.svc.cluster.local:9200
```

**Key Architecture Point**: Both development and production access the backend through **Loki's Traefik ingress** (192.168.0.110). Pod workload distribution (Thor vs Loki) is handled by Kubernetes service routing and doesn't affect external access.

### Backend API Testing Across Three Environments

**VERIFIED WORKING APPROACH**: All three environments access the backend via `generic-prime.minilab/api/specs/v1/` (Traefik ingress on Loki).

During development, the frontend is configured to use `http://generic-prime.minilab/api/specs/v1/` even though the frontend itself runs on `192.168.0.244:4205`. This works because:
1. The hostname `generic-prime.minilab` is mapped in `/etc/hosts` to `192.168.0.110` (Loki control plane)
2. Loki runs Traefik ingress controller on port 80
3. Traefik routes `/api` requests to backend pods wherever they run (Thor or Loki)

#### **1. Thor Host SSH**

```bash
# Test vehicle data retrieval (via Traefik ingress)
curl -s "http://generic-prime.minilab/api/specs/v1/vehicles/details?manufacturer=Brammo&size=2" | jq .

# Verify backend pods are running
kubectl get pods -n generic-prime
```

**Expected response**:
```json
{
  "total": 5,
  "page": 1,
  "size": 2,
  "results": [
    {
      "vehicle_id": "nhtsa-ram-brammo-street-bikes-1972",
      "manufacturer": "Brammo",
      "model": "Brammo Street Bikes",
      "year": 1972,
      "body_class": "Sedan"
    }
  ],
  "statistics": {
    "byManufacturer": {"Brammo": 5},
    "totalCount": 5
  }
}
```

#### **2. Development Container (Podman exec)**

The dev container has `--network host`, so it can access `generic-prime.minilab` just like Thor SSH:

```bash
# The dev container doesn't have curl, so use Node.js
podman exec generic-prime-dev node -e "
const http = require('http');
const options = {
  hostname: 'generic-prime.minilab',
  port: 80,
  path: '/api/specs/v1/vehicles/details?manufacturer=Brammo&size=1',
  method: 'GET'
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total records:', json.total);
      console.log('First vehicle:', json.results[0]?.manufacturer, '-', json.results[0]?.model);
    } catch(e) {
      console.error('Parse error:', e.message);
    }
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.end();
"
```

**Expected output**: `Total records: 5` and `First vehicle: Brammo - Brammo Street Bikes`

#### **3. E2E Container (Podman run with --network host)**

The E2E container has `/etc/hosts` entry for `generic-prime.minilab` pointing to `192.168.0.244`:

```bash
# Test vehicle data
podman run --rm --network=host --entrypoint node localhost/generic-prime-e2e:latest -e "
const http = require('http');
const options = {
  hostname: 'generic-prime.minilab',
  port: 80,
  path: '/api/specs/v1/vehicles/details?manufacturer=Brammo&size=1',
  method: 'GET'
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Total records:', json.total);
      console.log('First vehicle:', json.results[0]?.manufacturer, '-', json.results[0]?.model);
      process.exit(0);
    } catch(e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
});
req.on('error', (e) => {
  console.error('Error: ' + e.message);
  process.exit(1);
});
req.end();
setTimeout(() => process.exit(2), 3000);
"
```

Or run the full E2E test suite to verify frontend + backend integration:
```bash
timeout 300 podman run --rm --network=host generic-prime-e2e 2>&1 | tail -50
```

### Troubleshooting: Cannot Access Backend API

**Access path**: All three environments → `generic-prime.minilab` (via /etc/hosts to Loki) → Traefik ingress on Loki:80 → Backend service (port 3000).

**Quick Checklist**:
1. ✅ Verify `/etc/hosts` has the correct entry:
   ```bash
   grep generic-prime /etc/hosts
   # Expected: 192.168.0.110 generic-prime.minilab
   ```

2. ✅ Verify backend pods are running:
   ```bash
   kubectl get pods -n generic-prime
   # Expected: 2 pods (generic-prime-backend-api-*) in Running state
   ```

3. ✅ Verify backend service exists:
   ```bash
   kubectl get svc -n generic-prime
   # Expected: generic-prime-backend-api   ClusterIP   10.43.254.90   <none>        3000/TCP
   ```

4. ✅ Verify Traefik ingress is configured:
   ```bash
   kubectl get ingress -n generic-prime
   # Expected: generic-prime-ingress with HOST: generic-prime.minilab
   ```

5. ✅ Test from Thor SSH:
   ```bash
   curl -s "http://generic-prime.minilab/api/specs/v1/vehicles/details?manufacturer=Brammo&size=1" | jq '.total'
   # Expected: 5
   ```

6. ✅ Verify dev container is running:
   ```bash
   podman ps | grep generic-prime-dev
   # Expected: generic-prime-dev container with --network host
   ```

7. ✅ Verify E2E container image exists:
   ```bash
   podman images | grep generic-prime-e2e
   # If not found, rebuild: podman build -f frontend/Dockerfile.e2e -t localhost/generic-prime-e2e:latest .
   ```

8. ✅ Check backend logs:
   ```bash
   kubectl logs -n generic-prime deployment/generic-prime-backend-api --tail=50
   ```

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

# Run dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205
```

### Run Commands in Container
```bash
podman exec -it generic-prime-frontend-dev npm install
podman exec -it generic-prime-frontend-dev ng build
podman exec -it generic-prime-frontend-dev npm run test:e2e
podman exec -it generic-prime-frontend-dev sh  # Interactive shell
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

**Last Updated**: 2025-12-20

**Session 22 Update**: Corrected infrastructure documentation to reflect actual Kubernetes architecture:
- Loki is the control plane (not Thor)
- Thor is a worker node only
- Windows hosts file should point to Loki (192.168.0.110) for generic-prime.minilab
- Traefik ingress runs on Loki control plane, not Thor
- Updated all network access paths and troubleshooting procedures
