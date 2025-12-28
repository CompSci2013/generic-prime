# Next Steps

**Current Session**: Session 66 - Angular 20 + PrimeNG 20 Upgrade
**Status**: ✅ COMPLETED - Angular 20 + PrimeNG 20 ready, pending deployment

---

## IMMEDIATE ACTION 1: Deploy v6.0.0 to K3s

**Priority**: HIGH
**Scope**: Build and deploy Angular 20 production image

**Steps**:
1. Build production Docker image:
   ```bash
   cd /home/odin/projects/generic-prime/frontend
   podman build -t localhost/generic-prime-frontend:v6.0.0 -f Dockerfile.prod .
   ```
2. Import into K3s:
   ```bash
   podman save localhost/generic-prime-frontend:v6.0.0 -o /tmp/frontend-v6.0.0.tar
   sudo k3s ctr images import /tmp/frontend-v6.0.0.tar
   ```
3. Deploy:
   ```bash
   kubectl -n generic-prime set image deployment/generic-prime-frontend frontend=localhost/generic-prime-frontend:v6.0.0
   kubectl -n generic-prime rollout status deployment/generic-prime-frontend
   ```
4. Verify at http://generic-prime.minilab (should show v6.0.0)

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

## SESSION 66 COMPLETION SUMMARY

**Primary Accomplishments**:
- ✅ Angular 19 → 20 upgrade (20.3.15)
- ✅ PrimeNG 19 → 20 upgrade (20.4.0)
- ✅ Fixed PrimeNG 20 breaking changes:
  - DropdownModule → SelectModule
  - Row expansion template syntax (#expandedrow)
  - pRowToggler replaced with table.toggleRow()
  - Checkbox dark theme visibility
  - Panel dark theme CSS
- ✅ Version bumped to 6.0.0

**Current State**:
- Angular 20.3.15 + PrimeNG 20.4.0
- Build passing (7.17 MB)
- Pushed to GitHub (cc3e66e)
- K3s deployment pending

---

**Last Updated**: 2025-12-27T15:09:00-05:00 (Session 66)
