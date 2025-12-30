# Next Steps

**Current Session**: Session 67 - Cline Integration & E2E Test Suite
**Status**: ✅ COMPLETED - Cline configured, E2E tests created

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

## SESSION 67 COMPLETION SUMMARY

**Primary Accomplishments**:
- ✅ Created missing Git branches for Angular upgrade path
- ✅ Created `.clinerules` for Cline AI configuration
- ✅ Created E2E test suite (15 tests, all passing)
- ✅ Fixed Cline's selector/route issues
- ✅ Created troubleshooting guide for Cline self-diagnosis
- ✅ Created vision helper script (describe-image.sh)

**Key Files Created**:
- `.clinerules` - Cline project rules
- `docs/guides/CLINE-TROUBLESHOOTING-GUIDE.md` - Self-diagnosis guide
- `frontend/e2e/domains/automobile.spec.ts` - 15 E2E tests
- `scripts/describe-image.sh` - Vision helper script

**Current State**:
- Branch: feature/cline-experiment (pushed to GitHub/GitLab)
- E2E tests: 15/15 passing
- Screenshots directory empty (tests need to run to generate)

---

**Last Updated**: 2025-12-30T08:09:00-05:00 (Session 67)
