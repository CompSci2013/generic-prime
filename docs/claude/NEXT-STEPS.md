# Next Steps

**Current Session**: Session 65+ - Angular 17 → 21 Upgrade
**Previous Session**: Session 64 - Angular 14 → 17 Upgrade
**Status**: Angular 21 upgrade verified, version 21.0.0

---

## IMMEDIATE ACTION 1: Merge Angular 21 Branch

**Priority**: HIGH
**Scope**: Merge feature branch to main

**Steps**:
1. Verify build/test suite passes locally (ng build, npx playwright test)
2. Merge `feature/angular-21-upgrade` to `main`
3. Push to origin

---

## IMMEDIATE ACTION 2: Infrastructure (IdP Phase 1)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

This is the next major architectural milestone.

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

**Steps**:
1. Create K3s manifests for Postgres in `platform` namespace
2. Create K3s manifests for Keycloak
3. Configure Ingress for `auth.minilab`
4. Create test users (Bob/SuperAdmin, Alice/AutoAdmin, Frank/Viewer)

---

## DEFERRED: Pop-out Re-rendering Bug

**Priority**: MEDIUM (Deferred from Session 62)
**Scope**: Pop-out BasicResultsTable doesn't re-render after STATE_UPDATE

**Context**:
- Sort/pagination in pop-out correctly sends message to main window
- Main window URL updates correctly, triggers API call
- Main window broadcasts STATE_UPDATE back to pop-out
- Pop-out receives STATE_UPDATE but table doesn't re-render with new data

**Debug Logging Locations** (to remove later):
- `basic-results-table.component.ts:182-189` - onSort
- `panel-popout.component.ts:203,211` - onUrlParamsChange
- `discover.component.ts` - BroadcastChannel and handlePopOutMessage

---

## SESSION 65 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Verified Angular 21 upgrade
2. ✅ Updated project documentation

**Commits This Session**:
- (Pending) docs: Update project status for Angular 21 upgrade

**Current State**:
- Angular 21.0.0 verified locally
- Documentation updated to reflect v6.0 status
