# UX Standards: Dropdown Filters with Search & Selection

**Purpose**: Define industry-standard UX expectations for dropdown filter controls with search capability and single/multi-select options.

**Date**: 2025-12-04

---

## PART A: Single-Select Dropdown with Search/Filter

This describes the expected UX behavior for a searchable dropdown that allows selecting **one option** from a list.

### 1. Initial State

- **Visual**: Dropdown displays a clear placeholder text (e.g., "Select an option...")
- **Keyboard Focus**: When focused via Tab, the dropdown receives focus
- **Accessibility**: The control is properly labeled and labeling is visible to screen readers

### 2. Opening the Dropdown

**Mouse**: User clicks on the dropdown trigger or the input area → dropdown list appears below the field

**Keyboard**:
- User presses `Space` or `Enter` while dropdown has focus → list expands
- User presses `Down Arrow` while dropdown has focus → list expands and focus moves to first option
- `Escape` key has no effect when dropdown is closed

### 3. Filtering Options by Typing

**Entering Search Text**:
- When dropdown is open, user can type characters to filter the list
- Filtering is **real-time** (as user types, list updates immediately)
- Filtering is typically **case-insensitive** and matches partial text (substring matching)
- Example: Typing "bra" matches "Brammo", "Brand", "Brazil"

**Search Input Focus**:
- Typing should focus the search input field automatically
- User does not need to click the search box; they can start typing immediately after opening

**Search Field Visibility**:
- Search field is clearly visible and labeled (e.g., "Search options...")
- It appears at the top of the dropdown list or within the dropdown
- User can clear search field with standard text editing (Backspace, Delete, Ctrl+A)

### 4. Navigating Options with Keyboard

**When dropdown is open with focus**:
- `Down Arrow`: Moves focus/highlight to the next option in the list
- `Up Arrow`: Moves focus/highlight to the previous option in the list
- `End`: Jumps to the last option
- `Home`: Jumps to the first option
- Navigation wraps around (going past last option wraps to first; going before first wraps to last)

**Visual Feedback**:
- Currently focused/highlighted option has distinct visual styling (background color, border, or text highlight)
- List scrolls automatically to keep focused option in view

### 5. Selecting an Option

**Mouse**:
- User clicks on an option → option is selected, dropdown closes
- Selected option is displayed in the dropdown field

**Keyboard**:
- User presses `Enter` or `Space` while a option is highlighted → option is selected, dropdown closes
- User presses `Tab` while dropdown is open → dropdown closes without selection (loses focus)
- `Escape` → dropdown closes without selection, focus remains on the dropdown field

### 6. Selected State

- Selected option is displayed in the dropdown field (showing the label or value)
- Dropdown can be reopened to view other options
- If user opens dropdown again without selecting, previously selected option may be highlighted (showing current state)

### 7. Clearing Selection

**If "Clear" button is available**:
- User clicks clear button or presses dedicated key combination → selection is removed, placeholder text returns

---

## PART B: Multi-Select Dropdown with Search & Checkboxes

This describes the expected UX behavior for a searchable dropdown with **checkboxes** allowing selection of **multiple options** from a list.

### 1. Initial State

- **Visual**: Dropdown displays a clear placeholder text (e.g., "Select options...")
- **Selected Count**: Optionally shows count of selected items (e.g., "3 selected")
- **Keyboard Focus**: When focused via Tab, the dropdown receives focus
- **Accessibility**: Labeled and accessible to screen readers

### 2. Opening the Dropdown

**Mouse**: User clicks on the dropdown trigger or the input area → dropdown list appears with checkboxes visible

**Keyboard**:
- User presses `Space` or `Enter` while dropdown has focus → list expands
- User presses `Down Arrow` while dropdown has focus → list expands and focus moves to first checkbox
- `Escape` closes the dropdown if open

### 3. Filtering Options by Typing

**Same as Single-Select** (see Part A, Section 3):
- User types to filter options in real-time
- Case-insensitive substring matching
- Search field visible and focused automatically

### 4. Navigating Options with Keyboard

**When dropdown is open**:
- `Down Arrow`: Moves focus to the next option/checkbox
- `Up Arrow`: Moves focus to the previous option/checkbox
- `End`: Jumps to the last option
- `Home`: Jumps to the first option
- Navigation wraps around

**Visual Feedback**:
- Currently focused checkbox has distinct outline or highlight
- Checked boxes show checkmark or filled state
- Unchecked boxes are visually distinct (empty)

### 5. Toggling Checkboxes

**Mouse**:
- User clicks on a checkbox → checkbox state toggles (checked ↔ unchecked)
- User clicks on the label text next to checkbox → checkbox state toggles
- Dropdown remains open (does not close after each selection)

**Keyboard**:
- User presses `Space` or `Enter` while focus is on a checkbox → checkbox state toggles
- User presses `+` or `-` (if configured) → toggles focused checkbox
- Dropdown remains open after toggling

### 6. Multi-Select Visual Feedback

- All checked options display checkmarks or "✓" symbol
- Selected count updates in real-time as user checks/unchecks
- Display shows selected items: "3 selected" or "Selected: Brammo, Ford, GMC"

### 7. Selecting/Deselecting All (Optional)

**If "Select All" / "Deselect All" controls are available**:
- "Select All" button checks all currently filtered options
- "Deselect All" button unchecks all options
- Toggle is reflected immediately in the list

### 8. Confirming Selections

**Apply/Confirm Action**:
- **Explicit confirmation required**: "Apply", "OK", or "Confirm" button must be clicked to apply selections
- **Alternative workflow**: "Done" button closes dropdown and applies selections
- **Cancel option**: "Cancel" button discards changes and closes dropdown (reverts to previous selection state)

### 9. Selected State Display

- When dropdown is closed, it displays selected count or list of selected values
- Examples:
  - "3 selected"
  - "Brammo, Ford, GMC"
  - "Brammo + 2 more"
- Reopening dropdown shows all previously checked items still checked

### 10. Clearing Selection

**If "Clear All" is available**:
- Unchecks all selected items
- May require re-confirmation via "Apply" button
- Displays placeholder or "No selection" state

---

## Summary: Key Interaction Patterns

### Single-Select
- **Open**: Click or Space/Enter/Down Arrow
- **Search**: Type to filter (real-time)
- **Navigate**: Arrow keys (Up/Down)
- **Select**: Click or Enter/Space
- **Close**: Click selection, Escape, or Tab

### Multi-Select with Checkboxes
- **Open**: Click or Space/Enter/Down Arrow
- **Search**: Type to filter (real-time)
- **Navigate**: Arrow keys (Up/Down)
- **Toggle**: Click checkbox/label or Space/Enter
- **Confirm**: Click Apply/Done button
- **Cancel**: Click Cancel to discard changes
- **Close**: Explicit action (Apply/Done/Cancel), not automatic

---

**Industry References**:
- W3C WAI-ARIA Combobox Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Nielsen Norman Group Dropdown Guidelines: https://www.nngroup.com/articles/drop-down-menus/
- HTML5 Select Element Standards: https://www.w3.org/TR/html52/sec-forms.html

