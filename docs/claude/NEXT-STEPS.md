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
1. Navigate to `http://generic-prime.minilab/discover` (now fixed - uses correct hostname)
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

**Backend API Access** (FIXED - Now verified working):
- All three environments (Thor SSH, dev container, E2E container) use: `http://generic-prime.minilab/api/specs/v1`
- See [ORIENTATION.md - Backend API Testing](ORIENTATION.md#backend-api-testing-across-three-environments) for working examples in each environment
- All three environments have been verified with actual API calls retrieving Brammo vehicle data

**Testing with Correct URLs**:
- Frontend dev: `http://generic-prime.minilab/discover` (not localhost)
- Manual test reference: See [MANUAL-TEST-PLAN.md](../MANUAL-TEST-PLAN.md) (now single source of truth, duplicate removed)
- Phase 2.1 tests all PASSED (24/24) - good reference for stable functionality

**Backend Code Location** (separate repo):
- Backend source: `~/projects/data-broker/generic-prime/src/`
- Running in K8s as: `generic-prime-backend-api:v1.5.0` (2 replicas)
- Elasticsearch indices: autos-unified (4,887 docs), autos-vins (55,463 docs)

**Last Updated**: 2025-12-06
