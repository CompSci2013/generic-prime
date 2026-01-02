# Next Steps

**Current Session**: Session 68 - Merged /bye and /exit Commands
**Previous Session**: Session 67 - QA E2E Test Suite Implementation
**Status**: v21.1.0 deployed, `/exit` command updated with two-commit workflow

---

## IMMEDIATE ACTION 1: Infrastructure (IdP Phase 1)

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

## IMMEDIATE ACTION 2: Expand E2E Test Coverage (Optional)

**Priority**: MEDIUM
**Scope**: Add more tests to existing categories

The current 60 tests cover the core functionality. Additional tests could be added for:
- Multi-filter combinations (more complex scenarios)
- Pop-out window stress tests
- Cross-domain testing (if other domains get added)

**Reference**: `QUALITY-ASSURANCE.md` - Part 5: E2E Test Categories

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

## SESSION 68 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Merged `/bye` and `/exit` into single `/exit` command
2. ✅ Implemented two-commit workflow (docs first, then remaining)
3. ✅ Added explicit `date -Iseconds` timestamp requirement
4. ✅ Removed STATUS-HISTORY.md archival (git history is the record)
