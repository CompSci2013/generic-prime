# Claude Orientation

**Purpose**: Bootstrap context for fresh Claude sessions.
**Read Time**: ~3 minutes

**IMPORTANT**: Read [PROJECT-STATUS.md](PROJECT-STATUS.md) immediately after this file.

---

## Project Summary

**Generic Discovery Framework** - A domain-agnostic Angular 14 application for browsing and analyzing data. Currently configured for automobile data, but designed to work with any domain (agriculture, real estate, etc.).

**Architecture**: PrimeNG-First + URL-First State Management + Configuration-Driven

---

## Two Application Versions

| Port | Name | Status | URL |
|------|------|--------|-----|
| **4201** | autos-prime-ng | **REFERENCE** (stable) | `http://192.168.0.244:4201/discover` |
| **4205** | generic-prime | **IN DEVELOPMENT** | `http://192.168.0.244:4205/discover` |

**Goal**: Port 4205 should behave like port 4201.

---

## Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│  Host Machine: Thor (192.168.0.244)                         │
│  Working Directory: ~/projects/generic-prime (frontend)     │
│  Backend Source:    ~/projects/data-broker/generic-prime    │
└─────────────────────────────────────────────────────────────┘
         │
         ├── Kubernetes Cluster
         │   ├── Namespace: generic-prime
         │   │   ├── generic-prime-backend-api (2 replicas)
         │   │   └── generic-prime-frontend (prod deployment)
         │   │
         │   └── Namespace: data
         │       └── elasticsearch (autos-unified, autos-vins indices)
         │
         └── Development Container
             └── generic-prime-frontend-dev (podman, port 4205)
```

**Backend API**: `http://generic-prime.minilab/api/specs/v1/...`
**Backend Source**: `~/projects/data-broker/generic-prime/src/`
**Elasticsearch**: `kubectl port-forward -n data svc/elasticsearch 9200:9200`

---

## Development Commands

**All Angular/npm commands run INSIDE the container:**

```bash
# Start dev server
cd ~/projects/generic-prime/frontend
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Run commands in container
podman exec -it generic-prime-frontend-dev <command>
podman exec -it generic-prime-frontend-dev npm install
podman exec -it generic-prime-frontend-dev ng build
podman exec -it generic-prime-frontend-dev sh  # Interactive shell
```

**Backend Deployment (when backend code changes):**

```bash
# From Thor - build, import to k3s, and clean up in one command
cd ~/projects/data-broker/generic-prime
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:vX.Y.Z .
podman save localhost/generic-prime-backend-api:vX.Y.Z -o /tmp/backend-vX.Y.Z.tar && \
  sudo k3s ctr images import /tmp/backend-vX.Y.Z.tar && \
  sudo rm /tmp/backend-vX.Y.Z.tar

# Update deployment to use new image
kubectl set image deployment/generic-prime-backend-api -n generic-prime \
  backend-api=localhost/generic-prime-backend-api:vX.Y.Z

# Or restart to pick up new image with same tag
kubectl rollout restart deployment/generic-prime-backend-api -n generic-prime
```

---

## Key Architectural Patterns

1. **URL-First**: URL is single source of truth. All state changes sync to URL.
2. **Configuration-Driven**: Domain specifics in config files (`domain-config/automobile/`), not code.
3. **PrimeNG-First**: Use PrimeNG components directly. NO custom table wrappers.
4. **Generic Framework**: Framework code (`framework/`) works with ANY domain via adapters.

---

## Project Structure

```
~/projects/generic-prime/           # FRONTEND
├── frontend/src/
│   ├── app/                        # App bootstrap, routing
│   ├── framework/                  # Domain-agnostic framework
│   │   ├── components/             # BasePicker, ResultsTable, Charts, etc.
│   │   ├── services/               # UrlState, ResourceManagement, etc.
│   │   └── models/                 # Interfaces
│   └── domain-config/
│       └── automobile/             # Automobile domain implementation
│           ├── models/             # AutoSearchFilters, VehicleResult
│           ├── adapters/           # API adapter, URL mapper
│           └── configs/            # Table, picker, filter definitions
├── k8s/                            # Frontend K8s manifests + ingress
└── docs/                           # Documentation (you are here)

~/projects/data-broker/generic-prime/  # BACKEND (moved here)
├── src/                            # Backend API source
├── infra/                          # Dockerfile + K8s manifests
└── docs/                           # Backend documentation
```

---

## Quality Status

**Grade**: B+ (84/100) - Production-ready with minor improvements needed

**Testing Policy**: Do NOT write unit tests. Testing deferred to dedicated project.

---

## What To Do Next

1. Read [PROJECT-STATUS.md](PROJECT-STATUS.md) for current project state and approach
2. Read [NEXT-STEPS.md](NEXT-STEPS.md) for actionable items
3. Consult [DOCUMENT-MAP.md](DOCUMENT-MAP.md) to find relevant documentation
4. Discuss with developer what to work on

---

## Critical Rules

1. **Do NOT modify frontend code** without understanding the full data flow
2. **Data-First Investigation**: When debugging, query Elasticsearch directly before touching code
3. **URL-First**: Never call `router.navigate()` directly; use `UrlStateService`
4. **OnPush + detectChanges()**: Pop-out windows require `detectChanges()`, not `markForCheck()`
5. **No Unit Tests**: Testing is out of scope for this project

---

**Last Updated**: 2025-11-27 (added backend deployment commands)
