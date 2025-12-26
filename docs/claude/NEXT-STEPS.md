# Next Steps

**Current Session**: Session 62 - Pop-out BasicResultsTable Debugging
**Previous Session**: Session 61 - Query Panel UX Refinement
**Status**: Pop-out sort message flow verified. Re-rendering issue deferred.

---

## IMMEDIATE ACTION 1: Investigate Pop-out Re-rendering Bug

**Priority**: MEDIUM (Deferred from Session 62)
**Scope**: Pop-out BasicResultsTable doesn't re-render after STATE_UPDATE

**Context**:
- Sort/pagination in pop-out correctly sends message to main window
- Main window URL updates correctly, triggers API call
- Main window broadcasts STATE_UPDATE back to pop-out
- Pop-out receives STATE_UPDATE but table doesn't re-render with new data

**Hypothesis**: OnPush change detection issue. Possible causes:
1. `syncStateFromExternal()` not triggering observable emissions
2. `markForCheck()` insufficient - need `detectChanges()`
3. Zone.js timing issue with BroadcastChannel callback

**Investigation Steps**:
1. Add logging to `resourceService.syncStateFromExternal()` to verify it's called
2. Check if `results$` observable emits new value after sync
3. Compare with QueryControl pop-out (which works correctly)
4. Try `detectChanges()` instead of `markForCheck()` in subscription

**Debug Logging Locations** (added this session):
- `basic-results-table.component.ts:182-189` - onSort
- `panel-popout.component.ts:203,211` - onUrlParamsChange
- `discover.component.ts` - BroadcastChannel and handlePopOutMessage

---

## IMMEDIATE ACTION 2: Infrastructure (IdP Phase 1) - RESUME

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

This remains the next major architectural milestone once pop-out bugs are resolved.

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

---

## SESSION 62 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Fixed "Unknown panel type" error for BasicResultsTable pop-out (v1.2.1)
2. ✅ Added urlParamsChange output for sort/pagination communication (v1.2.2)
3. ✅ Verified BroadcastChannel message flow is working correctly
4. 🔶 Deferred: Pop-out re-rendering issue (change detection hypothesis)

**Commits This Session**:
- Pending commit for session documentation

**Current State**:
- Pop-out BasicResultsTable renders correctly
- Sort/pagination messages flow correctly to main window
- Main window URL updates work
- Issue: Pop-out doesn't re-render with updated data (deferred)
