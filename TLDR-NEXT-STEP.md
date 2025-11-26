# TLDR-NEXT-STEP.md - Implementation Roadmap

**Last Updated:** 2025-11-26
**Purpose:** Machine-readable guide for implementing next features

---

## Quality Context (2025-11-26)

**Current Grade: B+ (84/100)** - See [GENERIC-PRIME-ASSESSMENT.md](GENERIC-PRIME-ASSESSMENT.md)

**⚠️ UNIT TESTING POLICY:** Do NOT write unit tests. Testing deferred to dedicated project. AI-generated tests proven brittle. Testing weight in rubric: 1%.

**When implementing new features, maintain these standards:**
- Architecture & Design: 22/25 - Keep config-driven, URL-first patterns
- Angular Best Practices: 22/25 - Use OnPush, proper RxJS, lifecycle cleanup
- Code Quality: 21/25 - Add JSDoc, avoid `any` types where possible

**Technical Debt to Address Opportunistically:**
- Replace `$any()` template casts with typed accessors
- Add `trackBy` to `*ngFor` loops
- Use `combineLatest` instead of nested subscribes
- Add debouncing to text filter inputs

---

## 🐳 Development Container Quick Reference

**⚠️ ALL npm/ng commands run INSIDE the container, NOT on host.**

```bash
# Start container + dev server
cd ~/projects/generic-prime/frontend
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Run any command inside container
podman exec -it generic-prime-frontend-dev <command>
podman exec -it generic-prime-frontend-dev npm install
podman exec -it generic-prime-frontend-dev ng generate component features/foo
podman exec -it generic-prime-frontend-dev sh  # Interactive shell
```

**Full commands:** See [TLDR.md](TLDR.md) "Development Container Commands" section

---

## 🔥 Latest Session Summary (2025-11-24 - Backend Testing Completed ✅)

**What Just Happened:**
- ✅ **BACKEND DEPLOYED**: generic-prime backend running in K8s (2 replicas)
- ✅ **COMMA-SEPARATED FILTERS VERIFIED**: All filter parameters working correctly with OR logic
- ✅ **COMPREHENSIVE TESTING**: Tested bodyClass, manufacturer, model, and highlight filters
- ✅ **BUG #10 DOCUMENTED**: Pop-out statistics panel issue with pre-selected filters
- ✅ **TLDR FILES UPDATED**: Reflect successful testing and current deployment status

**Testing Results:**

All comma-separated filter parameters now work correctly:

| Parameter | Single Value | Comma-Separated | Status |
|-----------|--------------|-----------------|--------|
| **bodyClass** | ✅ 2,615 (Sedan) | ✅ 3,903 (Sedan,SUV,Pickup) | **FULLY SUPPORTED** |
| **manufacturer** | ✅ 665 (Ford) | ✅ 1,514 (Ford,Chevrolet,Toyota) | **FULLY SUPPORTED** |
| **model** | ✅ 51 (F-150) | ✅ 140 (F-150,Mustang,Silverado) | **FULLY SUPPORTED** |
| **h_bodyClass** | ✅ Works | ✅ Works (segmented stats) | **FULLY SUPPORTED** |
| **h_manufacturer** | ✅ Works | ✅ Works (segmented stats) | **FULLY SUPPORTED** |

**Math Verification**:
- bodyClass: 2,615 + 998 + 290 = 3,903 ✅
- manufacturer: 665 + 849 + 0 = 1,514 ✅
- model: 51 + 62 + 27 = 140 ✅

**Deployment Status:**
- **Backend**: ✅ Deployed in `generic-prime` namespace, 2 replicas running
- **Frontend**: ✅ Dev server at `http://192.168.0.244:4205/discover`
- **API Endpoint**: `http://generic-prime.minilab/api/specs/v1/...` (via port-forward)
- **Ingress**: `generic-prime.minilab` configured

**Files Updated:**
1. `TLDR.md` - Added backend testing results section
2. `TLDR-NEXT-STEP.md` - Updated to reflect completed testing
3. `KNOWN-BUGS.md` - Added Bug #10 (pop-out statistics panel issue)

⚠️ **CRITICAL**: This is the **generic-prime** project. Always test using:
- **Frontend Dev Server**: `http://192.168.0.244:4205/discover` (currently running)
- **Generic-Prime Backend**: Port-forward to test: `kubectl port-forward -n generic-prime svc/generic-prime-backend 3000:3000`
- **DO NOT TEST**: `auto-discovery.minilab` (different project - not relevant)

**Testing Procedure:**
1. **Frontend**: `http://192.168.0.244:4205/discover?bodyClass=Sedan,SUV,Pickup`
2. **Backend**: `kubectl port-forward -n generic-prime svc/generic-prime-backend 3000:3000` then `curl http://localhost:3000/api/specs/v1/vehicles/details?bodyClass=Sedan,SUV`
3. **Never use auto-discovery endpoints** - wrong project

**Next Recommended Tasks**:
1. Investigate Bug #10 (pop-out statistics panel with pre-selected filters)
2. Test Bug #7 fix (picker checkbox visual state)
3. VIN Browser Panel implementation (high value feature)

---

## 🎯 PRIORITY 0 - Investigate Bug #10: Pop-Out Statistics Panel (RECOMMENDED)

**Estimated Time:** 1-2 hours
**Impact:** MEDIUM - Fixes pop-out functionality with pre-selected filters
**Status**: 🔴 NOT FIXED (documented in KNOWN-BUGS.md)

**Bug Description:**
When main window has pre-selected bodyClass filters (e.g., `bodyClass=SUV,Coupe,Pickup,Van,Hatchback`) and user pops out Statistics panel, charts show broken/incorrect data.

**Investigation Steps:**
1. Check if pop-out URL includes bodyClass parameter on initialization
2. Verify PanelPopoutComponent passes filter state to StatisticsPanelComponent
3. Check ResourceManagementService initialization in pop-out context
4. Verify statistics API call includes bodyClass parameter
5. Check browser console for errors in pop-out window

**Files to Investigate:**
- [panel-popout.component.ts](frontend/src/app/features/panel-popout/panel-popout.component.ts)
- [statistics-panel.component.ts](frontend/src/framework/components/statistics-panel/statistics-panel.component.ts)
- [resource-management.service.ts](frontend/src/framework/services/resource-management.service.ts)

---

## ✅ COMPLETED: Deploy Generic-Prime to Kubernetes (2025-11-24)

**Status:** ✅ COMPLETED
**Testing:** ✅ VERIFIED - All comma-separated filters working

Backend deployed and tested successfully. All filter parameters support comma-separated values with OR logic.

### Task Breakdown

**1. Verify Backend Code** (5 minutes)

Check if bodyClass comma-separated logic is already in place:
```bash
cd ~/projects/generic-prime/backend-specs/src/services
grep -A 20 "if (filters.bodyClass)" elasticsearchService.js
```

If needed, ensure it has comma-separated support like manufacturer/model filters.

**2. Build and Deploy Backend** (30-45 minutes)

Follow `docs/DEVELOPER-ENVIRONMENT.md` Phase 1 & 2:

```bash
# Create namespace
cd ~/projects/generic-prime/k8s
kubectl apply -f namespace.yaml

# Build backend
cd ~/projects/generic-prime/backend-specs
podman build -t localhost/generic-prime-backend:v1.0.1 .

# Export and import to K3s
podman save localhost/generic-prime-backend:v1.0.1 -o generic-prime-backend-v1.0.1.tar
sudo k3s ctr images import generic-prime-backend-v1.0.1.tar

# Deploy backend
cd ~/projects/generic-prime/k8s
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f ingress.yaml

# Watch rollout
kubectl rollout status deployment/generic-prime-backend -n generic-prime

# Clean up
cd ~/projects/generic-prime/backend-specs
rm generic-prime-backend-v1.0.1.tar
```

**3. Test Backend API** (10 minutes)

⚠️ **CRITICAL**: Test against **generic-prime.minilab**, NOT auto-discovery.minilab

```bash
# Test health endpoint
curl http://generic-prime.minilab/api/health

# Test single bodyClass
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan&size=1" | jq '.total'

# Test comma-separated bodyClass
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan,SUV&size=1" | jq '.total'

# Test comma-separated manufacturer
curl "http://generic-prime.minilab/api/vehicles/details?manufacturer=Ford,Chevrolet&size=1" | jq '.total'

# Test comma-separated model
curl "http://generic-prime.minilab/api/vehicles/details?model=F-150,Mustang&size=1" | jq '.total'
```

**Expected Results:**
- Health check: `{"status":"ok",...}`
- All comma-separated filters should return combined counts
- If any return 0, check backend code for comma-separated support

**4. Deploy Frontend** (20-30 minutes)

Follow `docs/DEVELOPER-ENVIRONMENT.md` Phase 3:

```bash
cd ~/projects/generic-prime/frontend

# Build production image
podman build -f Dockerfile.prod -t localhost/generic-prime-frontend:prod .

# Export and import
podman save localhost/generic-prime-frontend:prod -o generic-prime-frontend-prod.tar
sudo k3s ctr images import generic-prime-frontend-prod.tar

# Deploy frontend
cd ~/projects/generic-prime/k8s
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Watch rollout
kubectl rollout status deployment/generic-prime-frontend -n generic-prime

# Clean up
cd ~/projects/generic-prime/frontend
rm generic-prime-frontend-prod.tar
```

**5. Test Complete Application** (10 minutes)

```bash
# Check all pods
kubectl get pods -n generic-prime

# Test in browser
firefox http://generic-prime.minilab
```

**Expected:**
- 2 backend pods running
- 2 frontend pods running
- Browser: Generic Discovery Framework loads
- Query Control: Body Class multiselect works with comma-separated values

**Deliverables:**
- ✅ Backend API supports comma-separated filters for all fields
- ✅ generic-prime namespace deployed to K3s
- ✅ Frontend and backend running in production
- ✅ Full application accessible at http://generic-prime.minilab

---

## Alternative Tasks (If Not Doing PRIORITY 0)

### Option 1: Fix Active Pop-Out Bugs (1-2 hours)

**Bug #6**: Popped-out picker shows zero rows after pagination change
- Location: `frontend/src/framework/components/base-picker/base-picker.component.ts`
- Fix: Add `this.cdr.detectChanges()` in pagination handler (line ~220)
- Pattern: Same as Bug #5 fix (use detectChanges() not markForCheck())

**Bug #7**: Checkboxes remain visually checked after clearing selections
- Location: `frontend/src/framework/components/base-picker/base-picker.component.ts`
- Issue: PrimeNG Table selection state not syncing with empty array
- Fix: Force table re-render or reset selection object

### Option 2: VIN Browser Panel (3-4 days, HIGH value)

**Purpose:** Drill-down from vehicle specifications to individual VIN instances

**Key Features:**
- Click on row in results table → Opens VIN browser for that vehicle
- Shows all individual VINs for selected vehicle specification
- Displays VIN-specific data: condition, mileage, value, location, etc.
- Uses `/api/vins/v1/vehicles/:vehicleId/instances` endpoint
- Supports pagination, sorting, filtering of VIN instances
- Pop-out capable (like other panels)

**Implementation:**
1. Create `VinBrowserComponent` (3-4 hours)
2. Add VIN models and interfaces (1 hour)
3. Create VIN API adapter (2 hours)
4. Add row click handler in ResultsTableComponent (1 hour)
5. Integrate with pop-out system (2 hours)
6. Testing and refinement (4-6 hours)

### Option 3: Row Expansion Details (1-2 days)

Implement detailed view when clicking expand button on results table row.

### Option 4: Column Management (1 day)

Add column visibility toggle using PrimeNG MultiSelect.

### Option 5: Export Functionality (1-2 days)

Add CSV/JSON export for filtered results.

---

## Current State (What's Done)

### ✅ Framework Components Implemented (5/7 Panels)

1. **BasePickerComponent** - Configuration-driven multi-select table
   - Server/client pagination support
   - Search and sorting
   - URL synchronization
   - Template: 157 lines of PrimeNG markup
   - **Known Issues**: Bug #6 (pagination) and Bug #7 (checkbox visual state) in pop-out mode

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
   - Separate highlights section (v0.3.0)
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

### ✅ Pop-Out Window System Complete (with learnings)

**Architecture:**
- BroadcastChannel for cross-window messaging
- URL-First in pop-outs (each window has independent URL)
- MOVE semantics (panel disappears from main, appears in pop-out)
- Close detection via polling + visibility API

**Critical Pattern Discovered (2025-11-23):**
```typescript
// ❌ WRONG for pop-out windows (unfocused browser windows)
this.cdr.markForCheck();  // Only schedules change detection, doesn't run if window unfocused

// ✅ CORRECT for pop-out windows
this.cdr.detectChanges();  // Forces immediate update, works even in unfocused windows
```

**Bugs Fixed:**
- ✅ Bug #1: Pop-out Query Control Clear button URL update
- ✅ Bug #4: Query Control modelCombos chips display
- ✅ Bug #5: Pop-out picker unfocused window updates (CRITICAL detectChanges() discovery)

**Active Bugs:**
- ❌ Bug #6: Popped-out picker shows zero rows after pagination change
- ❌ Bug #7: Checkboxes remain visually checked after clearing selections

### ✅ Backend Deployment Infrastructure Ready

**Documentation:**
- `docs/DEVELOPER-ENVIRONMENT.md` (v2.0) - Complete build/deploy guide (880 lines)
- `docs/BACKEND-API-UPDATES.md` - Quick reference for backend updates

**Kubernetes Configs:**
- `k8s/namespace.yaml` - generic-prime namespace
- `k8s/backend-deployment.yaml` - Backend deployment (2 replicas)
- `k8s/backend-service.yaml` - Backend ClusterIP service
- `k8s/frontend-deployment.yaml` - Frontend deployment (2 replicas)
- `k8s/frontend-service.yaml` - Frontend ClusterIP service
- `k8s/ingress.yaml` - Traefik ingress (generic-prime.minilab)

**Backend Source:**
- `backend-specs/` - Complete API source code (copied from auto-discovery)
- Ready to build: `localhost/generic-prime-backend:v1.0.1`

**Frontend Dockerfiles:**
- `frontend/Dockerfile.dev` - Development container
- `frontend/Dockerfile.prod` - Production build

**Status:** All infrastructure ready, needs deployment (see PRIORITY 0)

---

## Known Issues & Learnings

### OnPush Change Detection in Pop-Out Windows

**Critical Discovery (2025-11-23):**

Unfocused browser windows with OnPush change detection don't run scheduled change detection:

```typescript
// This doesn't work in unfocused pop-out windows
this.cdr.markForCheck();  // Only schedules, never runs

// This works correctly
this.cdr.detectChanges();  // Forces immediate update
```

**Why This Matters:**
- Pop-out windows are often unfocused (user looking at main window)
- OnPush components in unfocused windows won't update with markForCheck()
- Must use detectChanges() for any state changes triggered by BroadcastChannel

**Where Applied:**
1. `base-picker.component.ts:147` - URL state hydration
2. `base-picker.component.ts:175` - URL parameter changes
3. `base-picker.component.ts:204` - Selection hydration

### Backend Testing - Critical Lesson (2025-11-24)

**ALWAYS TEST GENERIC-PRIME ENDPOINTS, NOT AUTO-DISCOVERY**

**Correct Test Endpoints:**
- ✅ Frontend: `http://192.168.0.244:4205/discover`
- ✅ Backend (when deployed): `http://generic-prime.minilab/api/...`
- ❌ WRONG: `http://auto-discovery.minilab/api/...` (different project)

**Verified Status:**
- ✅ Frontend comma-separated filters work: `?bodyClass=SUV,Coupe,Pickup`
- ✅ Backend deployed and tested: All comma-separated filters working
- ✅ Backend source code in `backend-specs/`

### Code Quality Patterns (from Assessment 2025-11-26)

**Patterns to Follow (scored well):**
- OnPush change detection on ALL components (5/5)
- `takeUntil(destroy$)` for subscription cleanup (5/5)
- JSDoc on public APIs with `@example` blocks (5/5)
- Configuration-driven UI via `domainConfig.filters` (5/5)

**Patterns to Improve (technical debt):**
- Avoid `$any()` in templates - create typed component methods instead
- Avoid `Object = Object` exposure - use pipes or component methods
- Add `trackBy` functions to all `*ngFor` loops
- Use `combineLatest` instead of multiple separate subscriptions
- Add 300ms debounce to text filter inputs

**Files with Known Debt:**
- `results-table.component.ts:96-114` - nested subscribes
- `results-table.component.html` - `Object` exposure, missing trackBy
- `statistics-panel.component.html` - `$any()` casts

---

## Version History

| Version | Date | Components | Backend | Changes |
|---------|------|------------|---------|---------|
| v0.1.0 | 2025-11-20 | BasePickerComponent, ResultsTableComponent | N/A | Initial framework components |
| v0.2.0 | 2025-11-23 | + BaseChartComponent, StatisticsPanelComponent | N/A | Charts & highlighting complete |
| v0.3.0 | 2025-11-23 | + QueryControlComponent highlights | N/A | Separate highlights section |
| v1.0.0 | 2025-11-23 | Same | v1.0.0 | Backend infrastructure ready |
| v1.0.1 | 2025-11-24 | Same | v1.0.1 | Backend deployed, all filters verified working |
| v1.0.2 | 2025-11-26 | Same | v1.0.1 | Quality assessment completed (B+, 84/100) |

---

**Last Session:** 2025-11-26 - Quality assessment completed
**Assessment Grade:** B+ (84/100) - Production-ready
**Next Priorities:**
1. Investigate Bug #10 (pop-out statistics panel)
2. Address technical debt opportunistically
3. VIN Browser Panel (high value feature)

**Documentation:**
- [GENERIC-PRIME-ASSESSMENT.md](GENERIC-PRIME-ASSESSMENT.md) - Full assessment
- [ASSESSMENT-RUBRIC.md](ASSESSMENT-RUBRIC.md) - Scoring criteria
- `docs/DEVELOPER-ENVIRONMENT.md` - Deployment guide
