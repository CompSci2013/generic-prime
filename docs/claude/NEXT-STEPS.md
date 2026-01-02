# Next Steps

**Current Session**: Session 66 - Angular 21 Modernization & QA Documentation
**Previous Session**: Session 65+ - Angular 17 → 21 Upgrade
**Status**: v21.1.0 deployed, modernization complete, QA documentation created

---

## IMMEDIATE ACTION 1: Implement E2E Tests Using QUALITY-ASSURANCE.md

**Priority**: HIGH
**Scope**: Create Playwright tests based on documented behaviors

**Reference**: `QUALITY-ASSURANCE.md` - Part 5: E2E Test Categories

**Steps**:
1. Review QUALITY-ASSURANCE.md test categories (6 categories, ~120 tests defined)
2. Implement Category 1: Basic Filters (Tests 001-020)
3. Implement Category 2: Pop-Out Lifecycle (Tests 021-040)
4. Continue with remaining categories

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

## REMAINING MODERNIZATION (Optional)

**Priority**: LOW (Technical Debt)
**Scope**: Signal-based inputs/outputs (identified in GEMINI-ANALYSIS.md)

**Not Yet Migrated**:
- 18 `@Input()` decorators → `input()` signal
- 7 `@Output()` decorators → `output()`
- 5 `@ViewChild()` decorators → `viewChild()` signal
- 34 files with constructor DI → `inject()`

These are functional but would prepare for zoneless Angular.

---

## DEFERRED: Pop-out Re-rendering Bug

**Priority**: MEDIUM (Deferred from Session 62)
**Scope**: Pop-out BasicResultsTable doesn't re-render after STATE_UPDATE

**Context**:
- Sort/pagination in pop-out correctly sends message to main window
- Main window URL updates correctly, triggers API call
- Main window broadcasts STATE_UPDATE back to pop-out
- Pop-out receives STATE_UPDATE but table doesn't re-render with new data

---

## SESSION 66 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Angular 21 full modernization (8 pattern migrations)
2. ✅ Fixed critical orphaned HttpErrorInterceptor bug
3. ✅ Migrated to esbuild application builder
4. ✅ Deployed v21.1.0 to production
5. ✅ Created ANGULAR-MODERNIZATION-CASE-STUDY.md
6. ✅ Created QUALITY-ASSURANCE.md for testing guidance

**Current State**:
- v21.1.0 deployed and verified at http://generic-prime.minilab
- Comprehensive QA documentation ready for test implementation
