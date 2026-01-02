# Next Steps

**Current Session**: Session 71 - Exit Protocol Fix
**Previous Session**: Session 70 - Fix Loop YOLO Mode Integration
**Status**: v7.5, BUG-001 committed, /exit updated

---

## IMMEDIATE ACTION: Continue User Story Validation

**Priority**: HIGH (Resume interrupted work)
**Scope**: Validate Query Control user stories from US-QC-010 onward

### Context

User story validation was interrupted when BUG-001 was discovered. The bug is now fixed and committed. Resume validation at **US-QC-010: View Multiselect Options** (Epic 2).

### Files

- **User Stories**: `docs/claude/user-stories/query-control.md`
- **Test Suite**: `frontend/e2e/components/query-control-exhaustive.spec.ts`
- **Session Summary**: `docs/claude/start-here.md`

### Steps

1. **Run multiselect dialog tests**:
   ```bash
   cd ~/projects/generic-prime/frontend
   npx playwright test e2e/components/query-control-exhaustive.spec.ts -g "3.1|3.2" --reporter=list
   ```

2. **Map test results to acceptance criteria** in US-QC-010 through US-QC-016

3. **Update user story document** with VERIFIED/BUG/INCORRECT markers

4. **Continue through remaining Epics** (3-12)

### Validation Progress

| Epic | Status |
|------|--------|
| 1: Filter Field Selection | ✅ Validated (US-QC-001 to US-QC-003) |
| 2: Multiselect Filters | **Next** (start at US-QC-010) |
| 3-12: Remaining | Pending |

---

## ALTERNATIVE: IdP Phase 1 (If Validation Complete)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

**Steps**:
1. Create K3s manifests for Postgres in `platform` namespace
2. Create K3s manifests for Keycloak
3. Configure Ingress for `auth.minilab`
4. Create test users (Bob/SuperAdmin, Alice/AutoAdmin, Frank/Viewer)

---

## SESSION 71 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Committed BUG-001 fix that was missed by Session 70's /exit
2. ✅ Updated /exit command to check fix loop results before ending
3. ✅ Added fix loop runtime artifacts to .gitignore
4. ✅ Created start-here.md session summary
5. ✅ Reviewed QA documentation for context
