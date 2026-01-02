# Next Steps

**Current Session**: Session 73 - Fix INCORRECT User Stories
**Previous Session**: Session 72 - User Story Validation & Test Naming
**Status**: v7.8, all INCORRECT stories fixed, 5 new bugs discovered

---

## IMMEDIATE ACTION: Continue User Story Validation (Epics 4, 6, 7)

**Priority**: HIGH (Continue validation)
**Scope**: Verify remaining UNVERIFIED stories in Epics 4, 6, and 7

### Context

Session 73 fixed all INCORRECT stories (12 → 0). Several epics still have UNVERIFIED stories:
- Epic 4: Active Filter Chips (US-QC-030 to US-QC-034)
- Epic 6: Clear All Actions (US-QC-050, US-QC-051)
- Epic 7: URL Persistence (US-QC-060 to US-QC-063)

### Verification Steps

```bash
# Review what needs verification
grep -n "UNVERIFIED" docs/claude/user-stories/query-control.md | head -30
```

### Stories to Verify

| Story | Description | Status |
|-------|-------------|--------|
| US-QC-030 | View Active Filters | UNVERIFIED |
| US-QC-031 | Remove Filter via Chip | UNVERIFIED |
| US-QC-032 | Edit Filter via Chip Click | UNVERIFIED |
| US-QC-033 | View Filter Chip Tooltip | UNVERIFIED |
| US-QC-034 | Truncated Chip Display | UNVERIFIED |
| US-QC-050 | Clear All Filters and Highlights | UNVERIFIED |
| US-QC-051 | Clear All Button State | UNVERIFIED |
| US-QC-060-063 | URL Persistence stories | UNVERIFIED |

### Key Files

| File | Purpose |
|------|---------|
| `docs/claude/user-stories/query-control.md` | Master story document with status markers |
| `frontend/e2e/validation/us-qc-*.spec.ts` | Validation spec files |

---

## ALTERNATIVE: Fix Medium-Severity Bugs

**Priority**: MEDIUM (If validation complete)
**Scope**: Fix BUG-002, BUG-004, or BUG-006

### Open Bugs (Medium Severity)

| Bug | Description | Fix Approach |
|-----|-------------|--------------|
| BUG-002 | Escape key doesn't close dialog | Add `closeOnEscape` to p-dialog |
| BUG-004 | Same field selection doesn't reopen | Fix p-dropdown value binding |
| BUG-006 | X button propagates to chip body | Add `event.stopPropagation()` |

---

## SESSION 73 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Fixed all 12 INCORRECT user stories (now 0 INCORRECT)
2. ✅ Rewrote US-QC-020-023 for actual year input UI
3. ✅ Verified US-QC-026-027 (open-ended ranges work)
4. ✅ Verified US-QC-070-073 (collapse/expand/pop-out all work)
5. ✅ Discovered 5 new bugs (BUG-002 through BUG-006)
