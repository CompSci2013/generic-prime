# Bug #15: Multiselect Dialog Fails to Reopen When Filter Already Active

**Status**: CRITICAL - Blocks Phase 2.1 testing
**Discovered**: 2025-12-04
**Severity**: CRITICAL (prevents workflow continuation)
**Type**: Silent failure (no console errors)
**Affected Component**: QueryControlComponent
**Affected File**: `frontend/src/framework/components/query-control/query-control.component.ts`

---

## Summary

When a multiselect filter (e.g., Manufacturer) is already active with a value selected, clicking the field selector dropdown and re-selecting the same filter field fails to reopen the dialog. The dropdown closes silently with no error message or console output.

---

## Steps to Reproduce

1. Navigate to `/discover` page (clean state, no filters)
2. Click field selector dropdown
3. Select "Manufacturer" from dropdown
4. In multiselect dialog, check checkbox for "Brammo"
5. Click "Apply" button
   - **Result**: Dialog closes, chip "Manufacturer: Brammo" appears ✓
6. Click field selector dropdown again
7. Select "Manufacturer" from dropdown again
   - **Expected**: Multiselect dialog reopens with "Brammo" pre-selected
   - **Actual**: Dropdown closes silently, NO dialog appears ✗

---

## Expected Behavior

The multiselect dialog should reopen every time the user selects a filter field, allowing them to:
- Edit existing filters (toggle checkboxes, change selections)
- Test Dialog Cancel Behavior (opening a different filter field and verifying the previous dialog's Cancel is exercised)
- Switch between different filter types without errors

---

## Actual Behavior

The dialog fails to reopen on subsequent selections of the same filter field after a value has been applied. The workflow breaks at the point where the user needs to switch filter fields (e.g., from Manufacturer to Model filter).

**Error State**:
- No JavaScript errors in console
- No network errors
- No UI feedback (no loading spinner, error message, etc.)
- Dropdown simply closes
- Active filter chip remains visible and functional

---

## Root Cause Analysis

**Hypothesis**: Two-way binding issue with PrimeNG Dialog `[(visible)]` property

The template uses two-way binding on the dialog's `visible` property:

```html
<p-dialog
  #multiselectDialog
  [(visible)]="showMultiselectDialog"
  ...>
```

**Why this causes the problem**:

1. First dialog open: `showMultiselectDialog = true` → Dialog renders ✓
2. User applies filter: Code sets `showMultiselectDialog = false` → Dialog closes ✓
3. Second dialog open: Code tries to set `showMultiselectDialog = true` again
4. **Issue**: The two-way binding may not properly detect the state change from `false` to `true` again, especially if:
   - Angular's change detection hasn't fully settled between state changes
   - The dialog component's internal state doesn't reset properly between opens
   - There's a race condition between multiple `markForCheck()` / `detectChanges()` calls

**Code Flow**:
- User selects field → `onFieldSelected(event)` is called
- Calls `openFilterDialog(filterDef)`
- Calls `openMultiselectDialog(filterDef)` which sets `showMultiselectDialog = true` (line 258)
- Calls `this.cdr.markForCheck()` (line 259)
- Dialog should bind to `[(visible)]="showMultiselectDialog"` and render

**Potential Issue**: The `markForCheck()` may not trigger a full change detection cycle needed for the dialog binding to recognize the state change from `false` → `true` on the second invocation.

---

## Impact

- **Phase 2.1 Testing**: Completely blocked - cannot test Dialog Cancel Behavior
- **User Workflow**: Users cannot re-open dialogs to edit existing filters
- **Feature Completeness**: Core filter editing workflow is broken

---

## Workarounds

None currently available. The only workaround is to clear the existing filter first, then re-select the field:
1. Click X on the "Manufacturer: Brammo" chip to remove filter
2. Click field selector dropdown
3. Select "Manufacturer" again
4. Dialog opens ✓

This workaround defeats the purpose of the "Dialog Cancel Behavior" test.

---

## Suggested Fix Approaches

### Approach 1: Replace Two-Way Binding with One-Way Binding + Explicit Event Handling
Replace `[(visible)]="showMultiselectDialog"` with `[visible]="showMultiselectDialog"` and add `(onHide)="onDialogHide()"` to explicitly control visibility.

**Pros**: More explicit control, avoids two-way binding race conditions
**Cons**: Slightly more code

### Approach 2: Use `detectChanges()` Instead of `markForCheck()`
In `openMultiselectDialog()`, replace `this.cdr.markForCheck()` (line 259) with `this.cdr.detectChanges()`.

**Pros**: Forces immediate change detection cycle
**Cons**: May impact performance if called frequently

### Approach 3: Add Explicit Dialog Reset
Before setting `showMultiselectDialog = true` in `openMultiselectDialog()`, ensure the dialog component's internal state is fully reset.

**Pros**: Ensures clean state between opens
**Cons**: Requires understanding PrimeNG Dialog internals

---

## Testing Strategy

Once fix is applied:
1. Reproduce original steps (select Manufacturer, apply Brammo, click to reopen)
2. Verify dialog reopens with Brammo pre-selected
3. Continue Phase 2.1 Dialog Cancel Behavior tests (switch to Model filter)
4. Run full Phase 2.1 test suite to ensure no regressions

---

## Related Issues

- **Bug #13**: Dropdown keyboard navigation broken (different root cause, same component)
- **Bug #1.3**: Query Control race condition (FIXED - similar async/await patterns involved)

---

## Files to Check

- `frontend/src/framework/components/query-control/query-control.component.ts` (lines 250-286)
- `frontend/src/framework/components/query-control/query-control.component.html` (lines 70-152)
- `frontend/src/app/features/discover/discover.component.ts` (parent component calling QueryControl)

---

**Last Updated**: 2025-12-04T22:30:00Z
**Author**: Claude Code Session
**Session**: Phase 2.1 Manual Testing - Dialog Cancel Behavior Tests
