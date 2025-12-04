# Manual Test Plan - Generic Discovery Framework

**Version:** 1.0
**Date:** 2025-11-25
**Application:** Generic Discovery Framework (Automobile Domain)
**Base URL:** http://192.168.0.244:4205/discover

---

## Test Environment Setup

### Prerequisites
- Frontend dev server running at http://192.168.0.244:4205
- Backend API services running (Specs API, VINs API)
- Modern browser (Chrome/Firefox) with JavaScript enabled
- Pop-up blocker disabled for application domain

### Test Data
- Known manufacturer: Ford
- Known model: F-150
- Known body classes: SUV, Pickup, Sedan
- Known year range: 2020-2024

---

## Test Scope

This test plan covers:
1. **Panel Controls** - Query Control, Picker, Statistics, Results
2. **Pop-Out Functionality** - Single and multiple pop-outs
3. **State Synchronization** - Consistency between main window and pop-outs
4. **URL State Management** - URL as single source of truth
5. **Panel Interactions** - Collapse, drag-drop, pop-out

---

## Test Cases

### Section 1: Basic Panel Functionality (Popped In)

#### TC1.1: Query Control - Add Filter
**Objective:** Verify adding a filter updates URL and refreshes data

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. In Query Control panel, click "Add Filter" → "Manufacturer"
3. Enter "Ford" and click "Add"
4. Observe URL, Results table, and Statistics panel

**Expected Results:**
- ✅ URL contains `?manufacturer=Ford`
- ✅ Query Control shows "Manufacturer: Ford" chip
- ✅ Results table filters to Ford vehicles only
- ✅ Statistics panel updates to show Ford-only statistics
- ✅ All chart counts reflect filtered data

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.2: Query Control - Remove Filter
**Objective:** Verify removing a filter updates URL and resets data

**Preconditions:** TC1.1 completed (manufacturer=Ford filter active)

**Steps:**
1. Click X icon on "Manufacturer: Ford" chip
2. Observe URL, Results table, and Statistics panel

**Expected Results:**
- ✅ URL updates to remove `manufacturer=Ford`
- ✅ Query Control chip disappears
- ✅ Results table shows all manufacturers
- ✅ Statistics panel shows all data
- ✅ Chart counts reflect unfiltered data

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.3: Manufacturer-Model Picker - Select Item
**Objective:** Verify picker selection updates URL and filters data

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. In Manufacturer-Model Picker panel, check the box for "Ford" / "F-150"
3. Click "Apply" button
4. Observe URL, Results table, and Statistics panel

**Expected Results:**
- ✅ URL contains `?modelCombos=Ford:F-150`
- ✅ Picker shows "1 item(s) selected"
- ✅ Results table filters to Ford F-150 only
- ✅ Statistics panel updates accordingly
- ✅ Checkbox remains checked

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.4: Manufacturer-Model Picker - Multiple Selections
**Objective:** Verify multiple selections are serialized correctly

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Select "Ford:F-150" and "Ford:Mustang"
3. Click "Apply"
4. Observe URL format

**Expected Results:**
- ✅ URL contains `?modelCombos=Ford:F-150,Ford:Mustang`
- ✅ Picker shows "2 item(s) selected"
- ✅ Results table shows both models
- ✅ Both checkboxes remain checked

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.5: Manufacturer-Model Picker - Pagination
**Objective:** Verify picker pagination works correctly

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Note current page (should be page 1)
3. Click page 2 button
4. Observe data changes

**Expected Results:**
- ✅ Picker shows page 2 data
- ✅ Pagination controls update (page 2 active)
- ✅ "Showing X to Y of Z entries" updates correctly
- ✅ No errors in browser console
- ✅ Selected items persist across pages

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.6: Manufacturer-Model Picker - Search
**Objective:** Verify search filters picker data

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. In picker search box, type "Ford"
3. Observe filtered results

**Expected Results:**
- ✅ Picker shows only Ford-related entries
- ✅ Total count updates to filtered count
- ✅ Pagination resets to page 1
- ✅ Clearing search restores all data

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.7: Statistics Panel - Chart Display
**Objective:** Verify charts render with correct data

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Observe Statistics panel (no filters)
3. Verify all 4 charts display

**Expected Results:**
- ✅ Manufacturer Distribution chart displays
- ✅ Model Distribution chart displays
- ✅ Year Range Distribution chart displays
- ✅ Body Class Distribution chart displays
- ✅ All charts show data bars/elements
- ✅ Hover tooltips work on all charts

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.8: Statistics Panel - Highlight Interaction
**Objective:** Verify chart click highlights data

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Click on "Ford" bar in Manufacturer Distribution chart
3. Observe URL and chart highlighting

**Expected Results:**
- ✅ URL contains highlight parameter (e.g., `h_manufacturer=Ford`)
- ✅ Ford bar is highlighted in chart
- ✅ Other charts show highlighted vs total bars
- ✅ Results table does NOT filter (highlights are separate from filters)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.9: Results Table - Pagination
**Objective:** Verify results table pagination

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Note current page size (default 20)
3. Click page 2 button
4. Observe URL and data

**Expected Results:**
- ✅ URL contains `?page=2`
- ✅ Table shows records 21-40
- ✅ "Showing X to Y of Z entries" is correct
- ✅ No duplicate records

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC1.10: Results Table - Sorting
**Objective:** Verify column sorting works

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Click "Manufacturer" column header
3. Click again to reverse sort
4. Observe data order

**Expected Results:**
- ✅ Data sorts alphabetically ascending (first click)
- ✅ Data sorts alphabetically descending (second click)
- ✅ Sort icon updates (up/down arrow)
- ✅ URL reflects sort state (if implemented)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 2: Panel Collapse Functionality

#### TC2.1: Collapse Panel
**Objective:** Verify panel collapse hides content

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Click chevron-down icon on Query Control header
3. Observe panel state

**Expected Results:**
- ✅ Query Control content collapses (hidden)
- ✅ Only header remains visible
- ✅ Chevron icon changes to chevron-right
- ✅ Other panels unaffected

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC2.2: Expand Collapsed Panel
**Objective:** Verify expanding restores content

**Preconditions:** TC2.1 completed (Query Control collapsed)

**Steps:**
1. Click chevron-right icon on Query Control header
2. Observe panel state

**Expected Results:**
- ✅ Query Control content expands (visible)
- ✅ All previously visible elements restored
- ✅ Chevron icon changes to chevron-down
- ✅ State is preserved (e.g., filters still present)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC2.3: Multiple Panels Collapsed
**Objective:** Verify multiple panels can be collapsed independently

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Collapse Query Control
3. Collapse Manufacturer-Model Picker
4. Collapse Statistics
5. Leave Results expanded

**Expected Results:**
- ✅ Three panels collapsed, one expanded
- ✅ Each panel maintains independent collapse state
- ✅ Page remains navigable
- ✅ Expanding any panel works correctly

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 3: Panel Drag-Drop Reordering

#### TC3.1: Drag Panel to Reorder
**Objective:** Verify panels can be reordered via drag-drop

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Click and hold hamburger menu (☰) icon on Statistics panel header
3. Drag upwards to position above Picker
4. Release mouse button
5. Observe panel order

**Expected Results:**
- ✅ Drag preview appears while dragging
- ✅ Panels reorder on drop
- ✅ New order: Query Control → Statistics → Picker → Results
- ✅ All panels remain functional
- ✅ Console logs new panel order

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC3.2: Drag Panel to Top
**Objective:** Verify panel can be moved to first position

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Drag Results panel to top position (above Query Control)
3. Observe new order

**Expected Results:**
- ✅ Results panel moves to top
- ✅ Other panels shift down
- ✅ All panels functional

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC3.3: Drag Panel to Bottom
**Objective:** Verify panel can be moved to last position

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Drag Query Control panel to bottom position
3. Observe new order

**Expected Results:**
- ✅ Query Control moves to bottom
- ✅ Other panels shift up
- ✅ All panels functional

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 4: Single Panel Pop-Out

#### TC4.1: Pop Out Query Control
**Objective:** Verify Query Control can be popped out

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Add filter: manufacturer=Ford
3. Click external-link icon on Query Control header
4. Observe new window and main window

**Expected Results:**
- ✅ New window opens at `/panel/discover/query-control/query-control`
- ✅ Pop-out shows "Query Control" title
- ✅ Pop-out displays "Manufacturer: Ford" chip
- ✅ Main window shows placeholder: "Query Control is open in a separate window"
- ✅ External-link icon disappears in main window (already popped out)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.2: Pop-Out Query Control State Sync
**Objective:** Verify Query Control pop-out syncs with main window

**Preconditions:** TC4.1 completed (Query Control popped out)

**Steps:**
1. In main window, add filter: yearMin=2020 (via another method if needed, or use browser console)
2. Observe pop-out window
3. In pop-out, click X on "Manufacturer: Ford" chip
4. Observe main window URL and Results table

**Expected Results:**
- ✅ Pop-out immediately shows "Year Min: 2020" chip
- ✅ Main window URL updates to remove `manufacturer=Ford`
- ✅ Results table filters to yearMin=2020 only
- ✅ Pop-out no longer shows "Manufacturer: Ford" chip

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.3: Pop Out Manufacturer-Model Picker
**Objective:** Verify picker can be popped out

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Click external-link icon on Picker header
3. Observe new window

**Expected Results:**
- ✅ New window opens at `/panel/discover/manufacturer-model-picker/picker`
- ✅ Pop-out shows "Manufacturer-Model Picker" title
- ✅ Pop-out displays picker table with data
- ✅ Main window shows placeholder
- ✅ Picker remains functional in pop-out

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.4: Pop-Out Picker Selection Sync
**Objective:** Verify picker selection in pop-out updates main window

**Preconditions:** TC4.3 completed (Picker popped out)

**Steps:**
1. In pop-out picker, select "Ford:F-150"
2. Click "Apply"
3. Observe main window URL and Results table

**Expected Results:**
- ✅ Main window URL updates: `?modelCombos=Ford:F-150`
- ✅ Main window Results table filters to Ford F-150
- ✅ Main window Statistics panel updates
- ✅ Pop-out picker shows selection persisted

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.5: Pop-Out Picker Pagination (Known Issue)
**Objective:** Verify picker pagination in pop-out

**Preconditions:** TC4.3 completed (Picker popped out)

**Steps:**
1. In pop-out picker, click page 2
2. Observe pagination state
3. Click page 3
4. Observe pagination state

**Expected Results:**
- ✅ Picker navigates to page 2 correctly
- ✅ "Showing X to Y of Z" displays correct range
- ✅ Picker navigates to page 3 correctly
- ⚠️ **KNOWN ISSUE:** May show incorrect page numbers or fail to advance

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:** Document any race condition behavior

---

#### TC4.6: Pop Out Statistics Panel
**Objective:** Verify statistics can be popped out

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Add filter: manufacturer=Ford
3. Click external-link icon on Statistics header
4. Observe new window

**Expected Results:**
- ✅ New window opens at `/panel/discover/statistics-panel/statistics`
- ✅ Pop-out shows "Statistics" title
- ✅ Pop-out displays all 4 charts
- ✅ Charts reflect Ford-only data
- ✅ Main window shows placeholder

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.7: Pop-Out Statistics Chart Interaction
**Objective:** Verify chart interactions in pop-out update main window

**Preconditions:** TC4.6 completed (Statistics popped out)

**Steps:**
1. In pop-out Statistics panel, click "F-150" bar in Model Distribution chart
2. Observe main window URL and charts

**Expected Results:**
- ✅ Main window URL updates: `?h_modelCombos=Ford:F-150` (or similar)
- ✅ Pop-out chart highlights F-150 bar
- ✅ Other charts in pop-out show highlighted segments
- ✅ Main window (if Statistics were visible) would show same highlights

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.8: Pop Out Results Table
**Objective:** Verify results table can be popped out

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Add filter: bodyClass=SUV
3. Click external-link icon on Results header
4. Observe new window

**Expected Results:**
- ✅ New window opens at `/panel/discover/results-table/results`
- ✅ Pop-out shows "Results" title
- ✅ Pop-out displays table with SUV-only data
- ✅ Pagination works in pop-out
- ✅ Main window shows placeholder

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC4.9: Close Pop-Out Window
**Objective:** Verify closing pop-out restores main window panel

**Preconditions:** Any panel popped out

**Steps:**
1. Close pop-out window (click X or close button)
2. Observe main window

**Expected Results:**
- ✅ Pop-out window closes
- ✅ Main window placeholder disappears
- ✅ Main window panel content reappears
- ✅ Panel state is preserved (filters, selections, etc.)
- ✅ External-link icon reappears

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 5: Multiple Panel Pop-Outs

#### TC5.1: Pop Out Two Panels Simultaneously
**Objective:** Verify multiple panels can be popped out at once

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Pop out Query Control
3. Pop out Manufacturer-Model Picker
4. Observe both windows and main window

**Expected Results:**
- ✅ Two separate pop-out windows open
- ✅ Main window shows placeholders for both panels
- ✅ Statistics and Results remain in main window
- ✅ Both pop-outs functional

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC5.2: State Sync Across Multiple Pop-Outs
**Objective:** Verify state syncs across all windows

**Preconditions:** TC5.1 completed (Query Control and Picker popped out)

**Steps:**
1. In Query Control pop-out, add filter: manufacturer=Ford
2. Observe Picker pop-out, main window URL, and main window Results
3. In Picker pop-out, select "Ford:F-150" and Apply
4. Observe Query Control pop-out and main window

**Expected Results:**
- ✅ Picker pop-out updates to show only Ford entries
- ✅ Main window URL: `?manufacturer=Ford`
- ✅ Main window Results filters to Ford
- ✅ After picker selection, URL: `?manufacturer=Ford&modelCombos=Ford:F-150`
- ✅ Query Control pop-out shows both filter chips
- ✅ Main window Results filters to Ford F-150
- ✅ All windows remain synchronized

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC5.3: Pop Out All Panels
**Objective:** Verify all panels can be popped out simultaneously

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Pop out Query Control
3. Pop out Manufacturer-Model Picker
4. Pop out Statistics
5. Pop out Results
6. Observe all windows

**Expected Results:**
- ✅ Four separate pop-out windows open
- ✅ Main window shows four placeholders
- ✅ All pop-outs remain functional
- ✅ State syncs across all windows
- ✅ No performance degradation

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC5.4: Close One of Multiple Pop-Outs
**Objective:** Verify closing one pop-out doesn't affect others

**Preconditions:** Multiple panels popped out

**Steps:**
1. Close Picker pop-out window
2. Observe other pop-outs and main window

**Expected Results:**
- ✅ Picker pop-out closes
- ✅ Main window Picker panel reappears
- ✅ Other pop-outs remain open and functional
- ✅ State remains synchronized across remaining windows

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 6: URL State Management

#### TC6.1: Direct URL Navigation with Filters
**Objective:** Verify navigating to URL with query params initializes state

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?manufacturer=Ford&yearMin=2020`
2. Observe all panels

**Expected Results:**
- ✅ Query Control shows chips: "Manufacturer: Ford" and "Year Min: 2020"
- ✅ Results table filters to Ford vehicles from 2020+
- ✅ Statistics panel shows filtered data
- ✅ URL remains unchanged (no redirect)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.2: Direct URL Navigation with Picker Selection
**Objective:** Verify URL with picker selection initializes picker state

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?modelCombos=Ford:F-150,Ford:Mustang`
2. Observe Picker panel

**Expected Results:**
- ✅ Picker shows "2 item(s) selected"
- ✅ Ford:F-150 checkbox is checked
- ✅ Ford:Mustang checkbox is checked
- ✅ Results table shows only selected models
- ✅ Statistics panel reflects selection

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.3: Direct URL Navigation with Pagination
**Objective:** Verify URL with page parameter initializes pagination

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?page=3`
2. Observe Results table

**Expected Results:**
- ✅ Results table shows page 3 data
- ✅ Pagination controls show page 3 active
- ✅ "Showing X to Y of Z" reflects page 3 range

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.4: Direct URL Navigation with Highlights
**Objective:** Verify URL with highlight params initializes chart highlights

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?h_manufacturer=Ford`
2. Observe Statistics panel charts

**Expected Results:**
- ✅ Charts show highlighted bars for Ford
- ✅ Other manufacturers shown in default color
- ✅ Results table NOT filtered (highlights ≠ filters)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.5: Browser Back Button
**Objective:** Verify browser back navigation restores previous state

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Add filter: manufacturer=Ford
3. Add filter: yearMin=2020
4. Click browser back button
5. Click browser back button again

**Expected Results:**
- ✅ First back: removes yearMin, shows manufacturer=Ford state
- ✅ Query Control shows only "Manufacturer: Ford"
- ✅ Second back: removes manufacturer, shows clean state
- ✅ Query Control shows no filters
- ✅ URL matches state at each step

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.6: Browser Forward Button
**Objective:** Verify browser forward navigation restores future state

**Preconditions:** TC6.5 completed (back button navigation performed)

**Steps:**
1. Click browser forward button
2. Click browser forward button again

**Expected Results:**
- ✅ First forward: restores manufacturer=Ford
- ✅ Second forward: restores yearMin=2020
- ✅ State matches URL at each step

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC6.7: Refresh Page Preserves State
**Objective:** Verify page refresh maintains URL-based state

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Add filters, make selections, navigate to page 2
3. Press F5 (or Ctrl+R) to refresh
4. Observe all panels

**Expected Results:**
- ✅ URL persists across refresh
- ✅ All panels restore to pre-refresh state
- ✅ Query Control shows same filters
- ✅ Picker shows same selections
- ✅ Results shows same page
- ✅ Statistics shows same data

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 7: Edge Cases and Error Handling

#### TC7.1: Invalid URL Parameters
**Objective:** Verify app handles invalid URL params gracefully

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?manufacturer=InvalidManufacturer123`
2. Observe Results table and error handling

**Expected Results:**
- ✅ Query Control shows chip for invalid manufacturer
- ✅ Results table shows 0 results (or appropriate message)
- ✅ No JavaScript errors in console
- ✅ App remains functional

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.2: Malformed URL Parameters
**Objective:** Verify app handles malformed URL params

**Steps:**
1. Navigate to: `http://192.168.0.244:4205/discover?modelCombos=InvalidFormat`
2. Observe Picker and error handling

**Expected Results:**
- ✅ Picker attempts to parse selection
- ✅ Invalid format is ignored or handled gracefully
- ✅ No JavaScript errors
- ✅ App remains functional

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.3: Pop-Out Closed by User (Not via Main Window)
**Objective:** Verify main window detects pop-out closure

**Steps:**
1. Pop out Query Control
2. Manually close pop-out window (click X)
3. Wait 1-2 seconds
4. Observe main window

**Expected Results:**
- ✅ Main window detects closure within ~1 second
- ✅ Placeholder disappears
- ✅ Query Control panel reappears in main window
- ✅ State is preserved

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.4: Main Window Closed with Pop-Outs Open
**Objective:** Verify pop-outs are notified when main window closes

**Steps:**
1. Pop out Query Control and Picker
2. Close main window
3. Observe pop-out windows

**Expected Results:**
- ✅ Pop-outs receive close notification
- ⚠️ Pop-outs may close automatically OR
- ⚠️ Pop-outs show disconnected state
- ✅ No JavaScript errors in pop-outs

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.5: API Timeout/Error
**Objective:** Verify app handles API errors gracefully

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Stop backend API services
3. Add filter: manufacturer=Ford
4. Observe error handling

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error message displays after timeout
- ✅ User can retry or clear filters
- ✅ No application crash

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.6: Large Result Set (Performance)
**Objective:** Verify app handles large datasets

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover (no filters = max results)
2. Observe Results table load time
3. Navigate through pages
4. Observe Statistics charts

**Expected Results:**
- ✅ Initial load completes within 3 seconds
- ✅ Pagination is smooth (< 1 second per page)
- ✅ Charts render without lag
- ✅ No browser freezing

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC7.7: Rapid Filter Changes (Race Condition Test)
**Objective:** Verify app handles rapid state changes

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Rapidly add and remove filters (10+ times quickly):
   - Add manufacturer=Ford
   - Remove it
   - Add yearMin=2020
   - Remove it
   - Repeat rapidly
3. Observe final state

**Expected Results:**
- ✅ Final URL reflects last action only
- ✅ No duplicate API calls observable
- ✅ State is consistent across panels
- ✅ No JavaScript errors

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 8: Accessibility and Usability

#### TC8.1: Keyboard Navigation
**Objective:** Verify app is keyboard-navigable

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Use Tab key to navigate through interactive elements
3. Use Enter/Space to activate buttons
4. Use Escape to close dialogs

**Expected Results:**
- ✅ Focus indicator visible on all elements
- ✅ Tab order is logical (top to bottom, left to right)
- ✅ All buttons activatable via keyboard
- ✅ No keyboard traps

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC8.2: Tooltips on Hover
**Objective:** Verify tooltips provide helpful information

**Steps:**
1. Hover over collapse button (chevron)
2. Hover over pop-out button (external link)
3. Hover over drag handle (hamburger menu)

**Expected Results:**
- ✅ Collapse button shows "Collapse" or "Expand" tooltip
- ✅ Pop-out button shows "Pop out to separate window" tooltip
- ✅ Drag handle shows visual feedback (cursor changes to move)

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

#### TC8.3: Responsive Design (Window Resize)
**Objective:** Verify layout adapts to window size

**Steps:**
1. Navigate to http://192.168.0.244:4205/discover
2. Resize browser window to 1024px width
3. Resize to 768px width
4. Observe layout changes

**Expected Results:**
- ✅ Panels stack vertically at smaller widths
- ✅ No horizontal scrolling required
- ✅ All controls remain accessible
- ✅ Charts resize proportionally

**Status:** [ ] Pass [ ] Fail [ ] N/A
**Notes:**

---

### Section 9: Known Issues and Limitations

#### TC9.1: Picker Pagination in Pop-Out (KNOWN BUG)
**Reference:** Bug #6 in KNOWN-BUGS.md

**Observation:**
- When picker is popped out, pagination may fail to advance beyond page 3
- "Showing X to Y of Z" may display incorrect ranges
- Race condition between STATE_UPDATE and local pagination

**Status:** Known Issue
**Workaround:** Use picker in main window for pagination

---

#### TC9.2: Statistics Panel with Pre-Selected Filters (KNOWN BUG)
**Reference:** Bug #10 in KNOWN-BUGS.md (not yet fixed)

**Observation:**
- When popping out Statistics with bodyClass pre-selected in URL
- Charts may show incorrect/empty data initially
- STATE_UPDATE race condition on initialization

**Status:** Known Issue
**Workaround:** Pop out Statistics before applying filters

---

## Test Execution Summary

**Date:** 2025-12-04
**Tester:** Manual Testing Session
**Environment:** http://192.168.0.244:4205/discover

### Phase 2.1 Testing Progress (In Progress)

| Test Group | Total Tests | Passed | Failed | Pending | Pass Rate |
|---------|-------------|--------|--------|---------|-----------|
| **Dialog Cancel Behavior** | 5 | 3 | 0 | 2 | 60% |
| **Multiple Selection** | 5 | 0 | 0 | 5 | 0% |
| **Search/Filter in Dialog** | 4 | 0 | 0 | 4 | 0% |
| **Keyboard Navigation** | 4 | 0 | 0 | 4 | 0% |
| **Clear/Edit Filter** | 3 | 0 | 0 | 3 | 0% |
| **Remove Filter** | 3 | 0 | 0 | 3 | 0% |
| **PHASE 2.1 TOTAL** | **24** | **3** | **0** | **21** | **12.5%** |

### Previous Phases (Completed)

| Section | Total Tests | Passed | Failed | N/A | Pass Rate |
|---------|-------------|--------|--------|-----|-----------|
| Phase 1: Initial State + Single Selection (Tests 2.1.1-2.1.8) | 8 | 8 | 0 | 0 | 100% |

---

## Critical Issues Log

| Test Case | Severity | Description | Status |
|-----------|----------|-------------|--------|
| **BUG-NEW** | MEDIUM | Modal Dialog Close Handlers Not Working (X button, Escape key don't close dialogs) | NEW - Bug report filed: BUG-REPORT-MODAL-DIALOG-CLOSE.md |

---

## Notes and Observations

### Phase 2.1 Detailed Test Results (2025-12-05)

**Dialog Cancel Behavior Tests (2.1.9-2.1.13)**:
- [X] 2.1.9: Cancel Behavior - Multiselect to Multiselect - **PASS**
- [X] 2.1.10: Cancel Behavior - Multiselect to Range - **PASS**
- [X] 2.1.11: Dialog Reopen After Apply (Bug #15 Validation) - **PASS** ⚡ CRITICAL
- [ ] 2.1.12: Range Dialog Reopen - NOT YET TESTED
- [ ] 2.1.13: Multiple Filters Active - NOT YET TESTED

**Multiple Selection Tests (2.1.14-2.1.18)**:
- [ ] 2.1.14: Select Two Values - NOT YET TESTED
- [ ] 2.1.15: Select Three Values - NOT YET TESTED
- [ ] 2.1.16: Uncheck and Reapply - NOT YET TESTED
- [ ] 2.1.17: Select Many Then Deselect One - NOT YET TESTED
- [ ] 2.1.18: All Values Unchecked - NOT YET TESTED

**Search/Filter Tests (2.1.19-2.1.22)**:
- [ ] 2.1.19: Search Narrows List - NOT YET TESTED
- [ ] 2.1.20: Search Case-Insensitive - NOT YET TESTED
- [ ] 2.1.21: Search with No Matches - NOT YET TESTED
- [ ] 2.1.22: Clear Search Restores List - NOT YET TESTED

**Keyboard Navigation Tests (2.1.23-2.1.26)**:
- [ ] 2.1.23: Tab Navigation - NOT YET TESTED
- [ ] 2.1.24: Space to Select - NOT YET TESTED
- [ ] 2.1.25: Arrow Keys Navigate - NOT YET TESTED
- [ ] 2.1.26: Enter to Apply, Escape to Cancel - NOT YET TESTED

**Clear/Edit Tests (2.1.27-2.1.29)**:
- [ ] 2.1.27: Edit - Add More Values - NOT YET TESTED
- [ ] 2.1.28: Edit - Remove Values - NOT YET TESTED
- [ ] 2.1.29: Cancel Doesn't Affect Filter - NOT YET TESTED

**Remove Filter Tests (2.1.30-2.1.32)**:
- [ ] 2.1.30: Click X to Remove - NOT YET TESTED
- [ ] 2.1.31: Remove One of Multiple - NOT YET TESTED
- [ ] 2.1.32: Remove Then Re-add Different Value - NOT YET TESTED

**Key Findings**:
- Bug #15 fix (two-way binding) is working correctly - dialog reopens with pre-checked selections
- Bug #16 fix (observable sync) verified in previous session - results update immediately
- New Issue Found: X button and Escape key don't close dialogs (MEDIUM severity, reported separately)
- Modal behavior is correct - field selector dropdown properly blocked while dialog open

**Full Details**: See `PHASE-2.1-TEST-EXECUTION-GUIDE.md` and `PHASE-2.1-TEST-RESULTS.md` for comprehensive test information.

---

## Sign-Off

**Tester:** ___________________________ **Date:** _______________
**Reviewer:** ___________________________ **Date:** _______________
**Approved for Release:** [ ] Yes [ ] No

---

## Appendix A: Test Data Reference

### Known Valid Manufacturers
- Ford
- RAM OEM Trailer
- Tesla
- Chevrolet
- Toyota

### Known Valid Models
- F-150 (Ford)
- Mustang (Ford)
- OEM Trailer (RAM)
- Model S (Tesla)

### Known Valid Body Classes
- Pickup
- SUV
- Sedan
- Coupe
- Van
- Hatchback

### API Endpoints (for reference)
- Specs API: http://auto-discovery.minilab/api/specs/v1
- VINs API: http://auto-discovery.minilab/api/vins/v1

---

**End of Manual Test Plan**
