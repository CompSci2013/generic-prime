# Query Control Component - User Stories

**Created**: 2026-01-02
**Component**: Query Control Panel
**Location**: `frontend/src/framework/components/query-control/`
**Purpose**: Comprehensive user stories for QA component testing
**Current Scope**: Validation that user stories accurately describe actual component behavior (not fixing bugs)

---

## Validation Status Legend

| Marker | Meaning |
|--------|---------|
| `[x] VERIFIED` | Automated test passed |
| `[?] FLAGGED` | Needs human review |
| `[ ] UNVERIFIED` | Not yet tested |
| `[!] INCORRECT` | Story doesn't match actual behavior |
| `[!] BUG` | Functionality works but has defect |
| `[-] N/A` | Not applicable or can't be tested |

**Story Status**: Derived from criteria (all VERIFIED → VERIFIED, any INCORRECT → INCORRECT, any BUG/FLAGGED → PARTIAL)

---

## Validation Rubric

All interactive controls MUST follow industry-standard behavior:

### Keyboard Accessibility (WCAG 2.1 Compliance)
- **Tab**: Move focus between controls
- **Arrow keys**: Navigate within control (dropdown options, list items)
- **Enter/Space**: Activate focused/highlighted item
- **Escape**: Close dropdown/dialog without selection

### Expected Behaviors
- Mouse click and keyboard activation must produce identical results
- Focus indicators must be visible
- No keyboard traps (user can always tab away)

**Any deviation from these standards is logged as `[!] BUG`**

---

## Known Bugs

| ID | Story | Description | Severity |
|----|-------|-------------|----------|
| BUG-001 | US-QC-001 | Filter field dropdown: Spacebar adds space to search instead of selecting highlighted option. Arrow key navigation works, but keyboard selection does not. Must use mouse. | Medium |

---

## Overview

The Query Control component provides manual filter management, allowing users to add, edit, and remove filters on data. It displays both **Active Filters** (data filtering) and **Active Highlights** (chart segmentation).

---

## Epic 1: Filter Field Selection

### US-QC-001: View Available Filter Fields
**Status**: PARTIAL

**As a** data analyst
**I want to** see a list of all available filter fields
**So that** I can choose which attribute to filter by

**Acceptance Criteria**:
- [x] VERIFIED - Clicking "Add filter by field..." dropdown expands a list
- [x] VERIFIED - List shows configured filter fields (Manufacturer, Model, Year, Body Class, Manufacturer & Model)
- [x] VERIFIED - Each field is clickable (mouse)
- [!] BUG-001 - Keyboard: Enter/Space selects highlighted option (see Known Bugs)

---

### US-QC-002: Search for Filter Field
**Status**: VERIFIED

**As a** data analyst
**I want to** search for a filter field by typing
**So that** I can quickly find the field I need in a long list

**Acceptance Criteria**:
- [x] VERIFIED - Search box appears at top of dropdown
- [x] VERIFIED - Typing filters the list in real-time (no debounce)
- [x] VERIFIED - Search is case-insensitive
- [x] VERIFIED - Partial matches are shown (typing "body" shows "Body Class")
- [x] VERIFIED - Clearing search restores full list (5 options restored)

---

### US-QC-003: Select Field to Open Dialog
**Status**: PARTIAL

**As a** data analyst
**I want to** click a field to open its filter dialog
**So that** I can select specific filter values

**Acceptance Criteria**:
- [x] VERIFIED - Clicking field name closes dropdown
- [x] VERIFIED - Appropriate dialog opens (multiselect or year picker) - **Body Class shows multiselect with checkboxes**
- [x] VERIFIED - Dialog loads available options from API - **9 body classes loaded: Convertible, Coupe, Hatchback, Limousine, Pickup, SUV, Sedan, Sports Car, Touring Car**
- [?] FLAGGED - Loading state shown while fetching options - **Needs manual review (too fast to capture)**

---

## Epic 2: Multiselect Filters (Manufacturer, Model, Body Class, Data Source)

### US-QC-010: View Multiselect Options
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see all available values for a filter field
**So that** I can select the ones I need

**Acceptance Criteria**:
- [ ] UNVERIFIED - Dialog opens with title "Select [Field Name]s"
- [ ] UNVERIFIED - Checkbox list displays all available options
- [ ] UNVERIFIED - Options are scrollable if list is long
- [ ] UNVERIFIED - Options loaded from API endpoint
- [ ] UNVERIFIED - Keyboard: Tab moves focus, Arrow keys navigate options

---

### US-QC-011: Search Within Multiselect Options
**Status**: UNVERIFIED

**As a** data analyst
**I want to** search within the option list
**So that** I can find specific values quickly

**Acceptance Criteria**:
- [ ] UNVERIFIED - Search box at top of dialog
- [ ] UNVERIFIED - Typing filters checkbox list (300ms debounce)
- [ ] UNVERIFIED - Search is case-insensitive
- [ ] UNVERIFIED - Current selections remain visible even if not matching search
- [ ] UNVERIFIED - Clearing search restores full list with selections preserved

---

### US-QC-012: Select Multiple Options
**Status**: UNVERIFIED

**As a** data analyst
**I want to** select multiple values for a filter
**So that** I can include several options in my search

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking checkbox toggles selection
- [ ] UNVERIFIED - Multiple selections allowed (no limit)
- [ ] UNVERIFIED - Selection count displayed at bottom ("Selected (3): Sedan, SUV, Pickup")
- [ ] UNVERIFIED - All selections persist while dialog is open
- [ ] UNVERIFIED - Keyboard: Space toggles checkbox on focused option

---

### US-QC-013: Apply Multiselect Filter
**Status**: UNVERIFIED

**As a** data analyst
**I want to** apply my selections as a filter
**So that** the data is filtered to match my criteria

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking "Apply" closes dialog
- [ ] UNVERIFIED - Filter chip appears in "Active Filters" section
- [ ] UNVERIFIED - Chip shows field name and all selected values
- [ ] UNVERIFIED - URL updates with filter parameter (e.g., `?bodyClass=Sedan,SUV`)
- [ ] UNVERIFIED - Results table refreshes with filtered data
- [ ] UNVERIFIED - Statistics and charts update
- [ ] UNVERIFIED - Keyboard: Enter activates Apply button when focused

---

### US-QC-014: Cancel Multiselect Dialog
**Status**: UNVERIFIED

**As a** data analyst
**I want to** cancel my selections without applying
**So that** I can abort if I change my mind

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking "Cancel" closes dialog
- [ ] UNVERIFIED - No filter applied
- [ ] UNVERIFIED - URL unchanged
- [ ] UNVERIFIED - Results unchanged
- [ ] UNVERIFIED - Selections not persisted (re-opening shows clean slate)
- [ ] UNVERIFIED - Keyboard: Escape closes dialog (same as Cancel)

---

### US-QC-015: Close Dialog via X Button
**Status**: UNVERIFIED

**As a** data analyst
**I want to** close the dialog using the X button
**So that** I have multiple ways to cancel

**Acceptance Criteria**:
- [ ] UNVERIFIED - X button in top-right corner
- [ ] UNVERIFIED - Clicking X closes dialog (same as Cancel)
- [ ] UNVERIFIED - No side effects

---

### US-QC-016: Close Dialog via Escape Key
**Status**: UNVERIFIED

**As a** data analyst
**I want to** close the dialog by pressing Escape
**So that** I can quickly cancel using keyboard

**Acceptance Criteria**:
- [ ] UNVERIFIED - Pressing Escape key closes dialog
- [ ] UNVERIFIED - Same behavior as clicking Cancel
- [ ] UNVERIFIED - Focus returns to main page

---

## Epic 3: Year Range Filter

### US-QC-020: Open Year Range Picker
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filter by year range
**So that** I can focus on vehicles from specific time periods

**Acceptance Criteria**:
- [ ] UNVERIFIED - Selecting "Year" opens year range dialog
- [ ] UNVERIFIED - Dialog shows decade grid (e.g., 2020-2029)
- [ ] UNVERIFIED - Left/right arrows navigate between decades
- [ ] UNVERIFIED - Input field shows "Select Year Range" initially
- [ ] UNVERIFIED - Keyboard: Arrow keys navigate grid, Enter selects year

---

### US-QC-021: Select Start Year
**Status**: UNVERIFIED

**As a** data analyst
**I want to** select a starting year
**So that** I can define the beginning of my range

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking a year selects it as start year
- [ ] UNVERIFIED - Input field updates to show "1980 - "
- [ ] UNVERIFIED - Year appears highlighted/selected in grid

---

### US-QC-022: Select End Year
**Status**: UNVERIFIED

**As a** data analyst
**I want to** select an ending year
**So that** I can define the complete range

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking second year sets end of range
- [ ] UNVERIFIED - Input field shows "1980 - 2003"
- [ ] UNVERIFIED - Both years highlighted in grid
- [ ] UNVERIFIED - Range between them may also be highlighted

---

### US-QC-023: Navigate Decades
**Status**: UNVERIFIED

**As a** data analyst
**I want to** navigate between decades
**So that** I can select years from different time periods

**Acceptance Criteria**:
- [ ] UNVERIFIED - Left arrow navigates to previous decade
- [ ] UNVERIFIED - Right arrow navigates to next decade
- [ ] UNVERIFIED - Grid updates to show new decade
- [ ] UNVERIFIED - Existing selection preserved during navigation

---

### US-QC-024: Apply Year Range Filter
**Status**: UNVERIFIED

**As a** data analyst
**I want to** apply my year range as a filter
**So that** results are limited to that time period

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking "Apply" closes dialog
- [ ] UNVERIFIED - Chip appears: "Year: 1980 - 2003"
- [ ] UNVERIFIED - URL updates: `?yearMin=1980&yearMax=2003`
- [ ] UNVERIFIED - Results filtered to vehicles from 1980-2003 (inclusive)

---

### US-QC-025: Select Single Year
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filter to a single year
**So that** I can see only vehicles from that year

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking same year twice sets single-year range
- [ ] UNVERIFIED - Or: clicking one year and Apply creates single-year filter
- [ ] UNVERIFIED - Chip shows: "Year: 2020"
- [ ] UNVERIFIED - URL: `?yearMin=2020&yearMax=2020`

---

### US-QC-026: Select Open-Ended Range (Start Only)
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filter "from year X onward"
**So that** I can see all vehicles after a certain year

**Acceptance Criteria**:
- [ ] UNVERIFIED - Select only start year, leave end empty
- [ ] UNVERIFIED - Apply creates filter: "Year: 2020 - "
- [ ] UNVERIFIED - URL: `?yearMin=2020` (no yearMax)
- [ ] UNVERIFIED - Results include 2020 and all later years

---

### US-QC-027: Select Open-Ended Range (End Only)
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filter "up to year X"
**So that** I can see all vehicles before a certain year

**Acceptance Criteria**:
- [ ] UNVERIFIED - Select only end year, leave start empty
- [ ] UNVERIFIED - Apply creates filter: "Year: - 2003"
- [ ] UNVERIFIED - URL: `?yearMax=2003` (no yearMin)
- [ ] UNVERIFIED - Results include 2003 and all earlier years

---

## Epic 4: Active Filter Chips

### US-QC-030: View Active Filters
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see all my active filters at a glance
**So that** I know what criteria are currently applied

**Acceptance Criteria**:
- [ ] UNVERIFIED - "Active Filters:" section displays all filter chips
- [ ] UNVERIFIED - Each chip shows field name and values
- [ ] UNVERIFIED - Chips displayed horizontally with wrapping
- [ ] UNVERIFIED - Empty state: section hidden or shows "No active filters"

---

### US-QC-031: Remove Filter via Chip
**Status**: UNVERIFIED

**As a** data analyst
**I want to** remove a filter by clicking its X button
**So that** I can quickly broaden my search

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking X (⊗) on chip removes that filter
- [ ] UNVERIFIED - Chip disappears immediately
- [ ] UNVERIFIED - URL parameter removed
- [ ] UNVERIFIED - Results refresh without that filter
- [ ] UNVERIFIED - Other filters remain active
- [ ] UNVERIFIED - Keyboard: Tab to chip, Enter/Delete removes it

---

### US-QC-032: Edit Filter via Chip Click
**Status**: UNVERIFIED

**As a** data analyst
**I want to** edit a filter by clicking its chip
**So that** I can modify my selections

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking anywhere on chip (not X button) opens edit dialog
- [ ] UNVERIFIED - Dialog shows with current selections pre-checked
- [ ] UNVERIFIED - Can add or remove selections
- [ ] UNVERIFIED - Apply updates the filter
- [ ] UNVERIFIED - Cancel preserves original values
- [ ] UNVERIFIED - Keyboard: Tab to chip, Space opens edit dialog

---

### US-QC-033: View Filter Chip Tooltip
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see full filter details on hover
**So that** I can read truncated values

**Acceptance Criteria**:
- [ ] UNVERIFIED - Hovering chip shows tooltip
- [ ] UNVERIFIED - Tooltip format: "[Field]: [All Values] (Click to edit)"
- [ ] UNVERIFIED - Full values shown even if chip text is truncated

---

### US-QC-034: Truncated Chip Display
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see long filter values abbreviated
**So that** chips don't take too much space

**Acceptance Criteria**:
- [ ] UNVERIFIED - Chips with many values truncate with "..."
- [ ] UNVERIFIED - Example: "Body Class: Sedan, SUV, Pickup... +5 more"
- [ ] UNVERIFIED - Full values visible in tooltip and edit dialog

---

## Epic 5: Highlight Filters

### US-QC-040: Add Highlight Filter
**Status**: UNVERIFIED

**As a** data analyst
**I want to** add a highlight filter
**So that** specific data segments are visually distinguished in charts

**Acceptance Criteria**:
- [ ] UNVERIFIED - Highlight fields appear in dropdown (Highlight Manufacturer, Highlight Models, etc.)
- [ ] UNVERIFIED - Selecting highlight field opens same dialog type as regular filter
- [ ] UNVERIFIED - Applied highlight appears in "Active Highlights" section (not Active Filters)
- [ ] UNVERIFIED - Highlight chips styled differently (yellow/amber vs blue)

---

### US-QC-041: Distinguish Highlights from Filters
**Status**: UNVERIFIED

**As a** data analyst
**I want to** visually distinguish highlights from filters
**So that** I understand which affect filtering vs. visualization

**Acceptance Criteria**:
- [ ] UNVERIFIED - Regular filters: blue-ish chip styling
- [ ] UNVERIFIED - Highlight filters: yellow/amber chip styling (#fff3cd background)
- [ ] UNVERIFIED - Separate sections: "Active Filters:" and "Active Highlights:"
- [ ] UNVERIFIED - URL parameters differ: `bodyClass=` vs `h_bodyClass=`

---

### US-QC-042: Clear All Highlights
**Status**: UNVERIFIED

**As a** data analyst
**I want to** clear all highlight filters at once
**So that** I can reset chart segmentation

**Acceptance Criteria**:
- [ ] UNVERIFIED - "Clear All Highlights" link visible in highlights section
- [ ] UNVERIFIED - Clicking removes all highlight chips
- [ ] UNVERIFIED - URL parameters `h_*` removed
- [ ] UNVERIFIED - Charts update to show unsegmented data
- [ ] UNVERIFIED - Regular filters remain unchanged

---

### US-QC-043: Edit Highlight Filter
**Status**: UNVERIFIED

**As a** data analyst
**I want to** edit an existing highlight filter
**So that** I can modify chart segmentation

**Acceptance Criteria**:
- [ ] UNVERIFIED - Clicking highlight chip opens edit dialog
- [ ] UNVERIFIED - Current selections pre-checked
- [ ] UNVERIFIED - Apply updates highlight
- [ ] UNVERIFIED - Cancel preserves original

---

### US-QC-044: Remove Single Highlight
**Status**: UNVERIFIED

**As a** data analyst
**I want to** remove one highlight filter
**So that** I can adjust segmentation incrementally

**Acceptance Criteria**:
- [ ] UNVERIFIED - X button on highlight chip
- [ ] UNVERIFIED - Clicking removes only that highlight
- [ ] UNVERIFIED - Other highlights and regular filters preserved

---

## Epic 6: Clear All Actions

### US-QC-050: Clear All Filters and Highlights
**Status**: UNVERIFIED

**As a** data analyst
**I want to** reset all filters and highlights at once
**So that** I can start fresh

**Acceptance Criteria**:
- [ ] UNVERIFIED - "Clear All" button in panel header (red styling)
- [ ] UNVERIFIED - Clicking removes ALL filter chips AND highlight chips
- [ ] UNVERIFIED - URL resets to `?page=1&size=20`
- [ ] UNVERIFIED - Results show complete dataset (4,887 vehicles)
- [ ] UNVERIFIED - Charts show unsegmented complete data

---

### US-QC-051: Clear All Button State
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see when Clear All is available
**So that** I know if there are filters to clear

**Acceptance Criteria**:
- [ ] UNVERIFIED - Button disabled (greyed) when no filters OR highlights active
- [ ] UNVERIFIED - Button enabled when one or more filters OR highlights active
- [ ] UNVERIFIED - Visual state updates immediately on filter changes

---

## Epic 7: URL Persistence and Sharing

### US-QC-060: Persist Filters in URL
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see my filters reflected in the URL
**So that** I can bookmark or share my view

**Acceptance Criteria**:
- [ ] UNVERIFIED - Every filter change updates URL parameters
- [ ] UNVERIFIED - URL is bookmarkable
- [ ] UNVERIFIED - No localStorage dependency for filters

---

### US-QC-061: Restore Filters from URL
**Status**: UNVERIFIED

**As a** data analyst
**I want to** restore filters when opening a shared URL
**So that** I see the same view as the sender

**Acceptance Criteria**:
- [ ] UNVERIFIED - Opening URL with parameters restores all filters
- [ ] UNVERIFIED - Filter chips appear for each URL parameter
- [ ] UNVERIFIED - Results are already filtered on page load
- [ ] UNVERIFIED - Works across browser sessions

---

### US-QC-062: Share Filtered View
**Status**: UNVERIFIED

**As a** data analyst
**I want to** copy and share the current URL
**So that** colleagues can see my exact view

**Acceptance Criteria**:
- [ ] UNVERIFIED - URL in browser bar contains all filter state
- [ ] UNVERIFIED - Pasting URL in new window reproduces exact view
- [ ] UNVERIFIED - Works for different users (no user-specific state)

---

### US-QC-063: Browser Back/Forward Navigation
**Status**: UNVERIFIED

**As a** data analyst
**I want to** use browser back/forward buttons
**So that** I can navigate my filter history

**Acceptance Criteria**:
- [ ] UNVERIFIED - Adding filter creates history entry
- [ ] UNVERIFIED - Back button removes most recent filter
- [ ] UNVERIFIED - Forward button re-applies removed filter
- [ ] UNVERIFIED - Chips and results update accordingly

---

## Epic 8: Panel Behavior

### US-QC-070: Collapse Query Control Panel
**Status**: UNVERIFIED

**As a** data analyst
**I want to** collapse the Query Control panel
**So that** I can save screen space

**Acceptance Criteria**:
- [ ] UNVERIFIED - Collapse button (−) in panel header
- [ ] UNVERIFIED - Clicking hides panel content, shows only header
- [ ] UNVERIFIED - Collapse state persisted to localStorage
- [ ] UNVERIFIED - Restored on page refresh

---

### US-QC-071: Expand Collapsed Panel
**Status**: UNVERIFIED

**As a** data analyst
**I want to** expand a collapsed panel
**So that** I can access the controls again

**Acceptance Criteria**:
- [ ] UNVERIFIED - Expand button (+) shown when collapsed
- [ ] UNVERIFIED - Clicking restores full panel content
- [ ] UNVERIFIED - Filters and highlights still visible

---

### US-QC-072: Pop-Out Query Control
**Status**: UNVERIFIED

**As a** data analyst
**I want to** pop out the Query Control to a separate window
**So that** I can have more screen real estate

**Acceptance Criteria**:
- [ ] UNVERIFIED - Pop-out button appears on hover
- [ ] UNVERIFIED - Clicking opens panel in new window
- [ ] UNVERIFIED - Main page shows placeholder
- [ ] UNVERIFIED - Changes in pop-out sync to main window via BroadcastChannel

---

### US-QC-073: Sync Filter Changes in Pop-Out
**Status**: UNVERIFIED

**As a** data analyst
**I want to** add filters in the pop-out window
**So that** the main window updates accordingly

**Acceptance Criteria**:
- [ ] UNVERIFIED - Adding filter in pop-out updates main window URL
- [ ] UNVERIFIED - Main window results refresh
- [ ] UNVERIFIED - Main window filter chips update
- [ ] UNVERIFIED - No manual refresh required

---

## Epic 9: Error Handling

### US-QC-080: Handle API Error Loading Options
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see helpful error messages
**So that** I know when something goes wrong

**Acceptance Criteria**:
- [ ] UNVERIFIED - If API fails to load options, dialog shows error message
- [ ] UNVERIFIED - "Failed to load options" or similar
- [ ] UNVERIFIED - Retry button available
- [ ] UNVERIFIED - Clicking Retry re-attempts API call

---

### US-QC-081: Handle Network Timeout
**Status**: UNVERIFIED

**As a** data analyst
**I want to** be notified of slow responses
**So that** I'm not left waiting indefinitely

**Acceptance Criteria**:
- [ ] UNVERIFIED - Requests timeout after reasonable period (10s)
- [ ] UNVERIFIED - Timeout message shown: "Request timed out"
- [ ] UNVERIFIED - Retry button available

---

### US-QC-082: Handle Invalid URL Parameters
**Status**: UNVERIFIED

**As a** data analyst
**I want to** gracefully handle bad URL values
**So that** the app doesn't crash on invalid input

**Acceptance Criteria**:
- [ ] UNVERIFIED - Invalid filter values in URL are ignored
- [ ] UNVERIFIED - No error thrown
- [ ] UNVERIFIED - Valid parameters still applied
- [ ] UNVERIFIED - No chip created for invalid values

---

### US-QC-083: Handle Zero Results
**Status**: UNVERIFIED

**As a** data analyst
**I want to** know when my filters yield no results
**So that** I can adjust my criteria

**Acceptance Criteria**:
- [ ] UNVERIFIED - Results table shows empty state message
- [ ] UNVERIFIED - "No vehicles match your filters"
- [ ] UNVERIFIED - Filters remain active (can remove to broaden)
- [ ] UNVERIFIED - Statistics show 0 counts

---

## Epic 10: Accessibility

### US-QC-090: Keyboard Navigation
**Status**: UNVERIFIED

**As a** keyboard user
**I want to** navigate Query Control without a mouse
**So that** I can use the app accessibly

**Acceptance Criteria**:
- [ ] UNVERIFIED - Tab navigates through all interactive elements
- [ ] UNVERIFIED - Focus order is logical (dropdown → chips → clear button)
- [ ] UNVERIFIED - Enter/Space activates buttons and checkboxes
- [ ] UNVERIFIED - Arrow keys navigate dropdown and dialog options

---

### US-QC-091: Screen Reader Announcements
**Status**: UNVERIFIED

**As a** screen reader user
**I want to** hear filter information announced
**So that** I can understand the current state

**Acceptance Criteria**:
- [ ] UNVERIFIED - Chips have ARIA labels describing content
- [ ] UNVERIFIED - "Body Class filter: Sedan, SUV. Press Enter to edit, Delete to remove"
- [ ] UNVERIFIED - Dialog has proper aria-labelledby
- [ ] UNVERIFIED - Selection changes announced

---

### US-QC-092: Focus Management
**Status**: UNVERIFIED

**As a** keyboard user
**I want to** maintain focus context
**So that** I don't lose my place

**Acceptance Criteria**:
- [ ] UNVERIFIED - Opening dialog traps focus within dialog
- [ ] UNVERIFIED - Closing dialog returns focus to trigger element
- [ ] UNVERIFIED - Removing chip moves focus to next chip or dropdown

---

### US-QC-093: Color Contrast
**Status**: UNVERIFIED

**As a** low-vision user
**I want to** see sufficient color contrast
**So that** I can read the interface

**Acceptance Criteria**:
- [ ] UNVERIFIED - Text meets WCAG 4.5:1 contrast ratio
- [ ] UNVERIFIED - Chip text readable on chip background
- [ ] UNVERIFIED - Buttons and links distinguishable
- [ ] UNVERIFIED - Focus indicators visible

---

## Epic 11: Integration with Other Components

### US-QC-100: Coordinate with Model Picker
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filters from Query Control to work with Model Picker
**So that** I can combine filtering methods

**Acceptance Criteria**:
- [ ] UNVERIFIED - Query Control filters AND Model Picker selections combine (AND logic)
- [ ] UNVERIFIED - URL contains both `manufacturer=` and `modelCombos=`
- [ ] UNVERIFIED - Results reflect intersection of both
- [ ] UNVERIFIED - Changing one updates results immediately

---

### US-QC-101: Update Charts on Filter Change
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see charts update when I filter
**So that** visualizations reflect current data

**Acceptance Criteria**:
- [ ] UNVERIFIED - Adding/removing filter triggers chart update
- [ ] UNVERIFIED - Charts show filtered data subset
- [ ] UNVERIFIED - Highlight filters segment chart bars
- [ ] UNVERIFIED - No manual refresh required

---

### US-QC-102: Update Statistics on Filter Change
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see statistics update when I filter
**So that** I know the size of my filtered dataset

**Acceptance Criteria**:
- [ ] UNVERIFIED - Statistics component receives filtered data
- [ ] UNVERIFIED - Counts, distributions update
- [ ] UNVERIFIED - Matches results table row count

---

### US-QC-103: Results Table Pagination Reset
**Status**: UNVERIFIED

**As a** data analyst
**I want to** return to page 1 when filtering
**So that** I don't see an empty page

**Acceptance Criteria**:
- [ ] UNVERIFIED - Adding filter resets to page 1
- [ ] UNVERIFIED - URL updates: `?bodyClass=Sedan&page=1`
- [ ] UNVERIFIED - Results show first page of filtered data

---

## Epic 12: Edge Cases

### US-QC-110: Rapid Filter Changes
**Status**: UNVERIFIED

**As a** data analyst
**I want to** quickly add/remove multiple filters
**So that** the app keeps up with my actions

**Acceptance Criteria**:
- [ ] UNVERIFIED - Rapid clicks don't cause race conditions
- [ ] UNVERIFIED - Final state is consistent
- [ ] UNVERIFIED - No duplicate API calls
- [ ] UNVERIFIED - URL reflects final state

---

### US-QC-111: Empty Selection Apply (TBD)
**Status**: UNVERIFIED

**As a** data analyst
**I want to** understand what happens with empty selection
**So that** I don't accidentally clear filters

**Acceptance Criteria** (TBD - needs product decision):
- [ ] UNVERIFIED - Option A: Validation error "Select at least one option"
- [ ] UNVERIFIED - Option B: Removes existing filter for that field
- [ ] UNVERIFIED - Option C: Apply button disabled until selection made

---

### US-QC-112: Special Characters in Filter Values
**Status**: UNVERIFIED

**As a** data analyst
**I want to** filter by values containing special characters
**So that** I can find all data correctly

**Acceptance Criteria**:
- [ ] UNVERIFIED - Values with commas, ampersands, quotes work
- [ ] UNVERIFIED - URL-encoded properly
- [ ] UNVERIFIED - Decoded correctly on page load
- [ ] UNVERIFIED - Chip displays human-readable value

---

### US-QC-113: Very Long Filter Value List
**Status**: UNVERIFIED

**As a** data analyst
**I want to** select many values (20+) for one filter
**So that** I can create complex criteria

**Acceptance Criteria**:
- [ ] UNVERIFIED - No maximum selection limit
- [ ] UNVERIFIED - Chip truncates with count: "+17 more"
- [ ] UNVERIFIED - URL encodes all values
- [ ] UNVERIFIED - Edit dialog shows all selections

---

### US-QC-114: Conflicting Filters (Zero Results)
**Status**: UNVERIFIED

**As a** data analyst
**I want to** see feedback when filters conflict
**So that** I know to adjust my criteria

**Acceptance Criteria**:
- [ ] UNVERIFIED - Filters that result in 0 matches still apply
- [ ] UNVERIFIED - Empty results message shown
- [ ] UNVERIFIED - User can remove filters to broaden
- [ ] UNVERIFIED - No automatic removal of conflicting filters

---

---

## Summary Statistics

| Epic | Stories | Criteria | Status |
|------|---------|----------|--------|
| 1: Filter Field Selection | 3 | 13 | UNVERIFIED |
| 2: Multiselect Filters | 7 | 27 | UNVERIFIED |
| 3: Year Range Filter | 8 | 27 | UNVERIFIED |
| 4: Active Filter Chips | 5 | 18 | UNVERIFIED |
| 5: Highlight Filters | 5 | 17 | UNVERIFIED |
| 6: Clear All Actions | 2 | 8 | UNVERIFIED |
| 7: URL Persistence | 4 | 12 | UNVERIFIED |
| 8: Panel Behavior | 4 | 14 | UNVERIFIED |
| 9: Error Handling | 4 | 14 | UNVERIFIED |
| 10: Accessibility | 4 | 15 | UNVERIFIED |
| 11: Integration | 4 | 12 | UNVERIFIED |
| 12: Edge Cases | 5 | 17 | UNVERIFIED |
| **Total** | **55** | **194** | **UNVERIFIED** |

---

## Validation Progress

| Status | Count | Percentage |
|--------|-------|------------|
| VERIFIED | 0 | 0% |
| FLAGGED | 0 | 0% |
| INCORRECT | 0 | 0% |
| UNVERIFIED | 194 | 100% |

**Last Validated**: Not yet validated

---

## Sources Referenced

- Component code: `query-control.component.ts`, `.html`, `.scss`
- Existing specs: `cruft/components/query-control/specification.md`
- Draft spec: `cruft/components/query-control/SPEC-DRAFT-IN-PROGRESS.md`
- Highlight summary: `cruft/investigation/QUERY-CONTROL-HIGHLIGHTS-SUMMARY.md`
- Discover spec: `cruft/specs/03-discover-feature-specification.md`
- Existing E2E tests: `frontend/e2e/components/query-control*.spec.ts`

---

**Last Updated**: 2026-01-02
