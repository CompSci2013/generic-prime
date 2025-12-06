# Next Steps

**Current Session**: Verify E2E checkbox scroll fix - run tests to confirm 2.1.1 & 2.1.27 pass

---

## Immediate Action: Test Checkbox Scroll Fix

**Priority**: High

**What to Do**:
1. Run E2E tests using existing dev container (simplest approach):
```bash
podman exec -it generic-prime-frontend-dev bash -c "cd /app/frontend && npm run test:e2e"
```

2. **Expected Results**:
   - Tests 2.1.1 & 2.1.27 should now PASS (scroll fix applied)
   - Pass rate should improve to 8/10 (80%+) if both pass
   - 2 skipped tests (2.2, 2.3) still awaiting manual verification

3. **If Tests Still Fail**:
   - Examine error context in `frontend/test-results/` directory
   - Check if checkbox is actually scrolling into view
   - May need alternative approach (e.g., keyboard navigation)

**Related Files Modified**:
- `frontend/e2e/app.spec.ts`:
  - Test 2.1.1 (line 152): Uses `value="Brammo"` selector + `scrollIntoView()`
  - Test 2.1.27 (line 198): Scrolls multiple checkboxes before clicking
- `frontend/playwright.config.ts`: Removed webServer config
- `frontend/Dockerfile.e2e`: Simplified to use bind mounts
- `scripts/run-e2e-tests.sh`: Can be used but `podman exec` is simpler

---

## Secondary Tasks (When Checkbox Tests Pass)

### Fix Test 1.2 - Panel Collapse/Expand
- **Status**: Not yet fixed
- **Issue**: `.panel-actions button` selector may not be correct
- **Next Steps**: Manually verify button exists in DOM, check if selector is accurate

### Fix Test 2.1.30 - Remove Filter (Chip)
- **Status**: Not yet fixed
- **Issue**: p-chip remove icon selector needs investigation
- **Next Steps**: Inspect p-chip DOM structure to find correct close button selector

### Fix Bug #13 (Dropdown Keyboard Navigation)
- **Component**: Query Control panel - `p-dropdown` with `[filter]="true"`
- **Problem**: Arrow keys don't highlight options, Enter/Space don't select
- **Priority**: Medium (blocked on test completion)

---

## How to Run Tests (Simplified)

**Most Direct Method** (uses existing dev container):
```bash
podman exec -it generic-prime-frontend-dev bash -c "cd /app/frontend && npm run test:e2e"
```

**Alternative** (creates separate E2E container):
```bash
./scripts/run-e2e-tests.sh
```

Both approaches now work without rebuilding container images when changing test files.

---

## Testing Context

**Current Pass Rate**: 6/10 (60%)
- Phase 1 tests: All passing ✓
- Phase 2.1 tests: 4/6 passing (2.1.1 & 2.1.27 have new scroll fix, 2.1.30 not yet fixed)
- Phase 2.2 & 2.3: Skipped (awaiting manual verification)

**Manual Verification Status**:
- Phase 2.1: All 24 test cases manually verified ✓ (MANUAL-TEST-PLAN.md)
- Phase 2.2 & 2.3: Not yet manually tested

**Backend API** (Verified working):
- Endpoint: `http://generic-prime.minilab/api/specs/v1`
- K8s: `generic-prime-backend-api:v1.5.0` (2 replicas)
- Elasticsearch: autos-unified (4,887 docs), autos-vins (55,463 docs)

---

**Last Updated**: 2025-12-06T20:55:00Z
