# Bug #16: Results Table Does Not Update When Multiple Filters Applied

**Status**: CRITICAL - Violates URL-First Architecture
**Discovered**: 2025-12-04 (Test 2.1.14 - Multiple Selection)
**Severity**: CRITICAL (core architecture violation)
**Type**: Silent failure (no console errors)
**Affected Component**: Discover component, ResourceManagementService
**Related Bug**: #1.3 (similar async/await issues)

---

## Summary

When applying a filter that modifies an already-active filter (e.g., changing from single selection "Brammo" to multiple selection "Brammo, Ford, GMC"), the URL updates correctly BUT the Results Table and Statistics Panel do not refresh immediately. Data only updates after a manual page refresh.

This violates the core URL-First architecture principle: **URL is the single source of truth, and all components must sync to URL changes immediately**.

---

## Steps to Reproduce

1. Navigate to `/discover` page
2. Select Manufacturer filter: Brammo
   - **Result**: Dialog closes, URL updates to `?manufacturer=Brammo`, Results Table shows only Brammo ✓
3. Click on "Manufacturer: Brammo" chip to reopen dialog
4. Add Ford and GMC to selection (now: Brammo, Ford, GMC)
5. Click "Apply" button
   - **Expected**:
     - URL updates to `?manufacturer=Brammo,Ford,GMC` ✓
     - Results Table immediately shows ALL three manufacturers' vehicles ✗
     - Statistics Panel immediately updates to show combined data ✗
   - **Actual**:
     - URL updates ✓
     - Results Table STILL shows only Brammo vehicles (stale data)
     - Statistics Panel STILL shows only Brammo data
     - After F5 refresh: Results update to show all three manufacturers ✓

---

## Impact

- **Architecture Violation**: URL-First pattern broken
- **UX Issue**: User sees stale data after applying filters
- **Trust Issue**: URL changes but UI doesn't follow (confusing)
- **Affects All Filters**: Likely impacts manufacturer, model, body class, year, etc.

---

## Root Cause Analysis

The issue appears to be in the **event chain after Apply button is clicked**:

1. User clicks "Apply" in dialog
2. `QueryControlComponent.applyFilter()` is called (line 324)
3. Emits `urlParamsChange` event with new filter values
4. Parent component `DiscoverComponent` receives the event
5. Should call `urlState.setParams()` with new values
6. `setParams()` updates URL via router
7. `urlState.params$` BehaviorSubject emits new values
8. All subscribed components (ResourceManagementService, QueryControl, etc.) should react

**Hypothesis**: The `setParams()` call may not be awaited or the change detection cycle isn't triggered properly for the Results Table component to re-fetch data.

This is similar to Bug #1.3 which was caused by race conditions with `combineLatest()` and missing `await` statements.

---

## Expected Behavior (URL-First Architecture)

```
User clicks Apply
    ↓
urlParamsChange event emitted
    ↓
DiscoverComponent receives event
    ↓
Calls setParams() / await completion
    ↓
Router updates URL
    ↓
urlState.params$ BehaviorSubject emits new params
    ↓
ResourceManagementService watches params$ and triggers new API call
    ↓
Results returned from API
    ↓
Results Table component receives new data via binding
    ↓
Change detection runs
    ↓
Results Table re-renders with new data
```

**Current (Broken) Flow**:
- Steps 1-4 work ✓
- Steps 5-6 work (URL updates) ✓
- Steps 7-10 DON'T happen immediately (stale UI)
- Only happens after manual F5 refresh

---

## Key Code Files to Investigate

1. **QueryControlComponent** (`frontend/src/framework/components/query-control/query-control.component.ts:324`)
   - `applyFilter()` method - verify it's emitting event correctly

2. **DiscoverComponent** (`frontend/src/app/features/discover/discover.component.ts`)
   - Event handler for `(urlParamsChange)="onUrlParamsChange($event)"`
   - Verify it's properly awaiting `setParams()` calls
   - Check if change detection is triggered

3. **ResourceManagementService** (`frontend/src/framework/services/resource-management.service.ts:309`)
   - `watchUrlChanges()` method - verify it reacts to param changes
   - `fetchData()` method - verify it's called when params change

4. **ResultsTableComponent** (`frontend/src/framework/components/results-table/results-table.component.ts`)
   - Verify it's subscribed to the right observable
   - Check if it has OnPush change detection that needs manual trigger

---

## Related Issues

- **Bug #1.3**: Query Control race condition (FIXED) - similar async/await pattern issues
- **Bug #15**: Dialog reopen failure - different symptom, may share root cause

---

## Workaround

User can refresh the page (F5) to force immediate update. This is NOT acceptable for production.

---

## Suggested Investigation Steps

1. Add console logging to trace the event flow from Apply button → URL update → component refresh
2. Verify `setParams()` is being awaited in DiscoverComponent
3. Check if multiple subscriptions are racing (similar to Bug #1.3)
4. Verify ResultsTableComponent is using correct change detection strategy
5. Check if `BehaviorSubject` in `UrlStateService` is emitting the new params correctly

---

## Testing Strategy

Once fix is applied:
1. Apply single manufacturer filter (Brammo) → Results Table updates ✓
2. Edit filter to add more manufacturers (Ford, GMC) → Results Table updates immediately ✓
3. Repeat with Model, Body Class, Year filters
4. Verify no page refresh needed
5. Run full Phase 2.1 test suite

---

**Last Updated**: 2025-12-04T22:45:00Z
**Author**: Claude Code Session
**Session**: Phase 2.1 Manual Testing - Multiple Selection Tests
**Discovered By**: User observation during Test 2.1.14
