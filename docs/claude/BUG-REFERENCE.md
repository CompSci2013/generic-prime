# Bug Reference: Cross-Repository Analysis

**Purpose**: Document unresolved bugs in this repository and reference how they were resolved in the parallel `generic-prime-dockview` repository.

**Context**: This project (`generic-prime`) and `generic-prime-dockview` are being maintained in parallel as an A/B test of application architectures.

---

## Unresolved Bugs (Both Repositories)

### Bug #13: Dropdown Keyboard Navigation ⚠️ MEDIUM PRIORITY

**Severity**: Medium
**Status**: Not started in either repository
**Affected Component**: PrimeNG `p-dropdown` with `[filter]="true"`

**Problem**:
- Down arrow key should highlight next option, but doesn't
- Up arrow key should highlight previous option, but doesn't
- Enter/Space should select highlighted option, but doesn't
- Only mouse selection works; keyboard navigation is broken

**Affects**:
- Body Class filter (in results-table-panel)
- Any other filtered dropdowns in the application

**Investigation Notes**:
- Likely PrimeNG issue with `[filter]="true"` mode
- May require PrimeNG version check or workaround implementation
- Consider using `p-multiSelect` as alternative (already works in Body Class filter)

---

### Bug #7: Checkbox Visual State ⚠️ LOW PRIORITY

**Severity**: Low
**Status**: Not started in either repository
**Affected Component**: p-multiSelect checkboxes

**Problem**:
- Checkboxes remain visually checked after clearing filters
- Visual state doesn't match actual data state
- Only affects appearance; actual filtering works correctly

**Affects**:
- Body Class multiselect filter
- Any p-multiSelect components

**Investigation Notes**:
- Likely state synchronization issue between component state and PrimeNG binding
- May require explicit state reset in `clearFilters()` method
- Consider checking PrimeNG multiSelect change detection

---

## How Bugs Were Fixed in `generic-prime-dockview`

This section documents functional improvements made in the parallel dockview repository that resolved issues similar to open bugs here.

### Bug #11: Pagination & Data Completeness (Resolved in dockview v1.3.0-v1.5.0)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Picker showed only 72 manufacturers instead of 881 manufacturer-model combinations
- API used in-memory pagination disguised as server-side pagination
- Backend elasticsearch query was truncated at `size: 100`

**Dockview Resolution** (commits across v1.3.0-v1.5.0):

**Backend Fix** (`~/projects/data-broker/generic-prime-dockview/src/`):
1. **elasticsearchService.js** - Replaced nested `terms` aggregation with `composite` aggregation
2. Implemented proper cursor-based pagination using `afterKey`
3. Added cardinality count for accurate total
4. **specsController.js** - Added `page` and `size` query parameters
5. Implemented offset-based pagination (`page=1&size=20` format)

**Frontend Fix** (`automobile.picker-configs.ts`):
- Changed from client-side pagination to server-side pagination
- Updated API endpoint configuration with proper pagination params
- Verified picker displays all 881 combinations across multiple pages

**API Contract** (v1.3.0):
```typescript
GET /api/specs/v1/manufacturer-model-combinations?page=1&size=20
Response: {
  data: [
    { manufacturer: "Ford", model: "F-150", count: 23 },
    // ... 20 items
  ],
  total: 881,        // Now accurate
  page: 1,
  size: 20,
  totalPages: 45
}
```

**Key Learning**: Proper ES composite aggregation was essential. The old nested structure couldn't scale beyond ~100 items.

---

### Bug #10: Pop-out Communication & State Sync (Resolved in dockview v1.3.0)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Pop-out statistics panel showed unfiltered data with pre-selected filters
- Changing filters in pop-out didn't update main window
- State wasn't propagating between windows

**Dockview Resolution** (v1.3.0):

**Root Cause Identified**:
- `UrlStateService` was a root singleton using `ActivatedRoute`
- Root-level `ActivatedRoute` doesn't receive query param updates from child routes like `/discover`

**Fixes Applied** (`url-state.service.ts`):
1. Changed from `ActivatedRoute.queryParams` to `Router.events` with `NavigationEnd` filter
2. Changed initialization from `route.snapshot.queryParams` to `router.parseUrl(router.url).queryParams`
3. Ensured singleton properly watches URL changes from any route

**Pop-out Window System** (`panel-popout.component.ts`):
- Implemented `URL_PARAMS_CHANGED` message type for BroadcastChannel
- Pop-out windows send state updates to main window when filters change
- Main window listens for these messages and updates URL accordingly
- Added `beforeunload` handler to close pop-outs when parent refreshes

**Files Modified**:
- `url-state.service.ts` - Router.events instead of ActivatedRoute
- `panel-popout.component.ts` - BroadcastChannel messaging
- `discover.component.ts` - Message handlers
- `popout.interface.ts` - Added CLEAR_ALL_FILTERS message type

**Test Results** (all passing in dockview):
- Main window filter add → pop-out receives update ✓
- URL paste in main window → pop-out updates ✓
- Pop-out filter change → main URL updates ✓
- Pop-outs close on page refresh ✓

---

### Bug #12: Picker Search Partial Match (Resolved in dockview v1.4.1)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Searching "bla" didn't match "Blazer"
- Fuzzy matching was too aggressive or broken

**Dockview Resolution** (v1.4.1):

**Backend Change** (`elasticsearchService.js`):
- Changed from fuzzy matching to wildcard matching
- Wildcard `*bla*` matches "Blazer" correctly
- More predictable search behavior for users

**Implementation**:
- Updated elasticsearch query from fuzzy to wildcard pattern
- Search field: `?search=term` triggers wildcard matching
- Result: Partial matches work as expected

---

### QueryControl Dropdown: Highlight Filters Visibility (Resolved in dockview v1.3.0)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Dropdown showed highlight filters (`h_*`) alongside normal filters
- Confused users with internal state variables
- Unclear which filters were actually selectable

**Dockview Resolution** (v1.3.0):

**Fix Applied** (`query-control.component.ts`):
- Filtered `filterFieldOptions` to exclude highlight filter fields
- Only display user-facing filter fields in dropdown

**Logic**:
```typescript
// Before: All filter configs shown
filterFieldOptions = Object.keys(this.filterConfig);

// After: Only non-highlight filters
filterFieldOptions = Object.keys(this.filterConfig)
  .filter(key => !key.startsWith('h_'));
```

---

### QueryControl: Clear All Implementation (Resolved in dockview v1.3.0)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- "Clear All" button didn't clear all URL parameters
- Some filters persisted after clicking Clear All

**Dockview Resolution** (v1.3.0):

**Simplified Approach**:
- Added `clearAllFilters` output event from QueryControl component
- Parent component calls `urlStateService.clearParams()`
- Single, definitive action: clear ALL URL parameters

**Files Modified**:
- `query-control.component.ts` - Added `@Output() clearAllFilters`
- `discover.component.ts` - Handle event, call `urlStateService.clearParams()`
- `panel-popout.component.ts` - Propagate clear event to pop-outs
- `popout.interface.ts` - Added `CLEAR_ALL_FILTERS` message type

**Result**: Complete URL state reset in one action

---

### Body Class Filter: Single Select → Multiselect (Resolved in dockview v2.1)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Users could only select one body class at a time
- No way to compare multiple body classes

**Dockview Resolution** (v2.1):

**Changes Made** (`automobile.filter-definitions.ts`):
- Changed Body Class filter from `type: 'select'` to `type: 'multiselect'`

**URL Serialization** (`automobile-url-mapper.ts`):
- Array serialization: comma-separated values in URL
- Example: `?bodyClass=Sedan,SUV,Coupe`

**Component Updates** (`query-control.component.ts`):
- Added check: `if (Array.isArray(value)) { return value; }`
- Prevents crash when `.split()` called on array

**Results Table** (`results-table.component.html`):
- Added `p-multiSelect` template for Body Class
- Checkbox selection UI
- Array state management

---

### Duplicate Statistics Panel (Resolved in dockview v2.5)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- "Statistics" section appeared twice in the UI
- One in main discover page, one embedded in results table
- Visual duplication and confusion

**Dockview Resolution** (v2.5):

**Root Cause**:
- `results-table.component.html` had embedded Statistics panel (lines 262-275)
- `discover.component.html` also rendered Statistics panel
- Both were visible simultaneously

**Fix Applied** (`results-table.component.html`):
- Removed embedded Statistics panel markup
- Single Statistics panel now rendered only in discover.component.html

**Files Modified**:
- `results-table.component.html` - Removed statistics section
- `discover.component.html` - Kept main statistics panel
- `statistics-panel.component.ts` - Added pop-out button (cosmetic improvement)

---

### Statistics Panel Styling & Charts (Resolved in dockview v2.4)

**Status in dockview**: ✅ **FULLY RESOLVED**

**Original Problem**:
- Statistics charts in dockview had black background
- Charts appeared squished or misaligned
- Duplicate titles in both tab and content area

**Dockview Resolution** (v2.4):

**CSS/Theme Fixes** (`styles.scss`):
- Added dockview light theme CSS variables:
  - `--dv-group-view-background-color: #ffffff`
  - `--dv-tabs-and-actions-container-background-color: #f8fafc`
  - Proper scrollbar styling

**Chart Layout Fixes** (`base-chart.component.ts`):
- Removed fixed `height: 400px` from Plotly layouts
- Added `autosize: true` for responsive sizing
- Capped bottom margin to prevent overflow

**Component Styling** (`base-chart.component.scss`):
- `:host` styling with proper flex layout
- `min-height: 0` for proper flex shrinking

---

## Recommended Approach for This Repository

Based on dockview's resolution patterns, consider these approaches for Bug #13 and Bug #7:

### For Bug #13 (Keyboard Navigation):

**Option A: PrimeNG Version Check**
- Verify current PrimeNG version supports keyboard navigation with `[filter]="true"`
- May require version upgrade

**Option B: Use p-multiSelect Alternative**
- Body Class already uses `p-multiSelect` successfully
- Consider replacing filtered dropdown with multiselect for better UX and keyboard support

**Option C: Custom Keyboard Handler**
- Add `@HostListener('keydown')` to capture arrow keys
- Manually manage option highlighting
- Implement in results-table-panel component

**Reference**: See dockview's `results-table-panel.component.ts` for multiselect pattern

### For Bug #7 (Checkbox Visual State):

**Option A: State Reset in clearFilters()**
- Explicitly reset p-multiSelect value when clearing filters
- Example: `this.selectedBodyClasses = []`
- Trigger change detection: `this.cdr.markForCheck()`

**Option B: Two-Way Binding Verification**
- Ensure `[(ngModel)]` or `[value]` is properly synchronized with component state
- Check for timing issues in filter clearing logic

**Reference**: See dockview's `results-table-panel.component.ts` for proper multiselect state management

---

## Testing Recommendations

When implementing fixes, verify with these test cases (all verified in dockview):

**For dropdown/multiselect fixes**:
- [ ] Select item via keyboard (arrow keys, Enter/Space)
- [ ] Clear all filters, verify visual state updates
- [ ] Select multiple items, verify all remain checked
- [ ] Click Clear All, verify all checkboxes unchecked visually

**For data completeness fixes**:
- [ ] Picker shows all 881 combinations across pagination
- [ ] Filter changes update all downstream components
- [ ] Pop-out windows receive state updates

---

## Version Tracking

| Repository | Latest Version | Latest Timestamp | Status |
|------------|---|---|---|
| generic-prime | 2.6 | 2025-11-30T21:20:00Z | Panel headers streamlined |
| generic-prime-dockview | 2.7 | 2025-11-30T02:30:00Z | Layout persistence ready |

---

## References

**Dockview Implementation Details**:
- Bug fixes: `~/projects/generic-prime-dockview/docs/claude/STATUS-HISTORY.md` (versions 1.3.0-2.7)
- Source code: `~/projects/generic-prime-dockview/frontend/src/`

**This Repository**:
- Current status: `docs/claude/PROJECT-STATUS.md`
- History: `docs/claude/STATUS-HISTORY.md`
- Next steps: `docs/claude/NEXT-STEPS.md`

---

**Last Updated**: 2025-12-01
**For**: Fresh Claude sessions working on bug fixes in generic-prime
