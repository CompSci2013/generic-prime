# Next Steps

**Current Session**: Expand E2E tests to cover Model Filter (2.2) and Body Class Filter (2.3) from MANUAL-TEST-PLAN.md

---

## Immediate Action: Automate Tests 2.2 & 2.3

**Priority**: High

**What to Do**:

### Phase 1: Add Test 2.2 - Model Filter
1. Review MANUAL-TEST-PLAN.md lines 144-177 (Model Filter tests)
2. Add new test block to `frontend/e2e/app.spec.ts`:
   - Single selection workflow (select "Scooter" model)
   - Combined filters with Manufacturer (Brammo + Scooter)
   - Edit model filter (switch to different model while Manufacturer active)
   - Remove model filter (verify Manufacturer filter persists)

### Phase 2: Add Test 2.3 - Body Class Filter
1. Review MANUAL-TEST-PLAN.md lines 179-202 (Body Class Filter tests)
2. Add new test block to `frontend/e2e/app.spec.ts`:
   - Single selection workflow (select "SUV" body class)
   - Multiple body classes (SUV, Sedan, Truck)
   - Combined with previous filters (Manufacturer + Model + Body Class)

### Technical Notes for Implementation:
- **Use Same Pattern**: Tests 2.1.1 & 2.1.27 now work with checkbox state manipulation
- **Reuse Helper Functions**: getUrlParams() for URL verification
- **Test Timeout**: Already optimized at 3 seconds per test
- **Container Setup**: E2E container configured correctly with named volume for node_modules

### Success Criteria:
- Both new test blocks added and passing
- Pass rate improves to 10/10 (100%)
- All Phase 2.1, 2.2, 2.3 tests automated

---

## How to Run Tests

**Direct Method** (uses E2E container with proper setup):
```bash
podman exec generic-prime-e2e bash -c "cd /app/frontend && npx playwright test"
```

**Dev Container Method** (alternative):
```bash
podman exec -it generic-prime-dev bash -c "cd /app/frontend && npm run test:e2e"
```

**Container Setup** (if needed):
```bash
podman stop generic-prime-e2e 2>/dev/null
podman rm generic-prime-e2e 2>/dev/null
podman volume rm generic-prime-e2e-nm 2>/dev/null || true
podman run -d --name generic-prime-e2e --network host \
  -v /home/odin/projects/generic-prime:/app:z \
  -v generic-prime-e2e-nm:/app/frontend/node_modules \
  localhost/generic-prime-e2e:latest
```

---

## Testing Context

**Current Pass Rate**: 8/10 (80%)
- Phase 1 tests: All passing ✓
- Phase 2.1 tests: 6/6 passing ✓ (checkbox state fix applied)
- Phase 2.2 & 2.3: Not yet automated (manual verification only)

**Known Issues Still To Fix**:
- Test 1.2 (panel collapse) - `.panel-actions button` selector timing out
- Test 2.1.30 (chip remove icon) - p-chip close button selector needs investigation

**Backend API** (Verified working):
- Endpoint: `http://generic-prime.minilab/api/specs/v1`
- K8s: `generic-prime-backend-api:v1.5.0` (2 replicas)
- Elasticsearch: autos-unified (4,887 docs), autos-vins (55,463 docs)

---

**Last Updated**: 2025-12-06T21:45:00Z
