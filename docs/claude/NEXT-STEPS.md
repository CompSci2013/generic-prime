# Next Steps

**Current Session**: Session 63 - Angular 14 → 15 Upgrade
**Previous Session**: Session 62 - Pop-out BasicResultsTable Debugging
**Status**: Angular 15 upgrade complete, production deployed, version 2.0.0

---

## IMMEDIATE ACTION 1: Merge Angular 15 Branch

**Priority**: HIGH
**Scope**: Merge feature branch to main

**Steps**:
1. Verify production is stable at http://generic-prime.minilab
2. Merge `feature/angular-15-upgrade` to `main`
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

## SESSION 63 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Upgraded Angular from 14.3.0 to 15.2.10
2. ✅ Upgraded PrimeNG from 14.2.3 to 15.4.1
3. ✅ Upgraded TypeScript from 4.7.4 to 4.9.5
4. ✅ Converted all 21 components to standalone
5. ✅ Migrated to standalone bootstrap (bootstrapApplication)
6. ✅ Created app.config.ts and app.routes.ts
7. ✅ Deleted legacy AppModule and AppRoutingModule
8. ✅ Incremented version to 2.0.0
9. ✅ Built and deployed to production K3s cluster

**Commits This Session**:
- `32a857c` - feat: Upgrade Angular 14 → 15, version 2.0.0

**Current State**:
- Angular 15.2.10 running in production
- All standalone components working
- Standalone bootstrap with provideRouter, provideHttpClient
- Production verified at http://generic-prime.minilab
