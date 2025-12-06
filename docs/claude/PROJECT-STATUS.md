# Project Status

**Version**: 2.8
**Timestamp**: 2025-12-06T15:30:00Z
**Updated By**: Network Documentation Session

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

**Network & Backend Documentation Enhancement**:
1. Added comprehensive "Backend Project Structure" section explaining multi-project data-broker umbrella architecture
2. Added detailed "Docker/Podman Infrastructure" section with all 4 container images documented:
   - Frontend dev container (--network host for K8s service access)
   - E2E container (hardcoded /etc/hosts for isolated network)
   - Backend API container (K8s ClusterIP deployment)
   - Production frontend container
3. Added "Network Configuration & Debugging" section with:
   - /etc/hosts entry explanations
   - Complete network access path visualization
   - Curl debugging commands specific to THREE environments:
     - Thor host SSH (via ingress or ClusterIP)
     - Dev container (Podman with --network host)
     - E2E container (Docker/Playwright with hardcoded hostname mapping)
   - Troubleshooting checklist with 5-step debugging workflow

**Goals Achieved**:
- Developers can now successfully debug backend data retrieval across all three execution environments
- Backend project structure clearly documented (separate ~/projects/data-broker/generic-prime repo)
- All Dockerfiles and K8s manifests referenced with exact locations
- Network topology visualized with clear data flow paths
- Exact curl commands provided for each environment context

---

## Known Blockers

**None at this time**. Documentation is comprehensive and actionable.

---

## Next Session Focus

See [NEXT-STEPS.md](NEXT-STEPS.md) for immediate work.

---

**Historical record**: Use `git log docs/claude/PROJECT-STATUS.md` to view past versions.
