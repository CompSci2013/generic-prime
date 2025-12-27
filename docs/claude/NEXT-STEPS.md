# Next Steps

**Current Session**: Session 65b - Angular 14 → 19 Multi-Version Upgrade Marathon
**Status**: ✅ COMPLETED - Angular 19 + PrimeNG 19 ready, pending deployment

---

## IMMEDIATE ACTION 1: Deploy v5.0.0 to K3s

**Priority**: HIGH
**Scope**: Build and deploy Angular 19 production image

**Steps**:
1. Build production Docker image:
   ```bash
   cd /home/odin/projects/generic-prime/frontend
   podman build -t localhost/generic-prime-frontend:v5.0.0 -f Dockerfile.prod .
   ```
2. Import into K3s:
   ```bash
   podman save localhost/generic-prime-frontend:v5.0.0 -o /tmp/frontend-v5.0.0.tar
   sudo k3s ctr images import /tmp/frontend-v5.0.0.tar
   ```
3. Deploy:
   ```bash
   kubectl -n generic-prime set image deployment/generic-prime-frontend frontend=localhost/generic-prime-frontend:v5.0.0
   kubectl -n generic-prime rollout status deployment/generic-prime-frontend
   ```
4. Verify at http://generic-prime.minilab (should show v5.0.0)

---

## IMMEDIATE ACTION 2: Merge to Main

**Priority**: HIGH
**Scope**: Merge feature branch after deployment verification

**Steps**:
1. Verify production is stable
2. Merge `feature/angular-15-upgrade` to `main`
3. Push to origin

---

## IMMEDIATE ACTION 3: Infrastructure (IdP Phase 1)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

---

## DEFERRED: Pop-out Re-rendering Bug

**Priority**: MEDIUM
**Scope**: Pop-out BasicResultsTable doesn't re-render after STATE_UPDATE

---

## SESSION 65b COMPLETION SUMMARY

**Primary Accomplishments**:
- ✅ Architecture Audit Remediations (Highlight Leak, UiKitModule, Karma removal)
- ✅ Angular 14 → 15 → 16 → 17 → 18 → 19 complete upgrade path
- ✅ PrimeNG 17 → 19 migration with new theming system
- ✅ 100% Signals coverage (state, input, output)
- ✅ Fixed PrimeNG 19 ripple banner and dark mode configuration
- ✅ Version bumped to 5.0.0

**Current State**:
- Angular 19.2.17 + PrimeNG 19.1.7-lts
- Build passing (7.20 MB)
- K3s deployment pending (v4.0.0 still running)

---

**Last Updated**: 2025-12-27T12:07:41-05:00 (Session 65b)
