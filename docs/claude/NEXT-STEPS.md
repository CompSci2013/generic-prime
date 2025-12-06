# Next Steps

**Current Session**: Immediate work for next Claude session

---

## Immediate Action: Fix Bug #13 (Dropdown Keyboard Navigation)

**Priority**: Medium

**Component**: Query Control panel - `p-dropdown` with `[filter]="true"`

**Problem**:
- Arrow keys do not highlight options (should work)
- Enter/Space do not select highlighted option (should work)
- Mouse click is the only workaround

**Reproduction**:
1. Go to port 4205 discover page
2. Focus on dropdown in Query Control panel
3. Press arrow keys - nothing happens
4. Expected: Options highlight as you press arrows

**Investigation Steps**:
1. Check PrimeNG version compatibility for `[filter]="true"` + keyboard nav
2. Test if PrimeNG accessibility settings affect keyboard navigation
3. Review Query Control component template and any custom event handlers
4. Check if focus trap or keyboard event capturing interferes

**Related Files**:
- `frontend/src/app/features/discover/query-control/query-control.component.ts`
- `frontend/src/app/features/discover/query-control/query-control.component.html`

---

## Session Preparation Notes

**Documentation References**:
- Network/backend data retrieval issues: See [ORIENTATION.md - Network Configuration & Debugging](ORIENTATION.md#network-configuration--debugging)
- Backend code location: `~/projects/data-broker/generic-prime/src/` (separate repo)
- Curl debugging commands for all 3 environments provided in ORIENTATION.md

**Last Updated**: 2025-12-06
