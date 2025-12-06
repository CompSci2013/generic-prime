# Next Steps

**Current Session**: Resume E2E testing - fix remaining 4 test failures

---

## Immediate Action: Complete E2E Test Fixes

**Priority**: High

**Current Status**: 4/10 tests passing (40% pass rate) - up from 12.5% at session start

**Remaining Failures** (4 tests):
1. **Test 1.2**: Panel collapse/expand - button selector timeout
2. **Test 2.1.1**: Manufacturer filter - checkbox visibility issue
3. **Test 2.1.27**: Edit applied filter - checkbox visibility issue
4. **Test 2.1.30**: Remove filter - chip remove button not found

**Key Issue**: Dialog checkbox visibility
- Checkboxes found in DOM but Playwright reports as "hidden"
- `force: true` parameter partially works but not reliable
- Affects both multiselect filter tests

**Next Steps**:
1. **Debug Dialog Rendering**:
   - Use Playwright inspector to examine checkbox CSS
   - Check if dialog has overflow:hidden or similar visibility blocker
   - Look for PrimeNG CSS that hides checkboxes by default

2. **Try Alternative Selectors** for remaining failures:
   - Test 1.2: Use broader `.panel-actions button` selector instead of parent navigation
   - Test 2.1.30: Examine actual p-chip DOM to find close button class

3. **Add Test Helpers** if needed:
   - Consider adding test IDs to checkbox labels: `data-testid="option-brammo"`
   - Would make selectors more reliable and document intent

4. **Run Final Test** when fixes complete:
   - Goal: 8/10 or higher (80%+)
   - Skip 2.2 and 2.3 (not yet manually verified)

**Reproduction Steps**:
```bash
cd ~/projects/generic-prime
podman build -f frontend/Dockerfile.e2e -t localhost/generic-prime-e2e:latest .
timeout 300 podman run --rm --network=host localhost/generic-prime-e2e:latest 2>&1 | tail -150
```

**Related Files**:
- Test file: `frontend/e2e/app.spec.ts` (currently 4/10 passing)
- Components:
  - Query Control: `frontend/src/framework/components/query-control/`
  - Discover: `frontend/src/app/features/discover/`

---

## Secondary Tasks (If E2E Tests Complete Early)

### Fix Bug #13 (Dropdown Keyboard Navigation)
- **Component**: Query Control panel - `p-dropdown` with `[filter]="true"`
- **Problem**: Arrow keys don't highlight options, Enter/Space don't select
- **Priority**: Medium
- See PROJECT-STATUS.md Known Bugs section for details

---

## Session Reference

**Testing Approach**:
- All manual tests in [MANUAL-TEST-PLAN.md](../MANUAL-TEST-PLAN.md) passed Phase 2.1 (24/24)
- E2E tests based on these manually-verified test cases
- Goal: Automate the same workflows that manual testers verified working

**Backend API** (Verified working):
- All three environments use: `http://generic-prime.minilab/api/specs/v1`
- Running in K8s as: `generic-prime-backend-api:v1.5.0` (2 replicas)
- Elasticsearch: autos-unified (4,887 docs), autos-vins (55,463 docs)

**Key Command**:
```bash
timeout 300 podman run --rm --network=host localhost/generic-prime-e2e:latest 2>&1 | tail -150
```

**Last Updated**: 2025-12-06T20:15:00Z
