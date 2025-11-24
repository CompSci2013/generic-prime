# TLDR-NEXT-STEP.md - Implementation Roadmap

**Last Updated:** 2025-11-23
**Purpose:** Machine-readable guide for implementing next features

---

## 🔥 Latest Session Summary (2025-11-23 - Backend Deployment Setup)

**What Just Happened:**
- ✅ **Created self-contained generic-prime project structure**
- ✅ **Copied backend-specs from auto-discovery** → `~/projects/generic-prime/backend-specs/`
- ✅ **Created complete K8s deployment configs** (namespace, backend, frontend, ingress)
- ✅ **Documented build/deployment process** in `docs/DEVELOPER-ENVIRONMENT.md` (880 lines)
- ✅ **Created quick reference guide** in `docs/BACKEND-API-UPDATES.md`
- 🔍 **Discovered backend API issue**: `bodyClass` parameter doesn't support comma-separated values

**Key Architecture Changes:**
- **Namespace**: `generic-prime` (not `auto-discovery`)
- **Services**: `generic-prime-backend`, `generic-prime-frontend`
- **Images**: `localhost/generic-prime-backend:v1.0.X`, `localhost/generic-prime-frontend:prod`
- **Ingress**: `generic-prime.minilab`

**Files Created:**
1. `docs/DEVELOPER-ENVIRONMENT.md` - Complete build/deploy guide (v2.0)
2. `docs/BACKEND-API-UPDATES.md` - Quick reference for backend updates
3. `k8s/namespace.yaml` - Generic-prime namespace
4. `k8s/backend-deployment.yaml` - Backend deployment manifest
5. `k8s/backend-service.yaml` - Backend service
6. `k8s/frontend-deployment.yaml` - Frontend deployment manifest
7. `k8s/frontend-service.yaml` - Frontend service
8. `k8s/ingress.yaml` - Traefik ingress routing

**Files Copied:**
1. `backend-specs/` - Complete backend API source code
2. `frontend/Dockerfile.dev` - Development container config
3. `frontend/Dockerfile.prod` - Production build config

**Backend API Analysis:**
- ✅ `manufacturer` filter: Supports comma-separated values (lines 226-248)
- ✅ `model` filter: Supports comma-separated values (lines 250-272)
- ❌ `bodyClass` filter: Does NOT support comma-separated values (lines 290-296)
- ✅ Highlight parameters (`h_*`): All support comma-separated values correctly

**Test Results:**
```bash
# Single value works
curl "http://auto-discovery.minilab/api/specs/v1/vehicles/details?bodyClass=Sedan" → 2615 results ✅

# Comma-separated fails
curl "http://auto-discovery.minilab/api/specs/v1/vehicles/details?bodyClass=Sedan,SUV" → 0 results ❌
```

**Next Recommended Task**: Fix bodyClass parameter and deploy to generic-prime namespace (see PRIORITY 0 below)

---

## 🎯 PRIORITY 0 - Backend API Fix & Deployment (RECOMMENDED)

**Estimated Time:** 1-2 hours
**Impact:** HIGH - Enables multi-select body class filters in Query Control

### Task Breakdown

**1. Fix bodyClass Parameter** (15 minutes)
```bash
cd ~/projects/generic-prime/backend-specs/src/services
nano elasticsearchService.js
```

Replace lines 290-296 with comma-separated logic (pattern from manufacturer/model filters):

```javascript
if (filters.bodyClass) {
  // Handle comma-separated body classes (OR logic)
  const bodyClasses = filters.bodyClass.split(',').map(b => b.trim()).filter(b => b);

  if (bodyClasses.length === 1) {
    // Single body class: exact match using term query
    query.bool.filter.push({
      term: {
        'body_class': bodyClasses[0]
      }
    });
  } else if (bodyClasses.length > 1) {
    // Multiple body classes: OR logic with exact matching
    query.bool.filter.push({
      bool: {
        should: bodyClasses.map(bc => ({
          term: { 'body_class': bc }
        })),
        minimum_should_match: 1,
      },
    });
  }
}
```

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

```bash
# Test health
curl http://generic-prime.minilab/api/health

# Test single bodyClass
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan&size=1" | jq '.total'

# Test comma-separated bodyClass (should now work!)
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan,SUV&size=1" | jq '.total'

# Test manufacturer (already working)
curl "http://generic-prime.minilab/api/vehicles/details?manufacturer=Ford,Chevrolet&size=1" | jq '.total'
```

**Expected Results:**
- Health check: `{"status":"ok",...}`
- Single bodyClass: 2615 (Sedan count)
- Multiple bodyClass: 3613 (Sedan + SUV combined)
- Multiple manufacturer: 1514 (Ford + Chevrolet combined)

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

### Backend API Comma-Separated Filter Support

**Status:**
- ✅ `manufacturer` - Supports comma-separated (lines 226-248)
- ✅ `model` - Supports comma-separated (lines 250-272)
- ❌ `bodyClass` - Does NOT support comma-separated (lines 290-296)
- ✅ All highlight parameters (`h_*`) - Support comma-separated

**Impact:**
- Query Control Body Class multiselect won't work correctly until backend updated
- Workaround: Users can only select one body class at a time

---

## Version History

| Version | Date | Components | Backend | Changes |
|---------|------|------------|---------|---------|
| v0.1.0 | 2025-11-20 | BasePickerComponent, ResultsTableComponent | N/A | Initial framework components |
| v0.2.0 | 2025-11-23 | + BaseChartComponent, StatisticsPanelComponent | N/A | Charts & highlighting complete |
| v0.3.0 | 2025-11-23 | + QueryControlComponent highlights | N/A | Separate highlights section |
| v1.0.0 | 2025-11-23 | Same | v1.0.0 | Backend infrastructure ready, deployment pending |
| v1.0.1 | TBD | Same | v1.0.1 | Backend bodyClass fix + deployment to generic-prime namespace |

---

**Last Session:** 2025-11-23 - Backend deployment infrastructure setup
**Next Session:** Fix bodyClass parameter and deploy to Kubernetes
**Documentation:** See `docs/DEVELOPER-ENVIRONMENT.md` for complete deployment guide
