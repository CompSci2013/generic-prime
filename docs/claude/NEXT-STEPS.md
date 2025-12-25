# Next Steps

**Current Session**: Session 59 - Highlight Filter Sync Fixed
**Previous Session**: Session 58 - Bug #14 Lifecycle Fix
**Status**: All high-priority highlight bugs fixed ✅. Pop-out architecture is now fully synchronized.

---

## IMMEDIATE ACTION 1: Exhaustive Query Control Testing

**Priority**: HIGH (Verification)
**Scope**: Complete and refine `components/query-control-exhaustive.spec.ts`

While the core implementation is present, several tests failed during the initial run due to selector strictness and environment-specific behaviors (e.g., collapsed panels).

**Steps**:
1. **Refine Selectors**: Update `query-control-exhaustive.spec.ts` to use more specific selectors (e.g., `> .panel-header`) to avoid strict mode violations.
2. **Handle Collapsed Panels**: Add logic to expand the Query Control panel if it's collapsed by default (using the `isPanelCollapsed` logic from `bug-highlight-chips.spec.ts`).
3. **Fix NG0100 Errors**: Investigate why `ExpressionChangedAfterItHasBeenCheckedError` is occurring during keyboard navigation tests and fix if possible.
4. **Complete Section 3**: Ensure all Multiselect Dialog tests are passing.

---

## IMMEDIATE ACTION 2: Infrastructure (IdP Phase 1) - RESUME

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

This task was deferred for bug fixing but remains the next architectural milestone.

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

## SESSION 56 COMPLETION SUMMARY

**Primary Fixes Completed**:
1. **Bug #13 (Dropdown Keyboard Navigation)** ✅ FIXED
   - Arrow keys properly navigate dropdown options
   - Spacebar and Enter correctly confirm selections
   - Multiselect dialog search field auto-focuses
   - Public API compliance verified

2. **Bug #14 (Pop-Out Filter Synchronization)** ✅ FIXED (Critical Discovery)
   - Identified and resolved race condition in message buffering
   - Changed `Subject` to `ReplaySubject(10)` for state buffering
   - Filter chips now appear immediately in pop-out windows (milliseconds)
   - All multi-window synchronization tests passing

**Additional Fixes**:
- Pagination error fixed: size=1000 → size=100 in API endpoint
- Multiselect dialog auto-focus implemented

**Test Results**: All interactive browser tests ✅ PASSED
- Filter synchronization: IMMEDIATE display (zero latency)
- Multi-filter scenarios: Working perfectly
- Console health: Zero errors, zero warnings
- Build status: 6.84 MB, zero TypeScript errors

**Nice-to-Have Features Documented** in TANGENTS.md:
- Pop-Out Window Positioning for Multi-Monitor Support (future enhancement, low priority)