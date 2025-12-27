# Next Steps

**Current Session**: Session 64 - Angular 14 → 17 Multi-Version Upgrade
**Previous Session**: Session 63 - Angular 14 → 15 Upgrade
**Status**: Angular 17 upgrade complete, production deployed, version 3.0.0

---

## IMMEDIATE ACTION 1: Merge Angular 17 Branch

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

## SESSION 64 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Upgraded Angular from 15.2.10 to 16.2.12 (v2.1.0)
2. ✅ Upgraded Angular from 16.2.12 to 17.3.12 (v3.0.0)
3. ✅ Upgraded PrimeNG from 15.4.1 to 17.18.15
4. ✅ Upgraded TypeScript from 4.9.5 to 5.4.5
5. ✅ Converted `require()` to ES6 imports (Plotly, Cytoscape)
6. ✅ Migrated all 32 components to Angular 17 control flow syntax
7. ✅ Built and deployed to production K3s cluster

**Commits This Session**:
- `9065d29` - feat: Upgrade Angular 15 → 16, version 2.1.0
- `5ddc789` - chore: Update Angular core to v17.3.12, TypeScript to v5.4.5
- `33cc2f4` - chore: Update Angular CDK to v17.3.10
- `bb41658` - chore: Update PrimeNG to v17.18.14, primeicons to v7
- `29c875b` - feat: Upgrade Angular 16 → 17, version 3.0.0

**Current State**:
- Angular 17.3.12 running in production
- All 32 components using @if/@for/@switch control flow
- TypeScript 5.4.5 with improved type checking
- Production verified at http://generic-prime.minilab
