# Bug Report: Modal Dialog Close Handlers Not Working

**Date**: 2025-12-04
**Severity**: MEDIUM (UX/Usability - industry standard expected)
**Status**: NEW
**Found During**: Phase 2.1 Manual Testing - Test 2.1.9
**Component**: QueryControlComponent - Dialog handlers

---

## Issue Summary

The Query Control multiselect and range dialogs do not respond to standard modal dialog close triggers:
- **X button** (top-right corner of dialog) does not close the dialog
- **Escape key** does not close the dialog
- **Cancel button** works correctly ✅

---

## Expected Behavior (Industry Standard - ARIA Modal Dialog Pattern)

Per ARIA and UX standards, modal dialogs should close when user triggers:
1. **Escape key** - Should close dialog with Cancel behavior (discard changes)
2. **X button** - Should close dialog with Cancel behavior (discard changes)
3. **Cancel button** - Already works ✅

---

## Actual Behavior

**X Button**:
- User clicks X button in dialog header
- Result: Nothing happens - dialog remains open
- Expected: Dialog closes, changes discarded

**Escape Key**:
- User presses Escape key while dialog has focus
- Result: Nothing happens - dialog remains open
- Expected: Dialog closes, changes discarded

**Cancel Button**:
- User clicks Cancel button
- Result: Dialog closes correctly ✓
- Expected: Dialog closes, changes discarded ✓

---

## Impact

- **User Experience**: Users cannot close dialogs using standard conventions
- **Accessibility**: Screen reader users expect Escape to close modals (WCAG 2.1 requirement)
- **Discoverability**: Cancel button is the only visible close mechanism

---

## Root Cause Analysis

**Query Control Template** (`query-control.component.html`):
```html
<p-dialog
  #multiselectDialog
  [visible]="showMultiselectDialog"
  [header]="multiselectDialogTitle"
  (onHide)="onDialogHide()">
  <!-- dialog content -->
  <ng-template pTemplate="footer">
    <button pButton type="button" label="Cancel" (click)="cancelDialog()"></button>
    <button pButton type="button" label="Apply" (click)="applyFilter()"></button>
  </ng-template>
</p-dialog>
```

**Issue**:
- PrimeNG Dialog component has built-in X button and Escape key handling
- These triggers call the `onHide` event, which is already wired to `onDialogHide()` handler
- However, the dialog is not closing on X button click or Escape key press

**Possible Causes**:
1. PrimeNG Dialog `[closeOnEscape]` property not set (default should be true)
2. Dialog `[modal]="true"` may need explicit setting
3. Event handler not properly wired
4. Component change detection issue preventing dialog close

---

## Reproduction Steps

1. Navigate to `/discover`
2. Click field selector dropdown
3. Select "Manufacturer" (multiselect dialog opens)
4. Click X button in dialog header
   - Expected: Dialog closes
   - Actual: Nothing happens ❌
5. Click field selector dropdown again
6. Select "Manufacturer" again
7. Press Escape key
   - Expected: Dialog closes
   - Actual: Nothing happens ❌
8. Click Cancel button
   - Expected: Dialog closes
   - Actual: Dialog closes ✓

---

## Files to Check

- `frontend/src/framework/components/query-control/query-control.component.html` - Dialog template
- `frontend/src/framework/components/query-control/query-control.component.ts` - Dialog handlers

---

## Recommended Fix

Add PrimeNG Dialog properties to enable standard close behavior:

```html
<p-dialog
  #multiselectDialog
  [visible]="showMultiselectDialog"
  [header]="multiselectDialogTitle"
  [modal]="true"
  [closeOnEscape]="true"
  (onHide)="onDialogHide()">
  <!-- ... rest of template ... -->
</p-dialog>
```

Verify that `cancelDialog()` is called when user closes via X or Escape (via `onHide` event).

---

## Testing Strategy

After fix is applied:
- [ ] X button closes dialog with Cancel behavior
- [ ] Escape key closes dialog with Cancel behavior
- [ ] Cancel button continues to work
- [ ] Apply button still works
- [ ] Dialog state properly reset after close
- [ ] No regressions in existing functionality

---

## Related Issues

- Bug #15 (Dialog Reopen) - Fixed ✅
- Bug #16 (Observable Sync) - Fixed ✅
- This Bug - Dialog Close Handlers (NEW)

---

## Notes

This was discovered during Phase 2.1 Manual Testing (Test 2.1.9: Dialog Cancel Behavior).

The issue affects user experience negatively as it violates standard modal dialog UX patterns that users expect from web applications.

Priority: MEDIUM - Not blocking core functionality, but impacts usability and accessibility.

---

**Created by**: Manual Testing Session 2025-12-04
**Status**: NEW - Awaiting investigation and fix
