# Known Bugs

This document tracks known issues that need to be fixed.

## Active Bugs

_(No active bugs)_

---

## Fixed Bugs

### 1. Chart Data Shows All Zero Values (2025-11-22, FIXED 2025-11-22)

**Component**: StatisticsPanelComponent / VehicleStatistics transformer
**Severity**: High
**Status**: ✅ FIXED

**Description**:
Charts are rendering with correct structure (manufacturer names, model names, years visible) but all percentage values show as "0.0%" and counts appear to be zero or near-zero.

**Observed Behavior**:
- Manufacturer chart: Shows 10 manufacturers but all with 0.0% percentage
- Top Models chart: Shows Chevrolet models but all with 0.0% percentage
- Body Class chart: Pie chart not visible (possibly all zero values)
- Year chart: Line chart shows timeline but all values near zero

**Expected Behavior**:
Charts should show actual distribution percentages and counts from the API statistics data.

**Possible Causes**:
1. API response structure doesn't match expected format exactly
2. Transformation logic in `VehicleStatistics.fromSegmentedStats()` has calculation error
3. API `statistics` field might have different structure than documented
4. Counts are using wrong fields (total vs highlighted)

**Files Involved**:
- `frontend/src/domain-config/automobile/models/automobile.statistics.ts:202-354` (transformation logic)
- `frontend/src/domain-config/automobile/adapters/automobile-api.adapter.ts:71-93` (API response handling)
- `frontend/src/framework/components/statistics-panel/statistics-panel.component.ts` (statistics consumption)

**Investigation Steps**:
1. [ ] Add console.log to see raw API response statistics structure
2. [ ] Verify API is returning statistics field with expected data
3. [ ] Check if `byManufacturer`, `modelsByManufacturer`, etc. have actual count data
4. [ ] Verify transformation logic correctly extracts counts from API response

**Root Cause**: API returns statistics as simple numbers (e.g., `"Ford": 665`) but transformation code expected objects with `{ total, highlighted }` structure.

**Fix**: Updated all four transformation methods in `VehicleStatistics` class:
- `transformByManufacturer()`: Changed type from `Record<string, { total: number; highlighted: number }>` to `Record<string, number>`
- `transformModelsByManufacturer()`: Changed nested type from `Record<string, { total: number; highlighted: number }>` to `Record<string, number>`
- `transformByBodyClass()`: Changed type from `Record<string, { total: number; highlighted: number }>` to `Record<string, number>`
- `transformByYearRange()`: Changed type from `Record<string, { total: number; highlighted: number }>` to `Record<string, number>`

**Files Changed**:
- `frontend/src/domain-config/automobile/models/automobile.statistics.ts:250-361`

**Verified**: Build compiles successfully after fix.
