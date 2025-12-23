# Next Steps

**Current Session**: Session 55 - Identity Planning (COMPLETE)
**Previous Session**: Session 54 - Pop-Out Testing (Complete)
**Status**: Planning complete. Ready for concurrent execution of Bug Fixing and Infrastructure Deployment.

---

## IMMEDIATE ACTION 1: Code Fix (Bug #13)

**Priority**: HIGH (User Experience)
**Scope**: Fix PrimeNG dropdown keyboard navigation in Query Control

### BUG #13: DROPDOWN KEYBOARD NAVIGATION
**Component**: `frontend/src/framework/components/query-control/query-control.component.ts`
**Issue**: Arrow keys/Spacebar do not work when `[filter]="true"`.

**Implementation Steps**:
1. Investigate PrimeNG 14.2.3 event handling.
2. Implement `onKeyDown` handler or adjust template attributes (`tabindex`, `autofocus`).
3. Verify keyboard navigation works for:
   - Manufacturer dropdown (Filtered)
   - Other dropdowns

---

## IMMEDIATE ACTION 2: Infrastructure (IdP Phase 1)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

### KEYCLOAK DEPLOYMENT
**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

**Implementation Steps**:
1. **Create Namespace**: `kubectl create namespace platform` (or check if exists).
2. **Deploy Postgres**:
   - Create PVC `keycloak-postgres-pvc`.
   - Deploy Postgres pod/service.
3. **Deploy Keycloak**:
   - Create Deployment using `quay.io/keycloak/keycloak:latest`.
   - Mount certificates for TLS.
   - Configure env vars (DB connection, Admin user).
4. **Configure Ingress**:
   - Route `auth.minilab` to Keycloak service via Traefik.
5. **Initial Setup**:
   - Log in to `https://auth.minilab`.
   - Create `halo-labs` realm.
   - Create Users per `docs/infrastructure/idp/TEST-PLAN-RBAC.md`.

---

## FUTURE ACTION 3: Frontend Integration (IdP Phase 2)

**Priority**: HIGH (After Keycloak is running)
**Scope**: Angular OIDC Integration

**Steps**:
1. Install `angular-oauth2-oidc`.
2. Configure `AuthConfig` in `app.module.ts`.
3. Implement Login/Logout buttons in header.
4. Protect specific routes (e.g., Preferences).

---

## SESSION 54 IMMEDIATE ACTION: Complete Pop-Out Window Testing (10 Tests)

*(Note: These tests passed in Session 54 but should be re-run periodically)*

**Test 1 - Cold Start** (~5 min)
- Verify preferences file creation.

**Test 2 - Hot Reload** (~5 min)
- Verify panel order persistence.

... (See previous NEXT-STEPS for full list if regression testing needed)