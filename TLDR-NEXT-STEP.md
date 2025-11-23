# TLDR-NEXT-STEP.md - Implementation Roadmap

**Last Updated:** 2025-11-23
**Purpose:** Machine-readable guide for implementing next features

---

## 🔥 Latest Session Summary (2025-11-23)

**What Just Happened:**
- Fixed 3 critical pop-out bugs (Clear button, modelCombos chips, focus/change detection)
- Discovered 2 new pop-out bugs (pagination zero rows, checkbox visual state)
- **CRITICAL ARCHITECTURAL DISCOVERY**: OnPush change detection in unfocused browser windows
  - `markForCheck()` doesn't work in unfocused windows (only schedules, never runs)
  - Must use `detectChanges()` for pop-out window state synchronization
  - Changed in 3 locations: URL sync, URL hydration, selection hydration

**Files Modified:**
1. [panel-popout.component.ts:214](frontend/src/app/features/panel-popout/panel-popout.component.ts#L214) - Added `urlState.setParams()` for pop-out URL sync
2. [automobile.query-control-filters.ts:113-137](frontend/src/domain-config/automobile/configs/automobile.query-control-filters.ts#L113-L137) - Added modelCombos filter definition
3. [base-picker.component.ts:147,175,204](frontend/src/framework/components/base-picker/base-picker.component.ts#L147) - Changed `markForCheck()` to `detectChanges()` in 3 places

**Key Pattern Learned:**
```typescript
// ❌ WRONG for pop-out windows
this.cdr.markForCheck();  // Only schedules, doesn't run in unfocused windows

// ✅ CORRECT for pop-out windows
this.cdr.detectChanges();  // Forces immediate update, works in unfocused windows
```

**Next Recommended Task**: Fix Bug #6 and #7 (see PRIORITY 0 below)

---

## Current State (What's Done)

### ✅ Framework Components Implemented (5/7 Panels)

1. **BasePickerComponent** - Configuration-driven multi-select table
   - Server/client pagination support
   - Search and sorting
   - URL synchronization
   - Template: 157 lines of PrimeNG markup

2. **ResultsTableComponent** - Domain-agnostic data table
   - Dynamic filter panel (renders from FilterDefinition[])
   - PrimeNG Table with lazy loading, pagination, sorting
   - Row expansion
   - Statistics panel support
   - Template: 233 lines

3. **QueryControlComponent** - Manual filter management via dialogs
   - Dropdown field selector (dynamically populated from domain config)
   - Multiselect dialog for list-based filters
   - Range dialog for numeric filters
   - Active filter chips with edit/remove functionality
   - URL-first architecture
   - Fully domain-agnostic
   - Template: 179 lines, TypeScript: 467 lines
   - **Unit tests purposefully skipped** (not cost-effective for UI components)

4. **BaseChartComponent** - Generic Plotly.js chart container
   - ChartDataSource pattern for domain-specific data transformation
   - Supports any Plotly.js chart type (bar, line, pie, scatter, etc.)
   - Interactive click events for filtering/highlighting (single-click and box selection)
   - Responsive resizing with window resize handler
   - Delegation pattern for chart-specific formatting
   - Template: 14 lines, TypeScript: 298 lines

5. **StatisticsPanelComponent** - Statistics visualization panel
   - Injects shared ResourceManagementService instance (proper Angular DI)
   - Renders multiple BaseChartComponents based on domain config
   - Collapsible PrimeNG Panel
   - Automatically fetches statistics from API
   - URL-First architecture for chart interactions
   - Template: 40 lines, TypeScript: 215 lines
   - ✅ **Fully functional** (v0.2.0 - 2025-11-23)

### ✅ Framework Services Complete (9 Services, ~3,139 Lines)

All F1-F10 milestones complete:
- UrlStateService (289 lines)
- RequestCoordinatorService (304 lines)
- ResourceManagementService (302 lines)
- ApiService (282 lines)
- PopOutContextService (366 lines)
- PickerConfigRegistry (207 lines)
- DomainConfigRegistry (281 lines)
- DomainConfigValidator (540 lines)
- ErrorNotificationService (368 lines)

### ✅ Automobile Domain Complete (D1-D5 Milestones)

- Models: AutoSearchFilters, VehicleResult, VehicleStatistics (with segmented stats transformation)
- Adapters: AutomobileApiAdapter, AutomobileUrlMapper, AutomobileCacheKeyBuilder
- Configs: Table, Picker, Filters, Charts
- Chart Data Sources: ManufacturerChartDataSource, TopModelsChartDataSource, BodyClassChartDataSource, YearChartDataSource
- Domain factory: createAutomobileDomainConfig() with chartDataSources map

---

## Next Implementation Options

### ⚠️ PRIORITY 0: Fix Active Pop-Out Bugs (RECOMMENDED NEXT)

**Estimated Effort**: 1-2 hours
**Priority**: HIGH (blocking smooth pop-out experience)

**Bug #6: Popped-out picker shows zero rows after pagination**
- Investigation: Check if pagination handler uses `markForCheck()` instead of `detectChanges()`
- Likely location: [base-picker.component.ts](frontend/src/framework/components/base-picker/base-picker.component.ts) onLazyLoad() handler
- Expected fix: Replace `markForCheck()` with `detectChanges()` in pagination logic
- Test: Pop out picker → change page → verify rows display without needing to focus window

**Bug #7: Checkboxes remain visually checked after clearing selections**
- Investigation: Check PrimeNG Table selection state management
- Likely issue: `selectedKeys` Set not syncing with PrimeNG's internal selection array
- Possible fix: Explicitly set `selection` to empty array after clearing `selectedKeys`
- Test: Select items → clear via Query Control → verify checkboxes uncheck in pop-out

**Reference**: See [KNOWN-BUGS.md](KNOWN-BUGS.md) for detailed reproduction steps

---

### ✅ Option 1: Charts & Highlighting System (COMPLETED v0.2.0 - 2025-11-23)

**Status**: ✅ COMPLETE
**Component**: Statistics Panel with interactive chart highlighting
**Completed Features**:
- ✅ URL-First architecture compliance (UrlStateService, not router.navigate)
- ✅ Server-side segmented statistics support ({total, highlighted} format)
- ✅ Consistent stacking order across all charts (Highlighted bottom, Other top)
- ✅ Pipe-to-comma separator normalization for backend compatibility
- ✅ Box selection deduplication (using Set to remove duplicates from stacked bars)
- ✅ Box selection delegation pattern (chart-specific formatting)
- ✅ Models chart parameter mapping (h_modelCombos not h_model)
- ✅ Models chart format conversion (space to colon for "Manufacturer:Model")
- ✅ Statistics transform limits (20 items not 10)
- ✅ Comprehensive component specification created (430 lines + README)

**Documentation**: [docs/components/charts/specification.md](docs/components/charts/specification.md)

**Git Tag**: v0.2.0 (2025-11-23) - 11 commits, 760 lines of documentation

---

### ✅ Option 2: Pop-Out Window System (COMPLETED 2025-11-22, REFINEMENTS 2025-11-23)

**Status**: ✅ CORE COMPLETE, ⚠️ 2 ACTIVE BUGS
**Component**: Pop-out buttons + routing + messaging
**Completed Features**:
- ✅ Pop-out buttons on all panels (Statistics, Results, Query Control, Pickers)
- ✅ Pop-out routing (`/panel/:gridId/:panelId/:type`)
- ✅ `PanelPopoutComponent` container component
- ✅ BroadcastChannel cross-window messaging
- ✅ URL parameter synchronization
- ✅ MOVE semantics (panel disappears when popped out)
- ✅ Automatic restoration when pop-out closed

**Bug Fixes (2025-11-22)**:
- ✅ Fixed duplicate API calls (proper DI with InjectionToken)
- ✅ Fixed paginator display (removed stateStorage conflict)
- ✅ Fixed pagination indexing (1-indexed API compliance)

**Bug Fixes (2025-11-23 Session)**:
- ✅ **Bug #1**: Clear button in pop-out Query Control not updating URL
  - Fixed: [panel-popout.component.ts:214](frontend/src/app/features/panel-popout/panel-popout.component.ts#L214)
  - Added `urlState.setParams()` call before broadcasting to main window
- ✅ **Bug #4**: Query Control not showing modelCombos selection chips
  - Fixed: [automobile.query-control-filters.ts:113-137](frontend/src/domain-config/automobile/configs/automobile.query-control-filters.ts#L113-L137)
  - Added modelCombos filter definition to AUTOMOBILE_QUERY_CONTROL_FILTERS
- ✅ **Bug #5**: Pop-out picker not updating when filters cleared until window focused
  - Fixed: [base-picker.component.ts:147,175,204](frontend/src/framework/components/base-picker/base-picker.component.ts#L147)
  - **CRITICAL LEARNING**: Use `detectChanges()` instead of `markForCheck()` for unfocused pop-out windows
  - OnPush + markForCheck() only schedules change detection, doesn't run in unfocused windows
  - Changed 3 locations: URL sync handler, hydrateFromUrl(), hydrateSelections()

**Active Bugs (Needs Investigation)**:
- ❌ **Bug #6**: Popped-out picker shows zero rows after pagination change
  - Likely same change detection issue as Bug #5
  - May need `detectChanges()` in pagination handler
- ❌ **Bug #7**: Checkboxes remain visually checked after clearing selections
  - Count shows correct value (0) but checkboxes still appear checked
  - PrimeNG Table selection state sync issue

**Key Architectural Learning**:
- **OnPush Change Detection in Pop-Outs**: Unfocused browser windows don't run scheduled change detection cycles
- **Pattern**: Use `detectChanges()` instead of `markForCheck()` for:
  1. URL parameter change handlers (syncing from main window)
  2. BroadcastChannel message handlers (cross-window communication)
  3. Selection hydration (restoring state from URL)
- **Reference**: See [TLDR.md](TLDR.md) section "6. OnPush Change Detection in Pop-Out Windows" for detailed analysis

---

### ✅ Option 4: Query Control Highlights (COMPLETED v0.3.0 - 2025-11-23)

**Status**: ✅ COMPLETE
**Component**: Query Control with Active Highlights section
**Completed Features**:
- ✅ Created highlight filter definitions (h_manufacturer, h_modelCombos, h_bodyClass, h_yearMin/Max)
- ✅ Added "Active Highlights" section (separate from Active Filters)
- ✅ Yellow/amber chip styling for highlight filters
- ✅ "Clear All Highlights" link to remove only highlights
- ✅ "Clear All" button to remove both filters and highlights
- ✅ Domain-agnostic implementation (works with any domain config)
- ✅ URL-First architecture (h_* URL parameters)

**Documentation**: [QUERY-CONTROL-HIGHLIGHTS-SUMMARY.md](QUERY-CONTROL-HIGHLIGHTS-SUMMARY.md)

**Git Tag**: v0.3.0 (2025-11-23) - 1 file created, 7 files modified, ~318 lines added

---

### Option 3: VIN Browser Panel (RECOMMENDED - High Value)

**Priority**: HIGH (Adds drill-down capability to complete data exploration)
**Component**: VIN instance browser
**Estimated Effort**: 3-4 days

**What to Build**:
- Browse individual VINs for selected vehicle specs
- Drill-down from specs to instances
- Integration with VINs API (`/api/vins/v1/*`)
- Display VIN details (mileage, condition, value, estimated_value, registered_state, exterior_color, etc.)
- Row expansion integration in ResultsTable
- URL-First architecture for VIN filtering

**API Endpoints Available**:
```typescript
// Get all VIN instances
GET /api/vins/v1/vins?manufacturer=Ford&yearMin=2020&page=1&size=20

// Get VINs for specific vehicle specification
GET /api/vins/v1/vehicles/:vehicleId/instances?page=1&pageSize=20
```

**Expected Outcome**:
- Users can click on vehicle spec row to see individual VIN instances
- VIN details displayed in row expansion panel
- VIN filtering capabilities (by condition, mileage range, value range, state, etc.)
- Complete data lineage: Specs → VINs → Details

---

## Alternative Next Steps

If VIN Browser Panel seems too complex, consider these alternatives:

1. **Row Expansion Details** - Custom expansion templates for ResultsTable
   - Show vehicle specification details inline
   - Preview VIN instances for a spec
   - Link to full VIN browser

2. **Column Management** - UI for show/hide and reorder columns
   - PrimeNG supports this natively
   - Just needs UI controls (MultiSelect for column toggle)
   - State persistence via localStorage

3. **Export Functionality** - CSV/Excel export for filtered data
   - Export current results to CSV
   - Export charts as images
   - PrimeNG provides exportCSV() method on Table

---

## Critical Architecture Constraints

### 🔴 DO NOT VIOLATE THESE

1. **Domain-Agnostic Component**
   - Component MUST work with ANY domain configuration
   - NO hardcoded field names (manufacturer, model, etc.)
   - ALL filter definitions from `domainConfig.filters`
   ```typescript
   // ✅ CORRECT
   *ngFor="let filterDef of domainConfig.filters"

   // ❌ WRONG
   <option value="manufacturer">Manufacturer</option>
   ```

2. **PrimeNG-First**
   - Use PrimeNG Dialog, Dropdown, Checkbox directly
   - DO NOT create custom modal component
   - DO NOT create custom dropdown component
   - DO NOT create custom chip component

3. **URL-First State**
   - ALL state changes via UrlStateService
   - NO direct router.navigate() with queryParams
   - URL is single source of truth
   ```typescript
   // ✅ CORRECT
   this.urlState.setQueryParams({ bodyClass: 'Sedan,SUV' }).subscribe();

   // ❌ WRONG
   this.router.navigate([], { queryParams: { bodyClass: 'Sedan,SUV' } });
   ```

4. **OnPush Change Detection**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush  // REQUIRED
   })

   // MUST call after async updates
   this.apiService.get(...).subscribe(data => {
     this.data = data;
     this.cdr.markForCheck();  // REQUIRED
   });
   ```

5. **Test-Driven Development**
   - Write tests FIRST
   - DO NOT modify tests to make them pass
   - Fix implementation, not tests

---

## API Endpoints Needed

All endpoints exist in backend (Specs API):

```typescript
// Filter options endpoints
GET /api/specs/v1/filters/manufacturers?limit=1000
// Response: { success: true, manufacturers: ["Ford", "Toyota", ...] }

GET /api/specs/v1/filters/models?limit=1000
// Response: { success: true, models: ["F-150", "Camry", ...] }

GET /api/specs/v1/filters/body-classes?limit=1000
// Response: { success: true, body_classes: ["Sedan", "SUV", ...] }

GET /api/specs/v1/filters/data-sources?limit=1000
// Response: { success: true, data_sources: ["nhtsa_vpic", ...] }

GET /api/specs/v1/filters/year-range
// Response: { success: true, min: 1908, max: 2024 }
```

All endpoints are already implemented and working.

---

## PrimeNG Modules to Add

Add to `primeng.module.ts`:
```typescript
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
```

---

## Success Criteria

### MVP (Minimum Viable Product)
- ✅ Query Control panel renders with dropdown
- ✅ Can add Manufacturer filter (multiselect)
- ✅ Can add Body Class filter (multiselect)
- ✅ Can add Year filter (range - simple inputs OK)
- ✅ Active filters display as chips
- ✅ Can remove filters via chip X button
- ✅ Can edit filters by clicking chip
- ✅ URL updates correctly
- ✅ Results table filters correctly
- ✅ Filters persist across refresh

### Full Implementation
- ✅ All MVP features
- ✅ Year range picker with grid UI
- ✅ Search in multiselect dialogs
- ✅ Loading states
- ✅ Error handling with retry
- ✅ Accessibility (keyboard nav, screen reader)
- ✅ Unit tests (80%+ coverage)
- ✅ E2E tests (all workflows)

---

## Reference Documents

**MUST READ BEFORE CODING**:
1. [docs/components/query-control/specification.md](docs/components/query-control/specification.md) - PRIMARY SPEC
   - Complete wireframes
   - 12 Gherkin acceptance criteria
   - 10 detailed manual test cases
   - Edge cases and error handling

2. [docs/components/query-control/NEXT_SESSION.md](docs/components/query-control/NEXT_SESSION.md) - IMPLEMENTATION GUIDE
   - Complete code examples
   - Step-by-step implementation
   - Troubleshooting

3. [VERIFICATION-RUBRIC.md](VERIFICATION-RUBRIC.md) - ARCHITECTURE COMPLIANCE
   - 7-step verification process
   - Critical red flags
   - Valid vs invalid patterns

**Architecture References**:
- [plan/02-PRIMENG-NATIVE-FEATURES.md](plan/02-PRIMENG-NATIVE-FEATURES.md) - What PrimeNG provides
- [plan/03-REVISED-ARCHITECTURE.md](plan/03-REVISED-ARCHITECTURE.md) - Clean architecture
- [plan/05-IMPLEMENTATION-GUIDE.md](plan/05-IMPLEMENTATION-GUIDE.md) - Code patterns

**Example Components**:
- [frontend/src/framework/components/base-picker/](frontend/src/framework/components/base-picker/) - Configuration-driven approach
- [frontend/src/framework/components/results-table/](frontend/src/framework/components/results-table/) - PrimeNG integration

---

## After Query Control: Next Components

### Priority 2 (After Query Control Works)
1. **Interactive Charts Panel** (Panel #4)
   - Manufacturer distribution chart
   - Year distribution chart
   - Click-to-highlight interaction
   - Requires: BaseChartComponent, chart configs

2. **VIN Browser Panel** (Panel #5)
   - Browse individual VINs for selected vehicles
   - Drill-down from specs to instances
   - Integration with VINs API

### Priority 3 (Future)
3. **Dual Picker Variants** (Panel #2, #3)
   - Alternative picker UIs
   - Same data, different visualizations

4. **Panel Container System**
   - Drag-drop reordering
   - Collapse/expand
   - Pop-out to separate windows

---

## Quick Start Commands

### Start Development Container
```bash
# On host machine
cd ~/projects/generic-prime
podman run -d --name generic-prime-dev \
  --network host \
  -v $(pwd)/frontend:/app:z \
  -w /app \
  localhost/generic-prime-frontend:dev

# Enter container
podman exec -it generic-prime-dev sh

# Inside container - start dev server
npm start
```

Access at: http://localhost:4205

### Generate Component (Inside Container)
```bash
ng generate component framework/components/query-control --skip-tests
```

### Run Tests (Inside Container)
```bash
# Unit tests
npm test

# Specific test file
npm test -- --include='**/query-control.component.spec.ts'

# E2E tests
npm run e2e

# Coverage
npm run test:coverage
```

---

## Troubleshooting

### Backend Services Not Responding
See [docs/components/query-control/SERVICE-TROUBLESHOOTING.md](docs/components/query-control/SERVICE-TROUBLESHOOTING.md)

Quick fix:
```bash
# 1. Start Elasticsearch first
kubectl scale deployment elasticsearch -n data --replicas=1
sleep 30

# 2. Start Backend
kubectl scale deployment autos-backend -n autos --replicas=2
sleep 30

# 3. Verify
curl http://auto-discovery.minilab/api/specs/v1/filters/manufacturers
```

### Container Not Running
```bash
podman ps | grep generic-prime-dev
# If not running, start it (see Quick Start Commands above)
```

---

## Implementation Timeline

| Day | Phase | Hours | Tasks |
|-----|-------|-------|-------|
| 1 | Setup & Structure | 6-8h | Component files, interfaces, domain config, basic UI |
| 2 | Dialogs & Integration | 6-8h | Multiselect dialogs, chip management, discover integration |
| 3 | Polish & Unit Tests | 6-8h | Year picker, error handling, loading states, unit tests |
| 4 | E2E & Documentation | 4-6h | E2E tests, bug fixes, TLDR.md updates |

**Total**: 3-4 days (22-30 hours)

---

## Key Differences: Query Control vs BasePickerComponent

### Why Not Reuse BasePickerComponent?

| Feature | BasePickerComponent | QueryControlComponent |
|---------|---------------------|------------------------|
| **Purpose** | Reusable multi-select table | Panel orchestrating multiple filter types |
| **UI** | Table with checkboxes | Chips + Dialogs |
| **Filter Types** | Single type (multiselect) | Multiple types (multiselect, range, text) |
| **Configuration** | PickerConfig<T> | FilterDefinition<T>[] |
| **Reusability** | Highly reusable | Panel-specific |
| **Data Source** | Single API endpoint | Multiple endpoints (one per field) |

---

## Post-Implementation: Update These Files

After implementing Query Control, update:
- [ ] [TLDR.md](TLDR.md) - Add Query Control to "✅ COMPLETED" section
- [ ] [TLDR-NEXT-STEP.md](TLDR-NEXT-STEP.md) - Move to next component (Charts or VIN Browser)
- [ ] [framework/framework.module.ts](frontend/src/framework/framework.module.ts) - Export QueryControlComponent
- [ ] [README.md](README.md) - Update progress (if exists)

---

**End of TLDR-NEXT-STEP.md**
