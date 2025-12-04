# UX Implementation: PrimeNG Dropdown & MultiSelect (Angular 14)

**Purpose**: Translate generic UX standards from `UX.md` into specific Angular 14 + PrimeNG implementation patterns, properties, and configurations.

**Date**: 2025-12-04

**Angular Version**: 14+
**PrimeNG Version**: 14+ (typically installed alongside Angular 14)

---

## PART A: Single-Select Dropdown with Search (PrimeNG Dropdown)

### Component: `p-dropdown`

The PrimeNG `<p-dropdown>` component implements the ARIA Combobox pattern for single-select filtering.

### Key Properties for UX

#### 1. Basic Setup

```html
<p-dropdown
  [options]="filterOptions"
  [(ngModel)]="selectedField"
  placeholder="Add filter by field..."
  optionLabel="label"
  optionValue="value">
</p-dropdown>
```

| Property | Type | Purpose |
|----------|------|---------|
| `[options]` | `Array` | List of options to display |
| `[(ngModel)]` | `any` | Two-way binding for selected value |
| `placeholder` | `string` | Text shown when nothing selected |
| `optionLabel` | `string` | Property name for display label |
| `optionValue` | `string` | Property name for value |

#### 2. Search/Filter Capability

```html
<p-dropdown
  [filter]="true"
  filterPlaceholder="Search fields..."
  [filterLocale]="'en'"
  [showFilterClear]="true">
</p-dropdown>
```

| Property | Type | Purpose |
|----------|------|---------|
| `[filter]="true"` | Boolean | **CRITICAL**: Enables search/filter textbox in dropdown |
| `filterPlaceholder` | `string` | Placeholder text for search input |
| `[filterLocale]="'en'"` | `string` | Locale for string comparison (case-insensitive) |
| `[showFilterClear]="true"` | Boolean | Shows X button to clear filter search |

**Default Behavior**: Matches **partial substrings**, case-insensitive (e.g., "bra" matches "Brammo")

#### 3. Keyboard Navigation

```html
<p-dropdown
  (keydown)="onDropdownKeydown($event)"
  [autofocus]="false">
</p-dropdown>
```

| Property | Purpose |
|----------|---------|
| `(keydown)` event | Capture keyboard events for custom handling |
| `[autofocus]="false"` | Prevent auto-focus on page load |

**Built-in PrimeNG Keyboard Support** (no extra code needed):
- `Space` / `Enter` → Opens dropdown
- `Down Arrow` → Opens dropdown and focuses first option
- `Up Arrow` → Navigates to previous option
- `Down Arrow` → Navigates to next option
- `Escape` → Closes dropdown
- `Enter` / `Space` → Selects focused option
- Typing → Filters options (when `[filter]="true"`)

**Known Issue (#13)**: With `[filter]="true"`, arrow key navigation in the filtered list may not work reliably in some PrimeNG/Angular versions. See Bug #13 investigation notes.

#### 4. Events & Change Detection

```html
<p-dropdown
  (onChange)="onSelectionChange($event)"
  (onShow)="onDropdownOpen()"
  (onHide)="onDropdownClose()">
</p-dropdown>
```

| Event | When Fired | Use Case |
|-------|-----------|----------|
| `(onChange)` | When selection changes (mouse click, Enter/Space) | Apply filter, update UI |
| `(onShow)` | When dropdown opens | Focus management, analytics |
| `(onHide)` | When dropdown closes | Cleanup, save state |

#### 5. Resetting Selection

```typescript
// To clear selection
this.selectedField = null;
this.cdr.markForCheck(); // Force change detection
```

**Limitation**: Setting `ngModel` to `null` sometimes doesn't update display if selection was made via keyboard. Workaround: Use `ViewChild` to access component instance and call `reset()` or `clear()`.

---

## PART B: Multi-Select with Checkboxes (PrimeNG Dialog + Checkboxes)

**Note**: PrimeNG does NOT have a built-in multi-select checkbox dropdown in the traditional sense. The current implementation uses:
- **Trigger**: `<p-dropdown>` (single-select dropdown for field selection)
- **Dialog**: `<p-dialog>` (modal with checkbox list inside)
- **Checkboxes**: `<p-checkbox>` array (inside dialog)

This is a **custom multi-select pattern**, not a native PrimeNG MultiSelect component.

### Component 1: Trigger Dropdown (`<p-dropdown>`)

See Part A above. This dropdown is used to select **which filter to apply**, then opens a dialog.

### Component 2: Dialog with Checkboxes (`<p-dialog>`)

```html
<p-dialog
  #multiselectDialog
  [(visible)]="showDialog"
  header="Select Values"
  [modal]="true"
  [style]="{width: '50vw'}"
  (onShow)="onDialogShow()"
  (onHide)="onDialogHide()">

  <!-- Search Box -->
  <div class="p-input-icon-left">
    <i class="pi pi-search"></i>
    <input
      type="text"
      pInputText
      [(ngModel)]="searchQuery"
      (ngModelChange)="onSearchChange($event)"
      placeholder="Search...">
  </div>

  <!-- Checkbox List -->
  <div class="options-list">
    <div *ngFor="let option of filteredOptions">
      <p-checkbox
        [(ngModel)]="selectedOptions"
        [value]="option.value"
        [label]="option.label"
        [binary]="false">
      </p-checkbox>
    </div>
  </div>

  <!-- Footer Buttons -->
  <ng-template pTemplate="footer">
    <p-button label="Cancel" (onClick)="cancelDialog()"></p-button>
    <p-button label="Apply" (onClick)="applyFilter()"></p-button>
  </ng-template>
</p-dialog>
```

#### Dialog Properties

| Property | Type | Purpose |
|----------|------|---------|
| `[(visible)]` | Boolean | Controls dialog visibility (two-way) |
| `header` | String | Dialog title |
| `[modal]="true"` | Boolean | **IMPORTANT**: Adds backdrop, traps focus |
| `[style]` | Object | Sizing (width, height, etc.) |
| `(onShow)` | Event | Fired when dialog rendered (use for focus management) |
| `(onHide)` | Event | Fired when dialog closes (cleanup) |

#### Dialog Focus Management

```typescript
onDialogShow(): void {
  // Shift focus to first interactive element
  setTimeout(() => {
    const searchInput = document.querySelector('.search-box input') as HTMLElement;
    if (searchInput) searchInput.focus();
  }, 0);
}
```

**Best Practice**: Use `setTimeout(..., 0)` to defer focus until after dialog is fully rendered by PrimeNG.

### Component 3: Search Box (`<input>` in dialog)

```html
<input
  type="text"
  pInputText
  [(ngModel)]="searchQuery"
  (ngModelChange)="onSearchChange($event)"
  placeholder="Search options...">
```

**TypeScript Handler**:
```typescript
onSearchChange(query: string): void {
  const lowerQuery = query.toLowerCase();
  this.filteredOptions = this.allOptions.filter(opt =>
    opt.label.toLowerCase().includes(lowerQuery)
  );
}
```

This provides **real-time filtering** (same behavior as dropdown filter).

### Component 4: Checkboxes (`<p-checkbox>`)

```html
<p-checkbox
  [(ngModel)]="selectedOptions"
  [value]="option.value"
  [label]="option.label"
  [binary]="false"
  (onChange)="onCheckboxChange()">
</p-checkbox>
```

#### Checkbox Properties

| Property | Type | Purpose |
|----------|------|---------|
| `[(ngModel)]` | Array | Two-way binding to array of selected values |
| `[value]` | any | Value to add/remove from array |
| `[label]` | string | Display text next to checkbox |
| `[binary]="false"` | Boolean | **IMPORTANT**: When false, adds/removes value from array (multi-select) |
| `(onChange)` | Event | Fired when checkbox toggled |

**Critical Detail**:
- `[binary]="true"` → Returns `true/false` (single boolean)
- `[binary]="false"` → Adds/removes from array (multi-select behavior)

#### Keyboard Navigation in Checkbox List

PrimeNG checkboxes support:
- `Tab` / `Shift+Tab` → Navigate between checkboxes
- `Space` / `Enter` → Toggle checkbox (when focused)
- Focus outline shows which checkbox is active

**Note**: Within a `<p-dialog>`, focus is trapped (Tab cycles only within dialog), which is correct per ARIA Modal Dialog pattern.

### Footer Buttons

```html
<ng-template pTemplate="footer">
  <p-button
    label="Cancel"
    (onClick)="cancelDialog()"
    styleClass="p-button-text">
  </p-button>
  <p-button
    label="Apply"
    (onClick)="applyFilter()"
    styleClass="p-button-danger"
    [disabled]="selectedOptions.length === 0">
  </p-button>
</ng-template>
```

**Behavior**:
- **Cancel**: Closes dialog, discards changes (reverts to previous selection)
- **Apply**: Applies selection and closes dialog
- Apply button is disabled if no selections made

---

## PART C: Complete Workflow in Angular

### 1. Trigger Dropdown Opens

```typescript
// User clicks on field dropdown to select which filter to add
onFieldSelected(event: any): void {
  const filterDef: FilterDefinition = event.value;
  this.openFilterDialog(filterDef);
}
```

### 2. Dialog Opens with Checkboxes

```typescript
private openFilterDialog(filterDef: FilterDefinition): void {
  this.currentFilterDef = filterDef;
  this.showDialog = true; // Make dialog visible

  // Load options from API
  this.apiService.get(filterDef.optionsEndpoint).subscribe({
    next: (response) => {
      this.allOptions = response;
      this.filteredOptions = [...this.allOptions];
      this.cdr.markForCheck();
    },
    error: (error) => {
      this.optionsError = 'Failed to load options';
      this.cdr.markForCheck();
    }
  });
}
```

### 3. User Searches, Filters, Toggles Checkboxes

```typescript
onSearchChange(query: string): void {
  this.filteredOptions = this.allOptions.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );
  // selectedOptions updates automatically via [(ngModel)]
}
```

### 4. User Clicks Apply

```typescript
applyFilter(): void {
  // selectedOptions contains all checked values
  const paramValue = this.selectedOptions.join(',');
  this.urlParamsChange.emit({
    [this.currentFilterDef.urlParams]: paramValue
  });
  this.showDialog = false;
}
```

---

## Keyboard Navigation Checklist

### Single-Select Dropdown (`[filter]="true"`)

- [x] **Tab** → Focus dropdown
- [x] **Space/Enter** → Open dropdown
- [x] **Down Arrow (with dropdown open)** → Navigate/highlight options
- [x] **Up Arrow (with dropdown open)** → Navigate/highlight options
- [x] **Enter/Space (on highlighted option)** → Select and close
- [x] **Escape** → Close without selecting
- [x] **Type** → Filter options (real-time)
- [ ] **Arrow keys (with `[filter]="true"`)** → KNOWN BUG #13 (unreliable)

### Multi-Select Dialog

- [x] **Tab** → Navigate checkboxes (within dialog, focus trapped)
- [x] **Space/Enter (on focused checkbox)** → Toggle checkbox
- [x] **Type** → Filter options in search box
- [x] **Tab to buttons** → Navigate to Apply/Cancel
- [x] **Enter/Space on button** → Activate button
- [x] **Escape** → Close dialog without applying (if supported by PrimeNG)

---

## Change Detection Note

Both components use **OnPush change detection**:

```typescript
changeDetection: ChangeDetectionStrategy.OnPush
```

**Requirement**: After manually updating arrays or state outside of event handlers, call:
```typescript
this.cdr.markForCheck(); // Schedule check for next cycle
// OR
this.cdr.detectChanges(); // Force immediate check
```

This is critical for:
- Array mutations (push, splice)
- Object property changes not captured by Angular
- Forcing UI updates after API responses

---

## Current Implementation Status

### What Works
- [x] Single-select dropdown with filter (`[filter]="true"`)
- [x] Search/substring matching (case-insensitive)
- [x] Multi-select checkboxes in dialog
- [x] Real-time option filtering
- [x] Apply/Cancel buttons with confirmation

### Known Issues
- [ ] **Bug #13**: Arrow key navigation with `[filter]="true"` unreliable
  - **Workaround**: Use mouse or search + Enter key
  - **Root Cause**: PrimeNG version compatibility (verify version)
  - **Solution**: May require PrimeNG update or custom keyboard handler

### Not Yet Implemented
- [ ] "Select All" / "Deselect All" buttons in multi-select dialog
- [ ] Keyboard shortcut to apply (currently requires mouse/Tab to button)
- [ ] Checkbox state persistence after dialog close/reopen

---

## References

**PrimeNG Dropdown Component**:
- API: https://primeng.org/dropdown
- Filter property: `[filter]="true"` enables combobox pattern
- Keyboard support: Built-in per ARIA Combobox spec

**PrimeNG Dialog Component**:
- API: https://primeng.org/dialog
- Modal focus trapping: `[modal]="true"` implements ARIA Modal pattern

**PrimeNG Checkbox Component**:
- API: https://primeng.org/checkbox
- Binary mode: `[binary]="false"` for array-based multi-select

**Angular 14 Change Detection**:
- OnPush Strategy: https://angular.io/api/core/ChangeDetectionStrategy
- ChangeDetectorRef: https://angular.io/api/core/ChangeDetectorRef

**ARIA Patterns**:
- Combobox: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Modal Dialog: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- Checkbox: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/

