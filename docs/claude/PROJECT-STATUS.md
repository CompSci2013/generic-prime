# Project Status

**Version**: 2.9
**Timestamp**: 2025-12-06T19:00:00Z
**Updated By**: Backend API Documentation & Cleanup Session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT

**Application**: Fully functional Angular 14 discovery interface
- All 4 panels operational (Query Control, Picker, Statistics, Results Table)
- Drag-drop, collapse, and pop-out functionality working
- Dark theme (PrimeNG lara-dark-blue) active
- Panel headers streamlined with consistent compact design pattern

**Backend**: `generic-prime-backend-api:v1.5.0` (Kubernetes)
- Elasticsearch integration: autos-unified (4,887 docs), autos-vins (55,463 docs)
- API endpoint: `http://generic-prime.minilab/api/specs/v1/`

**Domains**: Automobile (only domain currently active)

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected, serves as working reference

---

## Known Bugs

| Bug | Component | Severity | Status |
|-----|-----------|----------|--------|
| #13 | p-dropdown (Query Control) | Medium | Not Started |
| #7 | p-multiSelect (Body Class) | Low | Not Started |

**Bug #13**: Keyboard navigation broken with `[filter]="true"`
- Arrow keys should highlight options, currently do nothing
- Enter/Space should select, currently do nothing
- Mouse click works (only workaround)

**Bug #7**: Visual state bug - checkboxes remain checked after clearing filters
- Actual filtering works correctly
- Only visual state is wrong

---

## What Changed This Session

**Session 2: Backend API Configuration & Documentation Cleanup**

### 1. Fixed generic-prime-dockview Pollution
- **Root Cause Found**: Development environment configuration incorrectly used `generic-prime-dockview.minilab` instead of proper `generic-prime.minilab`
- **Files Fixed**:
  - `frontend/src/environments/environment.ts`: Changed API base URL to `http://generic-prime.minilab/api/specs/v1`
  - `frontend/Dockerfile.e2e`: Updated /etc/hosts entry from generic-prime-dockview to generic-prime
  - Added `/etc/hosts` entry on Thor: `192.168.0.244 generic-prime generic-prime.minilab`

### 2. Verified Backend API Access Across All Three Environments
- ✅ **Thor Host SSH**: `curl http://generic-prime.minilab/api/specs/v1/vehicles/details`
- ✅ **Dev Container** (`podman exec generic-prime-dev`): Node.js HTTP requests to `generic-prime.minilab:80`
- ✅ **E2E Container** (`podman run --network=host`): Node.js HTTP requests with /etc/hosts mapping
- **Verification Method**: Direct API calls retrieving Brammo vehicle data (5 records returned)

### 3. Updated Critical Documentation
- **ORIENTATION.md**: Rewrote "Backend API Testing Across Three Environments" section
  - Removed misleading K8s ClusterIP-only approach
  - Documented proper Traefik ingress access via /etc/hosts mapping
  - Provided working examples for all three environments
  - Added comprehensive troubleshooting checklist
- **MANUAL-TEST-PLAN.md**: Updated backend API references
  - Changed from `localhost:3000` to `generic-prime.minilab/api/specs/v1`
  - Added link to ORIENTATION.md for environment-specific instructions
- Removed duplicate outdated `docs/quality/MANUAL-TEST-PLAN.md` (kept root-level version only)

### 4. Key Principle Established
The `/etc/hosts` mapping serves its intended purpose: **abstracting K8s internals from application code**
- All environments use the same hostname: `generic-prime.minilab`
- Routes through Traefik ingress (port 80) → Backend service (port 3000)
- No hardcoded K8s ClusterIP addresses in application or test code

**Goals Achieved**:
- ✅ Eliminated generic-prime-dockview pollution from generic-prime codebase
- ✅ All three environments verified working with correct URLs
- ✅ Documentation now matches actual verified behavior
- ✅ Single source of truth for test plan (removed duplicate)
- ✅ Developers can access backend from any environment without K8s knowledge

---

## Known Blockers

**None at this time**. Documentation is comprehensive and actionable.

---

## Next Session Focus

See [NEXT-STEPS.md](NEXT-STEPS.md) for immediate work.

---

**Historical record**: Use `git log docs/claude/PROJECT-STATUS.md` to view past versions.
