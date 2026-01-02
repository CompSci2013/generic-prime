# Next Steps

**Current Session**: Session 72 - User Story Validation & Test Naming
**Previous Session**: Session 71 - Exit Protocol Fix & Validation Rhythm Recovery
**Status**: v7.7, all exhaustive tests renamed, validation specs created

---

## IMMEDIATE ACTION: Run Validation Specs & Update Story Status

**Priority**: HIGH (Continue validation)
**Scope**: Execute validation specs and finalize story status markers

### Context

Session 72 created validation specs for Epics 2-8 but did not run all of them. Several stories have already been marked INCORRECT based on code analysis. Next session should:

1. Run remaining validation specs
2. Review screenshots to confirm findings
3. Finalize story status markers in `query-control.md`

### Run Commands

```bash
cd ~/projects/generic-prime/frontend

# Run Epic 2 (Multiselect) validation
npx playwright test e2e/validation/us-qc-010-016.spec.ts --reporter=list

# Run Epic 4 (Filter Chips) validation
npx playwright test e2e/validation/us-qc-030-034.spec.ts --reporter=list

# View screenshots
ls test-results/validation/epic-*/
```

### Validation Progress

| Epic | Status |
|------|--------|
| 1: Filter Field Selection | ✅ VERIFIED |
| 2: Multiselect Filters | ⚠️ PARTIAL (US-QC-016 incorrect - Escape key) |
| 3: Year Range Filter | ❌ INCORRECT (no decade grid, no open-ended ranges) |
| 4: Active Filter Chips | ⏳ **Next** - Run validation |
| 5: Highlight Mode | ❌ INCORRECT (highlights only via URL params) |
| 6: Clear All Actions | ⏳ Need to run validation |
| 7: URL Persistence | ⏳ Need to run validation |
| 8: Panel Behavior | ❌ INCORRECT (no collapse/expand/pop-out) |

### Key Files

| File | Purpose |
|------|---------|
| `docs/claude/start-here.md` | Full validation rhythm + test naming schema |
| `docs/claude/user-stories/query-control.md` | Master story document with status markers |
| `frontend/e2e/validation/us-qc-*.spec.ts` | Validation spec files |

---

## ALTERNATIVE: IdP Phase 1 (If Validation Complete)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

---

## SESSION 72 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Renamed all ~140 tests in `query-control-exhaustive.spec.ts` with US-QC-XXX.Y format
2. ✅ Created 7 validation spec files for Epics 2-8
3. ✅ Documented test naming schema in `start-here.md`
4. ✅ Identified multiple incorrect user stories (US-QC-016, 020-027, 040, 070-073)
