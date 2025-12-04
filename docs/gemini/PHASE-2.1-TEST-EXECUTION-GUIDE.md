# Phase 2.1 Test Execution Guide - Manufacturer Filter Testing

**Date**: 2025-12-04
**Status**: Ready to Execute (bugs #15 and #16 FIXED)
**Objective**: Complete Phase 2.1 manual testing of Manufacturer filter workflows

---

## Overview

Phase 2.1 validates the complete Manufacturer filter workflow in QueryControl. This includes:
- Initial single selection
- Dialog reopen behavior (Bug #15 fix validation)
- Multiple selections in one filter
- Search functionality within dialogs
- Keyboard navigation
- Filter editing and removal

**Key Point**: Both critical bugs (#15 Dialog Reopen and #16 Observable Sync) are now FIXED. Testing can proceed without workarounds.

---

## Test Environment Setup

### Prerequisites
- Frontend running on `http://192.168.0.244:4205/discover`
- Backend API responding correctly
- Browser DevTools open (F12) to watch for errors
- Pop-up blocker disabled for the application domain

### Clean State
Before each major test subsection:
1. Open DevTools Console (F12 → Console tab)
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete on Mac)
3. Navigate to `http://192.168.0.244:4205/discover`
4. Verify clean state: No filters, Results show all 4,887 records

---

## Test Subsection 1: Dialog Cancel Behavior (5 tests)

**Objective**: Verify that selecting a new filter field properly closes previous dialog

**Context**: When user selects a new filter field, the component must close the previous dialog (if open) before opening the new one.

### Test 2.1.9: Cancel Behavior - From Multiselect to Multiselect

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer" (multiselect dialog opens)
4. Check "Brammo" checkbox
5. **DO NOT click Apply yet** - leave dialog open
6. Click field selector dropdown again
7. Select "Model" (different filter field)

**Expected Results**:
- ✅ Previous Manufacturer dialog closes (Apply not clicked, so Brammo selection is discarded)
- ✅ Model multiselect dialog opens cleanly
- ✅ Model dialog shows ~880 available models
- ✅ URL still shows clean state (no manufacturer parameter)
- ✅ Results Table still shows all 4,887 records (Brammo selection was NOT applied)

**Verification**:
- [ ] Dialog closed without error
- [ ] New dialog opened with correct title "Select Model"
- [ ] No JavaScript errors in console
- [ ] URL unchanged from `/discover`
- [ ] Results table unchanged (still showing 4,887)

**Notes**:

---

### Test 2.1.10: Cancel Behavior - From Multiselect to Range

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer" (multiselect dialog opens)
4. Check "Brammo" and "Ford" checkboxes
5. **DO NOT click Apply** - leave dialog open
6. Click field selector dropdown again
7. Select "Year" (range filter type)

**Expected Results**:
- ✅ Previous Manufacturer dialog closes silently (selection discarded)
- ✅ Year range dialog opens cleanly
- ✅ Year dialog shows "Select a year range" title
- ✅ Input fields show current year range (e.g., 1900-2024)
- ✅ URL still clean
- ✅ Results Table unchanged

**Verification**:
- [ ] Dialog switched cleanly from multiselect to range type
- [ ] No JavaScript errors
- [ ] URL unchanged
- [ ] Results unchanged

**Notes**:

---

### Test 2.1.11: Dialog Reopen After Apply - Bug #15 Validation

**Steps** (THIS VALIDATES BUG #15 FIX):
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Check "Brammo" checkbox
5. Click "Apply" button
6. **Verify filter applied**: Chip shows "Manufacturer: Brammo"
7. URL shows `?manufacturer=Brammo`
8. Results table filtered to Brammo only
9. **Now EDIT the filter**: Click field selector dropdown again
10. Select "Manufacturer" again

**Expected Results** (CRITICAL - Tests Bug #15 Fix):
- ✅ Manufacturer dialog REOPENS (this was broken before fix)
- ✅ Brammo checkbox is PRE-CHECKED (remembers previous selection)
- ✅ Dialog opens cleanly without lag
- ✅ No JavaScript errors
- ✅ Title shows "Select Manufacturer"

**Verification**:
- [ ] Dialog reopened successfully (Bug #15 fix working)
- [ ] Brammo was pre-selected
- [ ] No errors in console
- [ ] Can edit filter (add/remove values)

**Notes**: This is the critical test for Bug #15 fix (two-way binding → one-way binding)

---

### Test 2.1.12: Range Dialog Reopen - Bug #15 Validation

**Steps** (VALIDATE BUG #15 FOR RANGE DIALOGS):
1. Click field selector dropdown
2. Select "Year"
3. Set Year Min to 2000
4. Set Year Max to 2010
5. Click "Apply"
6. **Verify range applied**: URL shows `?yearMin=2000&yearMax=2010`
7. Results filter to 2000-2010 range only
8. **Now EDIT**: Click field selector dropdown again
9. Select "Year" again

**Expected Results**:
- ✅ Year range dialog REOPENS (Bug #15 fix for range dialogs)
- ✅ Both fields show previous values (2000 and 2010)
- ✅ Dialog opens without error
- ✅ Can edit range values

**Verification**:
- [ ] Range dialog reopened successfully
- [ ] Previous values were restored
- [ ] No console errors

**Notes**:

---

### Test 2.1.13: Multiple Filters Active - Dialog Behavior

**Steps**:
1. Apply Manufacturer: Brammo (from Test 2.1.11)
2. Apply Year: 2000-2010 (from Test 2.1.12)
3. Click field selector dropdown
4. Select "Model"

**Expected Results**:
- ✅ Both previous filters remain active (Brammo, Year 2000-2010)
- ✅ Model dialog opens cleanly
- ✅ Model list is filtered to Brammo vehicles only (respects active filters)
- ✅ URL shows: `?manufacturer=Brammo&yearMin=2000&yearMax=2010`

**Verification**:
- [ ] Both active filters persist
- [ ] New dialog opens over existing filters
- [ ] Model list respects active manufacturer filter
- [ ] URL correct

**Notes**:

---

## Test Subsection 2: Multiple Selection Tests (5 tests)

**Objective**: Verify selecting multiple values within one filter works correctly

**Context**: Users should be able to select multiple manufacturers (e.g., Brammo, Ford, GMC) and all should be applied together.

### Test 2.1.14: Select Two Values

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Check "Brammo" checkbox
5. Check "Ford" checkbox
6. Click "Apply" button

**Expected Results**:
- ✅ Chip shows "Manufacturer: Brammo, Ford... +0" (or similar truncation)
- ✅ URL shows `?manufacturer=Brammo,Ford`
- ✅ Results table filtered to show ONLY Brammo AND Ford vehicles
- ✅ Statistics panel shows data for both manufacturers combined
- ✅ Chip tooltip shows full list "Brammo, Ford"

**Verification**:
- [ ] URL contains both values comma-separated
- [ ] Results filtered to 2 manufacturers
- [ ] Statistics panel updated correctly
- [ ] Chip displays correctly

**Notes**:

---

### Test 2.1.15: Select Three Values

**Steps**:
1. Continue from Test 2.1.14 (Brammo, Ford selected)
2. Click field selector dropdown
3. Select "Manufacturer" again
4. Dialog reopens with Brammo and Ford checked
5. Also check "GMC" checkbox
6. Click "Apply" button

**Expected Results** (VALIDATES BUG #16 FIX - Observable Sync):
- ✅ Results table IMMEDIATELY shows all 3 manufacturers (Bug #16 fix working)
- ✅ No need to manually refresh (F5)
- ✅ URL shows `?manufacturer=Brammo,Ford,GMC`
- ✅ Statistics panel shows combined data for all 3
- ✅ Chip shows "Manufacturer: Brammo, Ford... +1"

**Verification**:
- [ ] Results updated immediately (Bug #16 fix verified)
- [ ] All 3 manufacturers present in results
- [ ] URL correct with all 3 values
- [ ] Statistics panel updated
- [ ] No manual refresh needed

**Notes**: This test validates Bug #16 fix (independent subscriptions instead of combineLatest)

---

### Test 2.1.16: Uncheck and Reapply (Edit Selection)

**Steps**:
1. Continue from Test 2.1.15 (Brammo, Ford, GMC selected)
2. Click field selector dropdown
3. Select "Manufacturer" again
4. Uncheck "Ford" checkbox (keep Brammo and GMC)
5. Click "Apply" button

**Expected Results**:
- ✅ Results filter to Brammo + GMC only (Ford removed)
- ✅ URL updates to `?manufacturer=Brammo,GMC`
- ✅ Ford vehicles no longer in results
- ✅ Chip updates to show only 2 manufacturers
- ✅ Statistics reflect Brammo + GMC

**Verification**:
- [ ] Ford unchecked correctly
- [ ] Results filtered to 2 manufacturers
- [ ] URL updated
- [ ] Statistics adjusted

**Notes**:

---

### Test 2.1.17: Select All Then Deselect One

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Check multiple manufacturers (at least 5):
   - Brammo, Ford, GMC, Honda, Toyota
5. Click "Apply"
6. Verify URL and results
7. Click field selector dropdown again
8. Select "Manufacturer"
9. Uncheck one (e.g., Honda)
10. Click "Apply"

**Expected Results**:
- ✅ After step 5: URL contains all 5 manufacturers
- ✅ After step 10: URL updated to 4 manufacturers (Honda removed)
- ✅ Results filtered correctly at each step
- ✅ Chip updates accordingly

**Verification**:
- [ ] Large selection works correctly
- [ ] Partial deselection works
- [ ] Results always match URL

**Notes**:

---

### Test 2.1.18: All Values Unchecked - Dialog Behavior

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Check "Brammo" checkbox
5. Click "Apply"
6. Chip appears: "Manufacturer: Brammo"
7. Click chip to edit
8. Uncheck "Brammo" (now nothing selected)
9. Click "Apply"

**Expected Results**:
- ✅ Dialog closes
- ✅ Chip disappears (no empty filters)
- ✅ URL updates to clean state (removes manufacturer param)
- ✅ Results show all manufacturers again

**Verification**:
- [ ] Chip removed when all unchecked
- [ ] URL cleaned
- [ ] Results restored to all data

**Notes**:

---

## Test Subsection 3: Search/Filter in Dialog (4 tests)

**Objective**: Verify the search field within the dialog filters the option list

**Context**: Most dialogs have a search input to quickly find options without scrolling.

### Test 2.1.19: Search Narrows List

**Steps**:
1. Starting from clean state: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Observe full list (~72 manufacturers)
5. Click in search field
6. Type "Ford"
7. Observe filtered list

**Expected Results**:
- ✅ List narrows to manufacturers matching "Ford"
- ✅ Only "Ford" appears (exact match) or similar (Ford-related)
- ✅ Total count updates (e.g., "1 result" or "Showing 1 of 72")
- ✅ Checkbox for Ford can be selected
- ✅ Search field stays focused

**Verification**:
- [ ] Search filters correctly
- [ ] Count reflects filtered results
- [ ] Can select from filtered results

**Notes**:

---

### Test 2.1.20: Search Case-Insensitive

**Steps**:
1. Continue from Test 2.1.19
2. Clear search field
3. Type "ford" (lowercase)
4. Observe results

**Expected Results**:
- ✅ Search is case-insensitive
- ✅ Still shows "Ford" and related options
- ✅ Results same as uppercase search

**Verification**:
- [ ] Case-insensitive search works

**Notes**:

---

### Test 2.1.21: Search with No Matches

**Steps**:
1. Starting from fresh dialog: `/discover`
2. Click field selector dropdown
3. Select "Manufacturer"
4. Search for "ZZZ999" (non-existent)
5. Observe result

**Expected Results**:
- ✅ List becomes empty
- ✅ Message shows "No results" or similar
- ✅ Apply button still clickable (but noop since nothing selected)
- ✅ Can clear search to restore list

**Verification**:
- [ ] No results message appears
- [ ] Search can be cleared

**Notes**:

---

### Test 2.1.22: Clear Search Restores List

**Steps**:
1. Continue from Test 2.1.21 (search showing no results)
2. Clear the search field (click X or select all and delete)
3. Observe list

**Expected Results**:
- ✅ Full manufacturer list restored
- ✅ Back to ~72 options
- ✅ Search field is empty
- ✅ Cursor can refocus on search

**Verification**:
- [ ] List fully restored
- [ ] Count updated to original

**Notes**:

---

## Test Subsection 4: Keyboard Navigation in Dialog (4 tests)

**Objective**: Verify keyboard controls work within the dialog

**Context**: Users should be able to navigate, select, and apply filters using only keyboard.

### Test 2.1.23: Tab Navigation Between Checkboxes

**Steps**:
1. Click field selector dropdown
2. Select "Manufacturer"
3. Dialog opens with focus on search field
4. Press Tab to move to first checkbox (Brammo)
5. Press Tab 3-5 more times
6. Observe focus movement

**Expected Results**:
- ✅ Focus moves from search → first checkbox → subsequent checkboxes
- ✅ Visible focus indicator on each focused element
- ✅ Tab order is logical (top to bottom)
- ✅ Can Tab to Apply and Cancel buttons

**Verification**:
- [ ] Tab navigation works
- [ ] Focus visible on each element
- [ ] Tab order logical

**Notes**:

---

### Test 2.1.24: Space to Select/Deselect Checkbox

**Steps**:
1. Continue from Test 2.1.23 (focus on a checkbox)
2. Press Space to toggle checkbox
3. Observe checkbox state change

**Expected Results**:
- ✅ Space toggles checkbox on/off
- ✅ Visual state updates immediately
- ✅ Focus remains on same checkbox
- ✅ Can space multiple checkboxes in sequence

**Verification**:
- [ ] Space toggles checkbox

**Notes**:

---

### Test 2.1.25: Arrow Keys in Scrollable List

**Steps**:
1. Click field selector dropdown
2. Select "Manufacturer"
3. Dialog opens
4. Click on a checkbox in the middle (e.g., "Ford")
5. Press Down Arrow 3 times
6. Press Up Arrow 2 times

**Expected Results**:
- ✅ Arrow keys navigate up/down through the list
- ✅ Focus moves to adjacent items
- ✅ List may scroll if focused item is off-screen
- ✅ Visual focus indicator follows

**Verification**:
- [ ] Arrow keys navigate list

**Notes**:

---

### Test 2.1.26: Enter to Apply, Escape to Cancel

**Steps**:
1. Click field selector dropdown
2. Select "Manufacturer"
3. Check "Brammo" checkbox
4. Press Enter

**Expected Results**:
- ✅ Clicking Enter applies filter (same as clicking Apply button)
- ✅ Dialog closes
- ✅ Chip appears for Brammo

**Then continue**:
5. Click field selector dropdown
6. Select "Manufacturer"
7. Check "Ford" (adding to existing Brammo)
8. Press Escape

**Expected Results**:
- ✅ Pressing Escape cancels dialog (same as Cancel button)
- ✅ Dialog closes without applying
- ✅ Only "Manufacturer: Brammo" chip remains
- ✅ URL unchanged (Ford not added)

**Verification**:
- [ ] Enter applies filter
- [ ] Escape cancels without applying
- [ ] URL matches visual state

**Notes**:

---

## Test Subsection 5: Clear/Edit Manufacturer Filter (3 tests)

**Objective**: Verify editing an applied filter works correctly

### Test 2.1.27: Edit Applied Filter - Add More Values

**Steps**:
1. Start with "Manufacturer: Brammo" applied (from earlier tests)
2. URL shows `?manufacturer=Brammo`
3. Click the chip itself to edit (NOT the X to remove)
4. Dialog reopens with Brammo checked
5. Check "Ford" also
6. Click "Apply"

**Expected Results**:
- ✅ Dialog opens with previous selection remembered
- ✅ Can add new values
- ✅ After Apply: URL shows `?manufacturer=Brammo,Ford`
- ✅ Results filtered to both
- ✅ Chip updates to show both values

**Verification**:
- [ ] Chip click opens dialog for editing
- [ ] Previous selection remembered
- [ ] New selection applied
- [ ] URL updated

**Notes**:

---

### Test 2.1.28: Edit Applied Filter - Remove Values

**Steps**:
1. Continue from Test 2.1.27 (Brammo, Ford applied)
2. Click chip to edit
3. Uncheck "Ford" (keep Brammo)
4. Click "Apply"

**Expected Results**:
- ✅ Dialog opens with both checked
- ✅ Uncheck Ford
- ✅ After Apply: URL shows `?manufacturer=Brammo` (Ford removed)
- ✅ Results filtered to Brammo only
- ✅ Chip shows only "Manufacturer: Brammo"

**Verification**:
- [ ] Can remove values from applied filter
- [ ] URL and Results updated correctly

**Notes**:

---

### Test 2.1.29: Dialog Cancellation Doesn't Affect Applied Filter

**Steps**:
1. Start with "Manufacturer: Brammo,Ford" applied
2. Click chip to edit
3. Uncheck "Brammo" and "Ford"
4. Check "Toyota" instead
5. Click "Cancel" (NOT Apply)

**Expected Results**:
- ✅ Dialog closes
- ✅ "Manufacturer: Brammo,Ford" chip still visible (unchanged)
- ✅ URL still shows `?manufacturer=Brammo,Ford` (unchanged)
- ✅ Results still filtered to Brammo + Ford
- ✅ Toyota not added (selection discarded)

**Verification**:
- [ ] Cancel discards unsaved changes
- [ ] Applied filter unchanged
- [ ] URL unchanged
- [ ] Results unchanged

**Notes**:

---

## Test Subsection 6: Remove Manufacturer Filter (3 tests)

**Objective**: Verify removing a filter works correctly

### Test 2.1.30: Click X to Remove Filter

**Steps**:
1. Start with "Manufacturer: Brammo" applied
2. Locate the X button on the right side of the chip
3. Click the X

**Expected Results**:
- ✅ Chip disappears
- ✅ URL updates to remove manufacturer param (clean `/discover`)
- ✅ Results expand to show all manufacturers again
- ✅ Statistics panel updates to show all data

**Verification**:
- [ ] Chip removed
- [ ] URL cleaned
- [ ] Results reset to full dataset

**Notes**:

---

### Test 2.1.31: Remove One of Multiple Filters

**Steps**:
1. Apply multiple filters:
   - Manufacturer: Brammo, Ford
   - Year: 2000-2010
2. URL shows `?manufacturer=Brammo,Ford&yearMin=2000&yearMax=2010`
3. Click X on the Manufacturer chip
4. Verify year filter remains

**Expected Results**:
- ✅ Manufacturer chip removed
- ✅ Year chip remains
- ✅ URL shows `?yearMin=2000&yearMax=2010` (manufacturer params removed)
- ✅ Results filter to year range only (all manufacturers in range)

**Verification**:
- [ ] Only one filter removed
- [ ] Other filters unaffected
- [ ] URL accurate

**Notes**:

---

### Test 2.1.32: Remove Filter Then Re-add Different Value

**Steps**:
1. Start with "Manufacturer: Brammo" applied
2. Click X to remove chip
3. Verify all results shown
4. Click field selector dropdown
5. Select "Manufacturer"
6. Check "Toyota" (different value)
7. Click "Apply"

**Expected Results**:
- ✅ Filter removed cleanly
- ✅ Full results displayed
- ✅ New filter applies without issues
- ✅ URL shows `?manufacturer=Toyota`
- ✅ Results filtered to Toyota only

**Verification**:
- [ ] Remove works cleanly
- [ ] Re-adding different value works
- [ ] No state confusion

**Notes**:

---

## Summary: Test Results Tracking

### Dialog Cancel Behavior (5 tests)
- [ ] 2.1.9: Multiselect to Multiselect
- [ ] 2.1.10: Multiselect to Range
- [ ] 2.1.11: Reopen After Apply (Bug #15 Critical Test)
- [ ] 2.1.12: Range Reopen (Bug #15)
- [ ] 2.1.13: Multiple Filters Active

### Multiple Selection (5 tests)
- [ ] 2.1.14: Select Two Values
- [ ] 2.1.15: Select Three Values (Bug #16 Critical Test)
- [ ] 2.1.16: Uncheck and Reapply
- [ ] 2.1.17: Select Many Then Deselect One
- [ ] 2.1.18: All Unchecked

### Search/Filter in Dialog (4 tests)
- [ ] 2.1.19: Search Narrows List
- [ ] 2.1.20: Search Case-Insensitive
- [ ] 2.1.21: Search No Matches
- [ ] 2.1.22: Clear Search Restores List

### Keyboard Navigation (4 tests)
- [ ] 2.1.23: Tab Navigation
- [ ] 2.1.24: Space to Select
- [ ] 2.1.25: Arrow Keys Navigate
- [ ] 2.1.26: Enter to Apply, Escape to Cancel

### Clear/Edit Filter (3 tests)
- [ ] 2.1.27: Edit - Add More Values
- [ ] 2.1.28: Edit - Remove Values
- [ ] 2.1.29: Cancel Doesn't Affect Filter

### Remove Filter (3 tests)
- [ ] 2.1.30: Click X to Remove
- [ ] 2.1.31: Remove One of Multiple
- [ ] 2.1.32: Remove Then Re-add Different Value

**Total Tests**: 24 remaining tests in Phase 2.1

---

## Known Constraints

1. **Mouse Click Required for Initial Selection**: Use mouse clicks to open dialogs (per UX.md pattern), not arrow keys
2. **No Keyboard Auto-Open**: Field selector dropdown doesn't auto-open dialog on arrow navigation (by design)
3. **Browser Console**: Keep DevTools open to catch any JavaScript errors

---

## Success Criteria

Phase 2.1 is COMPLETE when:
1. ✅ All 24 tests executed
2. ✅ All tests PASS (or documented as known issues)
3. ✅ No unexpected JavaScript errors
4. ✅ URL always matches visual state
5. ✅ Bug #15 and #16 fixes verified working
6. ✅ Results table syncs immediately with filter changes (no F5 needed)

---

**Next Steps After Phase 2.1**: Phase 2.2 (Model filter), 2.3 (Body Class), 2.4 (Year Range), etc.

**Last Updated**: 2025-12-04
**Status**: Ready for execution - all bugs fixed, blockers removed
