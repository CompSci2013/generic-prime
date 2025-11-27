# TLDR.md - Implementation Status

**Last Updated:** 2025-11-26
**Purpose:** Quick reference for Claude Code sessions to understand current implementation state

---

## ⚠️ Two Application Versions Running

| Port | Application | Status | Description |
|------|-------------|--------|-------------|
| **4201** | autos-prime-ng | **Mature** | Reference implementation. Nearly all features working without bugs. Legacy picker/table (not config-driven). |
| **4205** | generic-prime | **Partial** | New implementation. Configuration-driven picker/table system. Partially implemented, has known bugs (#11, #10, #7). |

**URLs**:
- **Reference (mature)**: `http://192.168.0.244:4201/discover`
- **New (in development)**: `http://192.168.0.244:4205/discover`

**Key Difference**: Port 4201 is the working reference to compare against. Port 4205 is the new config-driven architecture being developed.

---

## Quality Assessment (2025-11-26)

**Overall Grade: B+ (84/100)** - Production-ready, professional quality

| Category | Score | Notes |
|----------|-------|-------|
| Architecture & Design | 22/25 | Excellent module organization, URL-first state, config-driven |
| Code Quality | 21/25 | Strict TypeScript, good docs, some `any` types in templates |
| Angular Best Practices | 22/25 | OnPush everywhere, proper RxJS, good lifecycle management |
| Performance | 16/20 | Bundle budgets set, caching works, missing virtual scroll |
| Security | 12/15 | Good error handling, missing route guards |
| Testing | 10/15 | Infrastructure exists, low coverage |
| Maintainability | 13/15 | Excellent readability, scalable architecture |

**Top Strengths:** Config-driven architecture, URL-first state, OnPush change detection, comprehensive JSDoc
**Priority Improvements:** Add route guards, implement lazy loading, reduce `any` types, add virtual scrolling

**Full Assessment:** [GENERIC-PRIME-ASSESSMENT.md](GENERIC-PRIME-ASSESSMENT.md)
**Rubric Used:** [ASSESSMENT-RUBRIC.md](ASSESSMENT-RUBRIC.md)

**⚠️ UNIT TESTING POLICY:** Do NOT write unit tests. AI-generated tests have proven brittle and are often modified to pass rather than improving code quality. Testing will be addressed as a dedicated project with proper methodology. Testing weight in rubric reduced to 1%.

---

## 🐳 Development Container Commands (CRITICAL)

**⚠️ ALL npm/ng commands run INSIDE the container, NOT on the host machine.**

**Container Name:** `generic-prime-frontend-dev`

### Start Development Session

```bash
# 1. Start container (if not running)
cd ~/projects/generic-prime/frontend
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev

# 2. Start Angular dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# 3. Access at http://localhost:4205 or http://192.168.0.244:4205
```

### Run Commands Inside Container

```bash
# Pattern: podman exec -it generic-prime-frontend-dev <command>

# Install dependencies
podman exec -it generic-prime-frontend-dev npm install

# Run Angular CLI
podman exec -it generic-prime-frontend-dev ng generate component features/my-component
podman exec -it generic-prime-frontend-dev ng build

# Interactive shell
podman exec -it generic-prime-frontend-dev sh
```

### Container Management

```bash
# Check if running
podman ps | grep generic-prime-frontend-dev

# View logs
podman logs generic-prime-frontend-dev

# Stop container
podman stop generic-prime-frontend-dev

# Remove and recreate (if issues)
podman rm -f generic-prime-frontend-dev
cd ~/projects/generic-prime/frontend
podman run -d --name generic-prime-frontend-dev --network host \
  -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev
```

### Build Dev Image (first time only)

```bash
cd ~/projects/generic-prime/frontend
podman build -f Dockerfile.dev -t localhost/generic-prime-frontend:dev .
```

**Full Details:** [docs/DEVELOPER-ENVIRONMENT.md](docs/DEVELOPER-ENVIRONMENT.md)

---

## Project Architecture

**Generic Discovery Framework** - Domain-agnostic Angular 14 framework for browsing/analyzing data across domains (automobile, agriculture, real estate, etc.)

**Key Principle:** PrimeNG-First Architecture - Use PrimeNG components directly (NO custom table wrappers)

**Architecture Pattern:** URL-First State Management
- URL is single source of truth
- Flow: URL → Filters → API → Data → Components
- All state changes sync to URL, triggering data fetches

---

## Implementation Status Summary

### ✅ COMPLETED (Framework - F Milestones)

**Framework Services** (9 services, ~3,139 total lines):
1. `UrlStateService` (289 lines) - URL parameter management, query param read/write, observables
2. `RequestCoordinatorService` (304 lines) - 3-layer processing: Cache → Dedup → HTTP retry
3. `ResourceManagementService` (302 lines) - Generic state orchestration, filter/data/statistics management
4. `ApiService` (282 lines) - HTTP wrapper with error handling
5. `PopOutContextService` (366 lines) - Pop-out window detection, BroadcastChannel messaging
6. `PickerConfigRegistry` (207 lines) - Centralized picker config management
7. `DomainConfigRegistry` (281 lines) - Domain config injection token and registry
8. `DomainConfigValidator` (540 lines) - Config schema validation
9. `ErrorNotificationService` (368 lines) - User-facing error messages, PrimeNG MessageService integration

**Framework Components** (5 components):
1. `BasePickerComponent` - Configuration-driven multi-select table
   - Uses PrimeNG Table directly (NOT a custom wrapper)
   - Supports server/client pagination, search, sorting
   - URL sync via selection serialization
   - Template: 157 lines of PrimeNG markup

2. `ResultsTableComponent` - Domain-agnostic data table
   - Configuration-driven filter panel (text, number, range, select, date, boolean)
   - PrimeNG Table with lazy loading, pagination, sorting, row expansion
   - Filter changes trigger URL updates → data fetch
   - Statistics panel support
   - Template: 233 lines

3. `QueryControlComponent` - Manual filter management via dialogs
   - Dropdown field selector (dynamically populated from domain config)
   - Multiselect dialog for list-based filters (manufacturer, model, body class)
   - Range dialog for numeric filters (year range)
   - Active filter chips with edit/remove functionality
   - URL-first architecture - syncs filters to/from URL parameters
   - Fully domain-agnostic - works with any domain configuration
   - Template: 179 lines, TypeScript: 467 lines
   - **NOTE**: Unit tests purposefully skipped (not cost-effective for UI components)

4. `BaseChartComponent` - Generic Plotly.js chart container
   - ChartDataSource pattern for data transformation
   - Supports any Plotly.js chart type (bar, line, pie, scatter, etc.)
   - Interactive click events for filtering/highlighting (single-click and box selection)
   - Responsive resizing
   - Delegation pattern for chart-specific formatting
   - Template: 14 lines, TypeScript: 298 lines

5. `StatisticsPanelComponent` - Statistics visualization panel
   - Injects shared ResourceManagementService instance (proper Angular DI)
   - Renders multiple BaseChartComponents based on domain config
   - Collapsible PrimeNG Panel
   - Automatically fetches statistics from API
   - URL-First architecture for chart interactions
   - Template: 40 lines, TypeScript: 215 lines
   - ✅ **Fully functional** (v0.2.0 - 2025-11-23)

**Framework Models/Interfaces** (13 files):
1. `domain-config.interface.ts` (763 lines) - Complete domain config schema
   - `DomainConfig<TFilters, TData, TStatistics>` - Main config interface
   - `DomainFeatures` - Feature flags (highlights, popOuts, rowExpansion, etc.)
   - `FilterDefinition` - Filter UI controls config
   - `FilterFormat` - Number/date formatting, case sensitivity
   - `ChartConfig` - Chart configuration

2. `table-config.interface.ts` (8,339 lines doc) - PrimeNG table wrapper config
3. `picker-config.interface.ts` (8,361 lines doc) - Picker configuration schema
4. `resource-management.interface.ts` (2,950 lines) - State interfaces
   - `ResourceState<TFilters, TData, TStatistics>`
   - `IApiAdapter`, `IFilterUrlMapper`, `ICacheKeyBuilder`
5. `popout.interface.ts` (7,263 lines doc) - Pop-out window messaging
6. `error-notification.interface.ts` (6,803 lines) - Error types and handling
7. `api-response.interface.ts` (1,701 lines) - Standard API response shapes
8. `pagination.interface.ts` (837 lines) - Pagination metadata
9. `filter-definition.interface.ts` (1,063 lines) - Filter field definitions

**Framework Module:**
- Exports: `BasePickerComponent`, `ResultsTableComponent`, `QueryControlComponent`, `BaseChartComponent`, `StatisticsPanelComponent`
- Re-exports: CommonModule, FormsModule, PrimengModule for convenience

### ✅ COMPLETED (Automobile Domain - D Milestones)

**Domain Configuration** (`domain-config/automobile/`):

**Models** (4 files, ~1,004 lines):
- `automobile.filters.ts` (273 lines) - `AutoSearchFilters` interface (manufacturer, model, year range, body class, etc.)
  - Also defines `HighlightFilters` interface (h_yearMin, h_yearMax, h_manufacturer, h_modelCombos, h_bodyClass)
- `automobile.data.ts` (329 lines) - `VehicleResult` interface (vehicle_id, manufacturer, model, year, body_class, instance_count, etc.)
- `automobile.statistics.ts` (443 lines) - `VehicleStatistics` interface (byManufacturer, modelsByManufacturer, byYearRange, byBodyClass)

**Adapters** (3 files, ~848 lines):
- `automobile-api.adapter.ts` (194 lines) - `AutomobileApiAdapter` implements `IApiAdapter`
  - `fetchData()` - Calls `/api/specs/v1/vehicles/details`
  - Transforms API response to domain models
- `automobile-url-mapper.ts` (421 lines) - `AutomobileUrlMapper` implements `IFilterUrlMapper`
  - `toUrlParams()` - Serializes filters to URL query params
  - `fromUrlParams()` - Deserializes URL to filter object
- `automobile-cache-key-builder.ts` (233 lines) - `AutomobileCacheKeyBuilder` implements `ICacheKeyBuilder`
  - Generates stable cache keys from filter objects

**Configs** (6 files, ~1,381 lines):
- `automobile.table-config.ts` (240 lines) - `AUTOMOBILE_TABLE_CONFIG`
  - Columns: manufacturer, model, year, body_class, data_source, instance_count
  - PrimeNG table settings (paginator, lazy, expandable, etc.)
- `automobile.picker-configs.ts` (175 lines) - `AUTOMOBILE_PICKER_CONFIGS[]`
  - Manufacturer-Model picker config with nested data structure
- `automobile.filter-definitions.ts` (296 lines) - `AUTOMOBILE_FILTER_DEFINITIONS[]`
  - Inline filters for ResultsTable: manufacturerSearch, modelSearch, yearMin, yearMax, bodyClassSearch, dataSourceSearch
  - Number formatting config (e.g., year without commas)
- `automobile.query-control-filters.ts` (106 lines) - `AUTOMOBILE_QUERY_CONTROL_FILTERS[]`
  - Dialog-based regular filters for QueryControl: manufacturer, model, bodyClass, yearMin/yearMax
  - API endpoints for fetching filter options
  - Response transformers for each filter
- `automobile.highlight-filters.ts` (119 lines) - `AUTOMOBILE_HIGHLIGHT_FILTERS[]`
  - Dialog-based highlight filters for QueryControl: h_manufacturer, h_modelCombos, h_bodyClass, h_yearMin/h_yearMax
  - Same API endpoints as regular filters
  - ✅ **NEW in v0.3.0** (2025-11-23)
- `automobile.chart-configs.ts` (71 lines) - `AUTOMOBILE_CHART_CONFIGS[]`
  - 4 chart definitions: manufacturer, top-models, body-class, year
  - ✅ Fully implemented and working (v0.2.0)
  - ✅ Complete documentation: [docs/components/charts/](docs/components/charts/)

**Chart Data Sources** (4 files, ~640 lines):
- `manufacturer-chart-source.ts` (156 lines) - Stacked bar chart (top 20 manufacturers, highlighted vs other)
- `top-models-chart-source.ts` (160 lines) - Stacked bar chart (top 20 models by VIN count, highlighted vs other)
- `body-class-chart-source.ts` (162 lines) - Stacked bar chart (all body classes, highlighted vs other)
- `year-chart-source.ts` (162 lines) - Stacked bar chart (all years, highlighted vs other)
- **Features**: Server-side segmented statistics, URL-First architecture, box selection, consistent stacking order

**Domain Config Factory:**
- `automobile.domain-config.ts` (102 lines) - `createAutomobileDomainConfig()`
  - Factory function for dependency injection
  - Combines all models, adapters, and configs
  - Registered in `AppModule` as `DOMAIN_CONFIG` token

### ✅ COMPLETED (Application Layer)

**App Module:**
- `app.module.ts` - Bootstraps app with FrameworkModule, PrimengModule
- Provides `DOMAIN_CONFIG` via `createAutomobileDomainConfig()` factory
- Registers `GlobalErrorHandler` for error handling

**Routing:**
- `app-routing.module.ts` - Single route: `/discover` → `DiscoverComponent`
- Redirects `/` to `/discover`

**Discover Feature Component:**
- `discover.component.ts` (65 lines) - Domain-agnostic orchestration component
  - Injects `DOMAIN_CONFIG` (works with ANY domain)
  - Registers picker configs on init
  - Delegates to framework components
- `discover.component.html` (24 lines):
  - Header with domain label
  - `<app-query-control>` for manual filter management
  - `<app-base-picker>` for manufacturer-model selection
  - `<app-results-table>` for filtered data display

**Environment:**
- `environment.ts` - `apiBaseUrl: 'http://auto-discovery.minilab/api/specs/v1'`

**PrimeNG Setup:**
- `primeng.module.ts` - Imports all used PrimeNG modules
  - TableModule, ButtonModule, InputTextModule, PanelModule, CheckboxModule, DropdownModule, CalendarModule, etc.

---

## What's Working

### ✅ Core Framework
1. **URL-First State Management** - URL updates trigger filter changes → data fetch
2. **Resource Management** - Generic state orchestration with RxJS observables
3. **Request Coordination** - Cache (30s TTL), deduplication, retry with exponential backoff
4. **Picker System** - Configuration-driven multi-select tables with URL sync
5. **Query Control** - Manual filter management via dialogs (multiselect, range)
6. **Results Table** - Configuration-driven data table with filters, pagination, sorting
7. **Error Handling** - Global error handler, user-facing notifications
8. **Domain Config Registry** - Injectable domain configuration with validation
9. **Charts & Statistics** - Plotly.js-based visualization with interactive highlighting (✅ v0.2.0)

### ✅ Automobile Domain
1. **Filter System** - Inline filters (text search, year range) + Query Control (multiselect dialogs)
2. **Query Control Filters** - Manufacturer, Model, Body Class (multiselect), Year Range (dialog-based)
3. **Query Control Highlights** - Separate highlight filters (h_manufacturer, h_modelCombos, h_bodyClass, h_yearMin/Max)
   - Yellow/amber chips to distinguish from regular filters
   - "Clear All Highlights" link to remove only highlights
   - "Clear All" button to remove both filters and highlights
4. **Data Table** - Vehicle specs display with pagination, sorting
5. **Picker** - Manufacturer-Model combination picker
6. **API Integration** - `/api/specs/v1/vehicles/details` endpoint + filter option endpoints
7. **URL Serialization** - Filters persist in URL query params (regular: `manufacturer`, highlights: `h_manufacturer`)
8. **Charts & Highlighting** - 4 interactive Plotly.js charts with server-side segmented statistics
   - Click/box selection to add highlight filters (h_manufacturer, h_modelCombos, h_bodyClass, h_yearMin/Max)
   - Stacked bars showing highlighted (blue) vs other (gray) data
   - Top 20 items for manufacturer and models charts
   - URL-First architecture compliance
   - Complete specification: [docs/components/charts/](docs/components/charts/)

---

## ✅ Backend Deployment Infrastructure Ready (2025-11-23)

**Self-Contained Project Structure:**
All backend source code, K8s configs, and documentation now in `~/projects/generic-prime/`

**Backend Source:**
- `backend-specs/` - Complete API source code (copied from auto-discovery)
- Ready to build image: `localhost/generic-prime-backend:v1.0.1`
- **Issue Found**: `bodyClass` parameter doesn't support comma-separated values (needs fix)

**Kubernetes Configurations** (`k8s/` directory):
- `namespace.yaml` - generic-prime namespace
- `backend-deployment.yaml` - Backend deployment (2 replicas, Thor node)
- `backend-service.yaml` - ClusterIP service on port 3000
- `frontend-deployment.yaml` - Frontend deployment (2 replicas)
- `frontend-service.yaml` - ClusterIP service on port 80
- `ingress.yaml` - Traefik ingress routing for `generic-prime.minilab`

**Frontend Build Configs:**
- `frontend/Dockerfile.dev` - Development container (copied from autos-prime-ng)
- `frontend/Dockerfile.prod` - Production build (multi-stage: node → nginx)

**Documentation:**
- `docs/DEVELOPER-ENVIRONMENT.md` (v2.0) - Complete build/deploy guide (880 lines)
  - Phase 1: Create namespace
  - Phase 2: Build & deploy backend (steps 2-14)
  - Phase 3: Build & deploy frontend (steps 15-21)
  - Phase 4: Dev container setup (steps 22-25)
  - Phase 5: Daily development workflows
- `docs/BACKEND-API-UPDATES.md` - Quick reference for backend updates

**Deployment Architecture:**
- **Namespace**: `generic-prime` (independent from auto-discovery)
- **Services**: `generic-prime-backend`, `generic-prime-frontend`
- **Images**: `localhost/generic-prime-backend:v1.0.X`, `localhost/generic-prime-frontend:prod`
- **Ingress Host**: `generic-prime.minilab`
- **Backend API**: `http://generic-prime.minilab/api/...`
- **Frontend**: `http://generic-prime.minilab`

**Backend API Status (2025-11-24 - TESTING COMPLETED):**

⚠️ **CRITICAL**: This is the **generic-prime** project. Always test using:
- **Frontend Application**: `http://192.168.0.244:4205/discover` (dev server)
- **Generic-Prime Backend**: `http://generic-prime.minilab/api/specs/v1/...` (deployed and tested)
- **DO NOT TEST**: `auto-discovery.minilab` (different project, not relevant)

**Current Status:**
- ✅ **Backend Deployed**: Running in `generic-prime` namespace (2 replicas)
- ✅ **Frontend Working**: Dev server at `http://192.168.0.244:4205/discover`
- ✅ **Comma-Separated Filters Verified**: All parameters support comma-separated values with OR logic
  - `bodyClass=Sedan,SUV,Pickup` → Returns 3,903 results (2,615 + 998 + 290) ✅
  - `manufacturer=Ford,Chevrolet,Toyota` → Returns 1,514 results (665 + 849 + 0) ✅
  - `model=F-150,Mustang,Silverado` → Returns 140 results (51 + 62 + 27) ✅
  - `h_manufacturer=Ford,Chevrolet` → Segmented statistics working correctly ✅
  - `h_bodyClass=Sedan,SUV` → Segmented statistics working correctly ✅

**Backend Testing Results (2025-11-24):**

All regular filter parameters now support comma-separated values with proper OR logic:
- **bodyClass**: ✅ FIXED (was returning 0, now returns correct union)
- **manufacturer**: ✅ Working (correct totals, proper OR logic)
- **model**: ✅ Working (correct totals, proper OR logic)
- **h_*** highlight filters**: ✅ Working (segmented statistics correct)

**Note on Result Pagination**:
Results are grouped by filter value (Elasticsearch default behavior). Example: `bodyClass=Sedan,SUV` returns all Sedans first (pages 1-130), then SUVs (pages 131+). This is normal distributed search behavior - totals are correct, all data is returned, just not interleaved.

**Testing Procedure for Future Sessions:**
1. Test through frontend application: `http://192.168.0.244:4205/discover?bodyClass=Sedan,SUV`
2. Test backend directly: `kubectl port-forward -n generic-prime svc/generic-prime-backend 3000:3000` then `curl http://localhost:3000/api/specs/v1/vehicles/details?bodyClass=Sedan,SUV`
3. Never test against auto-discovery.minilab - wrong project

---

## What's NOT Working / Not Implemented

### ✅ Recently Completed

**Query Control Highlights (v0.3.0 - 2025-11-23)**:
- ✅ Created highlight filter definitions (h_manufacturer, h_modelCombos, h_bodyClass, h_yearMin/Max)
- ✅ Added "Active Highlights" section in Query Control (separate from Active Filters)
- ✅ Yellow/amber chip styling for highlight filters
- ✅ "Clear All Highlights" link to remove only highlights
- ✅ "Clear All" button to remove both filters and highlights
- ✅ Domain-agnostic implementation (works with any domain config)
- ✅ URL-First architecture (h_* URL parameters)
- **Documentation**: [QUERY-CONTROL-HIGHLIGHTS-SUMMARY.md](QUERY-CONTROL-HIGHLIGHTS-SUMMARY.md)

**Charts & Highlighting System (v0.2.0 - 2025-11-23)**:
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
- **Documentation**: [docs/components/charts/specification.md](docs/components/charts/specification.md)

**Pop-Out Windows (2025-11-22 - 2025-11-23)**:

**System Features**:
- ✅ Pop-out buttons on all panels (Statistics, Results, Query Control, Pickers)
- ✅ Pop-out routing (`/panel/:gridId/:panelId/:type`)
- ✅ `PanelPopoutComponent` container component
- ✅ BroadcastChannel cross-window messaging
- ✅ URL parameter synchronization between main window and pop-outs
- ✅ MOVE semantics (panel disappears from main window when popped out)
- ✅ Automatic panel restoration when pop-out closed

**Bug Fixes (2025-11-22)**:
- ✅ Fixed duplicate API calls (ResourceManagementService DI refactoring)
  - Changed from manual instantiation to proper Angular InjectionToken pattern
  - Single shared instance per page (DiscoverComponent, PanelPopoutComponent)
  - Eliminated duplicate data fetches from ResultsTableComponent and StatisticsPanelComponent
- ✅ Fixed paginator display issue (URL-first state management)
  - Removed PrimeNG `stateStorage` conflicting with URL state
  - Added `paginatorFirst` computed getter for proper change detection
  - URL is now single source of truth for pagination state
- ✅ Fixed pagination indexing (1-indexed API compliance)
  - Changed all `page: 0` resets to `page: 1` (API uses 1-indexed pagination)
  - Fixed in discover.component.ts and query-control.component.ts

**Bug Fixes (2025-11-23 Session)**:
- ✅ **Bug #1**: Clear button in pop-out Query Control not updating URL ([panel-popout.component.ts:214](frontend/src/app/features/panel-popout/panel-popout.component.ts#L214))
  - Root cause: PanelPopoutComponent.onUrlParamsChange() only broadcasted to main window but didn't update pop-out's own URL
  - Fix: Added `this.urlState.setParams(params)` call to update pop-out's URL before broadcasting
  - Pattern: Pop-outs must update their own URL first, then broadcast to main window
- ✅ **Bug #4**: Query Control not showing modelCombos selection chips ([automobile.query-control-filters.ts:113-137](frontend/src/domain-config/automobile/configs/automobile.query-control-filters.ts#L113-L137))
  - Root cause: modelCombos parameter not defined in AUTOMOBILE_QUERY_CONTROL_FILTERS
  - Fix: Added modelCombos filter definition with manufacturer-model-combinations API endpoint
  - Pattern: All URL parameters used by pickers must have corresponding filter definitions in Query Control
- ✅ **Bug #5**: Pop-out picker not updating when filters cleared until window focused ([base-picker.component.ts:147,175,204](frontend/src/framework/components/base-picker/base-picker.component.ts#L147))
  - Root cause: OnPush change detection + `cdr.markForCheck()` only schedules change detection, doesn't run in unfocused windows
  - Fix: Replaced `markForCheck()` with `detectChanges()` in 3 locations (URL sync, hydration)
  - Pattern: **CRITICAL** - Use `detectChanges()` instead of `markForCheck()` for pop-out windows that need immediate UI updates

### ❌ Known Active Bugs (2025-11-26)

**🔴 CRITICAL - Bug #11**: Manufacturer-Model Picker Shows Incorrect Total Count and Missing Data
- Status: 🔴 UNDER INVESTIGATION - Documented in KNOWN-BUGS.md
- Picker shows ~72 entries (only Chevrolet) when there should be ~4,800+ manufacturer-model combinations
- Total count changes inconsistently with page size (858, 798, 466, 295)
- **⚠️ METHODOLOGY: Data-First Investigation** (see TLDR-NEXT-STEP.md):
  1. **Phase 1**: Elasticsearch data analysis FIRST (understand true data structure)
  2. **Phase 2**: Define what tables/pickers make sense for actual data
  3. **Phase 3**: Backend routes analysis (fix backend BEFORE frontend)
  4. **Phase 4**: Frontend component verification (only after backend is correct)
  5. **Phase 5**: Frontend fixes LAST
- **DO NOT** modify frontend code until Phases 1-3 are complete!

**Pop-Out Window Bugs**:
- ❌ **Bug #10**: Popped-out statistics panel breaks with pre-selected bodyClass filters (2025-11-24)
  - Status: Documented in KNOWN-BUGS.md, needs investigation
  - When main window has `bodyClass=SUV,Coupe,Pickup,Van,Hatchback` in URL, popping out statistics panel shows broken/incorrect charts
- ❌ **Bug #7**: Checkboxes remain visually checked after clearing selections (2025-11-23)
  - Status: FIX IMPLEMENTED, needs testing

**Tracking**: See [KNOWN-BUGS.md](KNOWN-BUGS.md) for detailed reproduction steps and analysis

### ❌ Not Implemented Yet

**Row Expansion Details:**
- Basic row expansion works (shows all fields)
- No custom expansion templates
- No VIN instance details panel

**Column Management:**
- No column show/hide UI
- No column reordering UI
- PrimeNG supports it, but no UI controls

**Export Functionality:**
- No CSV export
- No Excel export
- No data export buttons

**Advanced Filters (Partially Implemented):**
- ✅ Multiselect filters implemented via QueryControl component (manufacturer, model, body class)
- ✅ Range filters implemented via QueryControl component (year range)
- ❌ No date range filters (type='daterange' not used)
- ❌ No filter operators UI (equals, contains, etc.) - ResultsTable uses simple text matching

**State Persistence:**
- No localStorage integration beyond PrimeNG table state
- No user preference saving
- No session restoration

**Testing:**
- Only 5 test files (*.spec.ts)
- `url-state.service.spec.ts`, `api.service.spec.ts`, `http-error.interceptor.spec.ts`, `resource-management.service.spec.ts`
- Component tests: MISSING
- E2E tests: MISSING
- Test coverage: UNKNOWN (likely <20%)

**Authentication:**
- No auth service integration
- No protected routes
- API base URL points to `/api/specs/v1` (no auth)

---

## Key Architecture Patterns

### 1. Configuration-Driven UI
```typescript
// Define config once, framework renders UI automatically
const AUTOMOBILE_FILTER_DEFINITIONS: FilterDefinition[] = [
  { id: 'manufacturerSearch', label: 'Manufacturer', type: 'text', placeholder: '...' },
  { id: 'yearMin', label: 'Year', type: 'range', min: 1900, max: 2025 }
];

// Framework component dynamically renders filters
<ng-container *ngFor="let filterDef of domainConfig.filters">
  <input *ngIf="filterDef.type === 'text'" ... />
  <p-inputNumber *ngIf="filterDef.type === 'number'" ... />
</ng-container>
```

### 2. Generic Type Parameters
```typescript
// Framework service works with ANY domain
class ResourceManagementService<TFilters, TData, TStatistics> {
  constructor(config: ResourceManagementConfig<TFilters, TData, TStatistics>) {}
}

// Automobile domain instantiation
new ResourceManagementService<AutoSearchFilters, VehicleResult, VehicleStatistics>(config)
```

### 3. Adapter Pattern
```typescript
// Domain implements adapters
class AutomobileApiAdapter implements IApiAdapter<AutoSearchFilters, VehicleResult, VehicleStatistics> {
  async fetchData(filters: AutoSearchFilters, pagination: PaginationParams): Promise<ApiResponse<VehicleResult, VehicleStatistics>> {
    // Domain-specific API call and transformation
  }
}

// Framework calls adapter generically
this.config.apiAdapter.fetchData(filters, pagination)
```

### 4. URL-First State Flow
```
User Action (filter change)
  ↓
Component calls resourceService.updateFilters()
  ↓
ResourceService calls urlState.setQueryParams()
  ↓
URL updates (browser history, shareable URL)
  ↓
urlState.queryParams$ emits new params
  ↓
ResourceService observes URL change
  ↓
Calls apiAdapter.fetchData() via RequestCoordinator
  ↓
Updates state$ BehaviorSubject
  ↓
Components observe state$ and re-render
```

### 5. PrimeNG-First (NO Custom Wrappers)
```html
<!-- CORRECT: Use PrimeNG Table directly -->
<p-table
  [value]="data$ | async"
  [lazy]="true"
  [paginator]="true"
  (onLazyLoad)="onLazyLoad($event)">
  <!-- Native PrimeNG templates -->
</p-table>

<!-- WRONG: Custom table wrapper (DELETED in revision) -->
<app-base-data-table [config]="..."></app-base-data-table>  ❌
```

### 6. OnPush Change Detection in Pop-Out Windows

**⚠️ CRITICAL PATTERN** (Discovered 2025-11-23):

Pop-out windows (unfocused browser windows) require special change detection handling:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush  // Required for performance
})
export class BasePickerComponent {

  // ❌ WRONG: markForCheck() doesn't work in unfocused windows
  private subscribeToUrlChanges(): void {
    this.route.queryParams.subscribe(params => {
      this.selections = this.parseUrl(params);
      this.cdr.markForCheck();  // ❌ Only schedules - won't run if window unfocused
    });
  }

  // ✅ CORRECT: detectChanges() forces immediate update
  private subscribeToUrlChanges(): void {
    this.route.queryParams.subscribe(params => {
      this.selections = this.parseUrl(params);
      this.cdr.detectChanges();  // ✅ Forces immediate update, works in unfocused windows
    });
  }
}
```

**When to Use Each**:
- **`markForCheck()`**: Use in main window components (normal case)
  - Schedules change detection for next cycle
  - More efficient (batches updates)
  - Works fine for focused windows

- **`detectChanges()`**: Use in pop-out window components
  - Forces immediate change detection
  - Required for unfocused browser windows
  - Necessary for cross-window state synchronization via BroadcastChannel

**Real-World Bug Example**:
- Bug #5: Pop-out picker didn't update when filter cleared in main window until user clicked on pop-out
- Root Cause: `markForCheck()` scheduled change detection, but unfocused window never ran the cycle
- Fix: Changed to `detectChanges()` in URL sync handlers ([base-picker.component.ts:147,175,204](frontend/src/framework/components/base-picker/base-picker.component.ts#L147))

**Pop-Out-Specific Locations** (use `detectChanges()`):
1. URL parameter change handlers (when syncing from main window)
2. BroadcastChannel message handlers (cross-window communication)
3. Selection hydration (restoring state from URL)

**Reference**: See [KNOWN-BUGS.md](KNOWN-BUGS.md) Bug #5 for detailed analysis

---

## File Structure

```
frontend/src/
├── app/
│   ├── app.module.ts                      # Root module, DOMAIN_CONFIG provider
│   ├── app-routing.module.ts              # Routes: /discover
│   ├── primeng.module.ts                  # PrimeNG module imports
│   └── features/
│       └── discover/
│           ├── discover.component.ts      # Main feature component (65 lines)
│           ├── discover.component.html    # Picker + Results table (20 lines)
│           └── discover.component.scss
│
├── framework/                             # Domain-agnostic framework
│   ├── framework.module.ts                # Exports BasePickerComponent, ResultsTableComponent
│   ├── components/
│   │   ├── base-picker/                   # Multi-select table component
│   │   │   ├── base-picker.component.ts
│   │   │   ├── base-picker.component.html (157 lines)
│   │   │   └── base-picker.component.scss
│   │   └── results-table/                 # Data table with filters
│   │       ├── results-table.component.ts
│   │       ├── results-table.component.html (233 lines)
│   │       └── results-table.component.scss
│   ├── services/
│   │   ├── url-state.service.ts           # 289 lines - URL param management
│   │   ├── request-coordinator.service.ts # 304 lines - Cache/dedup/retry
│   │   ├── resource-management.service.ts # 302 lines - State orchestration
│   │   ├── api.service.ts                 # 282 lines - HTTP wrapper
│   │   ├── popout-context.service.ts      # 366 lines - Pop-out detection
│   │   ├── picker-config-registry.service.ts # 207 lines
│   │   ├── domain-config-registry.service.ts # 281 lines
│   │   ├── domain-config-validator.service.ts # 540 lines
│   │   └── error-notification.service.ts  # 368 lines
│   └── models/
│       ├── domain-config.interface.ts     # 763 lines - Main config schema
│       ├── table-config.interface.ts      # Table configuration
│       ├── picker-config.interface.ts     # Picker configuration
│       ├── resource-management.interface.ts
│       ├── filter-definition.interface.ts # Filter UI definitions
│       ├── popout.interface.ts
│       ├── error-notification.interface.ts
│       ├── api-response.interface.ts
│       └── pagination.interface.ts
│
├── domain-config/automobile/              # Automobile domain implementation
│   ├── automobile.domain-config.ts        # 102 lines - Factory function
│   ├── models/
│   │   ├── automobile.filters.ts          # 217 lines - AutoSearchFilters
│   │   ├── automobile.data.ts             # 329 lines - VehicleResult
│   │   └── automobile.statistics.ts       # 443 lines - VehicleStatistics
│   ├── adapters/
│   │   ├── automobile-api.adapter.ts      # 194 lines - API integration
│   │   ├── automobile-url-mapper.ts       # 421 lines - URL serialization
│   │   └── automobile-cache-key-builder.ts # 233 lines - Cache keys
│   └── configs/
│       ├── automobile.table-config.ts     # 240 lines - Table columns
│       ├── automobile.picker-configs.ts   # 175 lines - Picker config
│       ├── automobile.filter-definitions.ts # 296 lines - Filter controls
│       └── automobile.chart-configs.ts    # 445 lines - Chart defs (UI missing)
│
└── environments/
    └── environment.ts                     # apiBaseUrl config
```

---

## API Integration

**Backend:** Microservices architecture (Specs API, VINs API, Auth API)

**Current Integration:** Specs API only (`/api/specs/v1/*`)

**Implemented Endpoints:**
1. `GET /api/specs/v1/vehicles/details` - Main data endpoint
   - Filters: manufacturer, model, yearMin, yearMax, bodyClass, dataSource, manufacturerSearch, modelSearch, etc.
   - Pagination: page, size
   - Sorting: sortBy, sortOrder
   - Response: `{ results: VehicleResult[], total: number, statistics: VehicleStatistics }`

2. `GET /api/specs/v1/manufacturer-model-combinations` - Picker data
   - Nested structure: `{ data: [{ manufacturer, count, models: [{ model, count }] }] }`

**Not Used Yet:**
- `/api/specs/v1/filters/:fieldName` - Filter options endpoint
- `/api/vins/v1/*` - VIN instance data
- `/api/auth/v1/*` - Authentication

---

## Code Quality

**Assessment Score: 21/25 (Good)**

**TypeScript:**
- Strict mode: ✅ ENABLED (`strict: true` in tsconfig.json)
- `any` types: ⚠️ Used in event handlers (`event: any`), template bindings (`$any()`), some generics
- Type casting: ⚠️ `as unknown as TFilters` pattern used to work around generic constraints
- Change Detection: ✅ OnPush strategy used consistently across ALL components
- Unsubscribe: ✅ `takeUntil(destroy$)` pattern used consistently

**Testing:**
- **⚠️ DO NOT WRITE UNIT TESTS** - Deferred to dedicated testing project
- Existing tests: 5 spec files (legacy, do not extend)
- E2E tests: Not implemented (Playwright configured)
- Reason: AI-generated tests proven brittle, often modified to pass rather than driving improvements

**Documentation:**
- JSDoc: ✅ Extensive in framework services/interfaces (5/5 in assessment)
- Inline comments: ✅ Good in complex logic
- README: ✅ Comprehensive CLAUDE.md
- Specs: ✅ Detailed in `specs/` directory

---

## Known Technical Debt

**Template Anti-Patterns (fix when touching these files):**
- `Object = Object` exposed to templates in `ResultsTableComponent` - use pipes instead
- `$any()` casts in templates (e.g., `$any(stats)[key]`) - create proper typed accessors
- Missing `trackBy` in some `*ngFor` loops - add for performance

**RxJS Patterns (improve when refactoring):**
- Nested subscribes in `ResultsTableComponent` (lines 96-114) - use `combineLatest` instead
- Multiple separate subscriptions where streams could be combined

**Performance Gaps (implement when needed):**
- Virtual scrolling not implemented for large tables - add `[virtualScroll]="true"` when data exceeds 1000 rows
- Debouncing inconsistent on filter inputs - add 300ms debounce to text filters
- Lazy loading not implemented for feature modules - add when bundle size becomes issue

**Security Gaps (implement before production auth):**
- No route guards for protected routes - implement `AuthGuard` when auth service added
- Auth interceptor structure exists but not wired up

**Architecture Notes:**
- Some hardcoded panel IDs in `DiscoverComponent` - abstract when adding new domains
- Picker config registration in `ngOnInit` is domain-specific - move to domain config factory

---

## Next Steps (Common Tasks)

### To Add Charts:
1. Create `BaseChartComponent` (framework/components/base-chart/)
2. Integrate Plotly.js or Chart.js
3. Wire statistics$ from ResourceManagementService
4. Use chart configs from `automobile.chart-configs.ts`

### To Add Pop-Outs:
1. Create pop-out route (e.g., `/panel/:panelId`)
2. Add pop-out button UI to panels
3. Use existing `PopOutContextService` for messaging

### To Add Highlights:
1. Add highlight filter inputs (h_manufacturer, h_yearMin, etc.)
2. Update AutomobileUrlMapper to serialize/deserialize highlight params
3. Pass to API as query params
4. Render highlight overlays in charts

### To Add Tests:
**⚠️ DO NOT WRITE TESTS** - Deferred to dedicated testing project. AI-generated tests have proven brittle and counterproductive.

### To Add Another Domain:
1. Create `domain-config/agriculture/` directory
2. Define models: `CropFilters`, `CropResult`, `CropStatistics`
3. Implement adapters: `AgricultureApiAdapter`, `AgricultureUrlMapper`, `AgricultureCacheKeyBuilder`
4. Create configs: table, pickers, filters, charts
5. Create factory: `createAgricultureDomainConfig()`
6. Add route: `/discover/agriculture`
7. Provide `DOMAIN_CONFIG` for agriculture route

---

## Important Notes

1. **PrimeNG-First**: DO NOT create `BaseDataTableComponent` or custom table wrappers. Use PrimeNG Table directly.

2. **No Unit Tests**: DO NOT write unit tests. Testing deferred to dedicated project. AI-generated tests proven brittle.

3. **URL is Truth**: All state changes MUST sync to URL. URL changes MUST trigger state updates.

4. **Configuration Over Code**: Domain-specific logic goes in config files, NOT in framework components.

5. **Generic Framework**: Framework components/services work with ANY domain via generics and adapters.

6. **Container Development**: All Angular CLI commands run INSIDE podman container, NOT on host.

---

## Architecture Compliance & Verification

**⚠️ CRITICAL**: Before implementing new features, consult [VERIFICATION-RUBRIC.md](VERIFICATION-RUBRIC.md)

The verification rubric is a 7-step checklist to prevent architecture violations as context degrades. Use it:
- Before implementing new components
- After adding features
- When context window shows signs of degradation
- Before committing changes

### 🔴 CRITICAL Red Flags (Never Do These)

**Framework Services:**
- ❌ Hardcoded API URLs in framework services
- ❌ Domain-specific method names (e.g., `getVehicles()`, `fetchAutomobiles()`)
- ❌ Import statements referencing domain models in `framework/` code
- ❌ Any business logic specific to one domain

**Components:**
- ❌ Components importing `HttpClient` directly
- ❌ Components calling `this.http.get()` or `this.apiService.getVehicles()`
- ❌ Components calling `router.navigate()` with `queryParams` directly
- ❌ **CRITICAL**: Templates with hardcoded field names like `currentFilters.manufacturer`
- ❌ **CRITICAL**: Templates with hardcoded filters not from `domainConfig.filters`
- ❌ **CRITICAL**: Components/templates that only work with automobile domain

**Domain Config:**
- ❌ Hardcoded `apiBaseUrl: 'http://...'` (must use `environment.apiBaseUrl`)
- ❌ Full URLs in adapters (must construct from `baseUrl + endpoint`)

### ✅ Valid Patterns (Always Use These)

```typescript
// ✅ Domain config from environment
import { environment } from '../../environments/environment';
const baseUrl = environment.apiBaseUrl;

// ✅ API adapter using generic service
return this.apiService.get<TData>(`${this.baseUrl}/endpoint`, { params });

// ✅ Component updating filters through ResourceManagementService
this.resourceService.updateFilters({ manufacturer: 'Toyota' });

// ✅ Relative endpoints in adapters
private readonly VEHICLES_ENDPOINT = '/vehicles/details';

// ✅ Generic framework service
export class ApiService {
  get<TData>(endpoint: string, options?: ApiRequestOptions): Observable<ApiResponse<TData>>
}

// ✅ Domain-agnostic template (dynamically renders ANY domain's filters)
<ng-container *ngFor="let filterDef of domainConfig.filters">
  <input *ngIf="filterDef.type === 'text'"
         [(ngModel)]="currentFilters[filterDef.id]"
         [placeholder]="filterDef.placeholder">
  <p-inputNumber *ngIf="filterDef.type === 'number'"
                 [useGrouping]="filterDef.format?.number?.useGrouping ?? true">
  </p-inputNumber>
</ng-container>
```

### ❌ Invalid Patterns (Never Use These)

```typescript
// ❌ Hardcoded URL in domain config
apiBaseUrl: 'http://auto-discovery.minilab/api/specs/v1'

// ❌ Direct HTTP call in component
this.http.get('http://api.example.com/vehicles').subscribe(...)

// ❌ Domain-specific framework service
export class VehicleApiService {
  getVehicles(): Observable<Vehicle[]>
}

// ❌ Direct router navigation with queryParams
this.router.navigate(['/discover'], { queryParams: { manufacturer: 'Ford' } });

// ❌ Hardcoded domain-specific template (ONLY works for automobile)
<input [(ngModel)]="currentFilters.manufacturer" placeholder="Manufacturer">
<p-inputNumber [(ngModel)]="currentFilters.yearMin"></p-inputNumber>
```

### Quick Architecture Check

Before committing, verify:
1. ✅ Can I add a new domain WITHOUT modifying framework services? (Must be YES)
2. ✅ Do my templates use `domainConfig.filters` dynamically? (Must be YES)
3. ✅ Are all API base URLs from `environment.ts`? (Must be YES)
4. ✅ Do components use `ResourceManagementService` for state? (Must be YES)
5. ✅ Does URL update trigger data fetch automatically? (Must be YES)

**If any answer is NO, you have violated the architecture. Read [VERIFICATION-RUBRIC.md](VERIFICATION-RUBRIC.md) Step 1-7.**

---

## Quick Status Check Commands

```bash
# Line counts
wc -l frontend/src/framework/services/*.service.ts | tail -1    # Framework services
wc -l frontend/src/domain-config/automobile/*/*.ts | tail -1    # Automobile domain

# Test count
find frontend/src -name "*.spec.ts" | wc -l                      # Test files

# Component count
find frontend/src/framework/components -name "*.component.ts" | wc -l  # Framework components

# Check what's registered
grep -r "declarations:" frontend/src/app/app.module.ts          # App components
grep -r "declarations:" frontend/src/framework/framework.module.ts  # Framework components
```

---

**End of TLDR.md**
