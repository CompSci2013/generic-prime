# Next Steps

**Current Session**: Session 27 - Repository Cleanup Complete

---

## SESSION 27 COMPLETED: Repository Cleanup & Generated Files Management

**Status**: ✅ Completed. Added `frontend/documents/` to `.gitignore` and removed all 187 generated files from git tracking. Repository is now cleaner with no generated documentation bloat.

### What Was Done
- ✅ Added `frontend/documents/` to `.gitignore`
- ✅ Removed 187 generated Compodoc files from git tracking (~221 KB)
- ✅ Committed changes with descriptive messages
- ✅ Repository now tracks source code only, not generated artifacts

---

## SESSION 28 PLAN: Test Live Reload Development Environment

**Status**: Production deployment stable. Documentation baseline established. Ready for continued development.

### Immediate Next Action: Choose Path Forward

**Test Live Reload Development Environment**

1. **Start Angular Dev Server**
   ```bash
   podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205
   ```
   Expected: Angular CLI dev server starts on port 4205 with live reload enabled

2. **Access Development Frontend**
   - Open: http://192.168.0.244:4205 from Windows 11 browser
   - Expected: Angular application loads (same as production, but with dev server)
   - Backend: Same API at http://generic-prime.minilab/api/specs/v1/

3. **Test Live Reload Workflow**
   - Edit: `src/app/app.component.ts` (any change)
   - Save: File (Ctrl+S)
   - Watch: Browser auto-reloads with your changes
   - Test: API calls still work through Loki

4. **Compare Both Environments**
   - **Production**: http://generic-prime.minilab/ (Kubernetes, Nginx)
   - **Development**: http://192.168.0.244:4205 (Dev container, CLI)
   - **Both**: Share same backend API

### Session 23: Production Deployment (✅ COMPLETE)

**Deployment Status**: All objectives completed successfully

### Windows 11 Hosts File Status - VERIFIED CORRECT ✅

Current entries:
```
192.168.0.244   minilab, minipc, registry.minilab, angular.minilab, traefik.minilab,
                ockview-wrapper.minilab, dockview-wrapper.minilab.local, satellites.minilab,
                kibana.minilab, thor
192.168.0.110   loki, whoami.minilab, gitLab.minilab, ollama.minilab, chat.minilab,
                dockview.minilab, rag.minilab, qdrant.minilab, rag-ui.minilab,
                api.satellites.minilab, api.transportation.minilab, transportation.minilab,
                autos.minilab, autos2.minilab, auto-discovery.minilab,
                generic-prime.minilab, generic-prime-dockview.minilab
```

**Verification**: ✅ CORRECT - `generic-prime.minilab` correctly points to 192.168.0.110 (Loki control plane)
- Loki runs Traefik ingress controller
- All ingress requests must route through Loki
- Backend pods may run on either Thor or Loki
- Kubernetes service routing handles transparency

### Session 23 Objectives

1. **Build Production Frontend Docker Image**
   - Command: `podman build -f frontend/Dockerfile.prod -t localhost/generic-prime-frontend:prod .`
   - Verify image builds successfully
   - Check nginx.conf is present and correct
   - Check artifact path is correct (`dist/frontend`)

2. **Import Image into K3s**
   - Save image: `podman save localhost/generic-prime-frontend:prod -o /tmp/frontend-prod.tar`
   - Import into K3s: `sudo k3s ctr images import /tmp/frontend-prod.tar`
   - Verify image is available: `kubectl get images -n generic-prime`

3. **Deploy Frontend to Kubernetes (Production)**
   - Apply K8s manifests: `kubectl apply -f k8s/`
   - Verify pods running: `kubectl get pods -n generic-prime`
   - Verify ingress routing: `kubectl get ingress -n generic-prime`
   - Check pod logs for errors: `kubectl logs -n generic-prime deployment/generic-prime-frontend`

4. **Launch Development Container**
   - Start dev container: `podman start generic-prime-frontend-dev` or create if not exists
   - Start Angular dev server: `podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205`
   - Verify it's accessible on port 4205

5. **Browser Testing from Windows 11 PC**
   - **Development**: `http://192.168.0.244:4205` → Angular dev server with live reload
   - **Production**: `http://generic-prime.minilab/` → Nginx-served production build from Kubernetes
   - Verify both are different and working
   - Test API calls from both environments (both should use `generic-prime.minilab/api/...`)

6. **Verify Kubernetes Configuration**
   - Confirm Traefik is routing correctly
   - Check ingress rules: `kubectl get ingress -n generic-prime -o yaml`
   - Test backend API: `curl http://generic-prime.minilab/api/specs/v1/vehicles/details?manufacturer=Brammo&size=1`
   - Verify both dev and prod use same API endpoint

### Success Criteria

- ✅ Production Docker image builds successfully
- ✅ Image imported into K3s registry
- ✅ Frontend pods running in Kubernetes
- ✅ Ingress routing configured correctly
- ✅ Development container running on port 4205
- ✅ Development URL accessible: http://192.168.0.244:4205
- ✅ Production URL accessible: http://generic-prime.minilab/
- ✅ Both environments can call backend API via generic-prime.minilab
- ✅ Kubernetes architecture verified (Loki control plane, Thor worker)

---

## DEFERRED: Fix Module Re-export Anti-pattern (Session 19 Carryover)

1. **Remove re-exports from FrameworkModule** (5 min)
   - File: `frontend/src/framework/framework.module.ts`
   - Action: Delete lines 50-52 (CommonModule, FormsModule, PrimengModule exports)
   - Impact: Modules must now explicitly import what they need

2. **Create automated validation script** (10 min)
   - File: Create `scripts/check-module-reexports.js`
   - Source: Copy from `docs/claude/MODULE-ARCHITECTURE-AUDIT.md` Section "Method 4"
   - Benefit: Prevents regression in future modules

3. **Add npm scripts** (5 min)
   - File: `frontend/package.json`
   - Add: `check:modules` and `check:modules:strict` scripts

4. **Verify fix** (10 min)
   - Run: `npm run check:modules` (expect ✅ 0 violations)
   - Build: `ng build --configuration development`
   - Test: `npm run test:e2e` (expect 33/33 passing)

**Documentation**:
- Quick guide: `QUICK-START-MODULE-FIX.md` (30 minutes, step-by-step)
- Detailed: `SUGGESTED-ITEMS-CHECKLIST.md` (14 items with effort estimates)
- Full audit: `docs/claude/MODULE-ARCHITECTURE-AUDIT.md` (800+ lines)
- Reference: `MODULE-AUDIT-BULLET-SUMMARY.txt` (quick bullets)

---

## After Module Fix: Create Knowledge Graphs for Other Physics Topics

**Priority**: HIGH (Extends Physics domain educational value)

**What to Do**:

Implement knowledge graphs for the remaining Physics course tiles following the Classical Mechanics pattern:

1. **Electromagnetism Knowledge Graph**
   - Create: `electromagnetism-graph.ts` (15-20 topics)
   - Create: `ElectromagnetismGraphComponent` wrapper
   - Add route: `/physics/electromagnetism-graph`
   - Topics to include:
     - Foundational: Electric Fields, Magnetic Fields, Vector Calculus
     - Intermediate: Maxwell's Equations, Wave Propagation, Electromagnetic Potentials
     - Advanced: Radiation, Relativity & EM, Quantum Effects in EM
   - Map concept-graph node click (e.g., 'electromagnetism' node) to new route

2. **Thermodynamics Knowledge Graph**
   - Create: `thermodynamics-graph.ts` (15-20 topics)
   - Create: `ThermodynamicsGraphComponent` wrapper
   - Add route: `/physics/thermodynamics-graph`
   - Topics to include:
     - Foundational: Temperature, Energy, Entropy Basics
     - Intermediate: First & Second Laws, Phase Transitions, Statistical Basis
     - Advanced: Non-equilibrium, Fluctuations, Applications

3. **Quantum Mechanics Knowledge Graph**
   - Create: `quantum-mechanics-graph.ts` (15-20 topics)
   - Create: `QuantumMechanicsGraphComponent` wrapper
   - Add route: `/physics/quantum-mechanics-graph`
   - Topics to include:
     - Foundational: Wave Functions, Schrödinger Equation, Uncertainty
     - Intermediate: Perturbation Theory, Spin, Angular Momentum
     - Advanced: Quantum Field Theory, Dirac Equation, Applications

**Implementation Steps** (for each subject):
1. Define 15-20 topic nodes with appropriate levels and colors
2. Map 20-30 edges showing prerequisites and relationships
3. Create wrapper component using generic KnowledgeGraphComponent
4. Add route to app-routing.module.ts
5. Add component declaration to app.module.ts
6. Update physics-concept-graph.component.ts navigateToNodeGraph() to map node clicks
7. Build and test visualization

**Testing Checklist**:
- [ ] Navigate from concept-graph node → knowledge graph displays
- [ ] Zoom/pan controls work smoothly
- [ ] Click nodes → info panel shows correctly
- [ ] Hover edges → tooltips appear
- [ ] Fit-to-View button resets visualization
- [ ] Back button returns to physics page

---

## After Knowledge Graphs: Continue Pop-Out Manual Testing

**Priority**: HIGH (Validates architecture stability)

**What to Do**:

Follow the 10 test scenarios in [POPOUT-ARCHITECTURE.md](../../docs/POPOUT-ARCHITECTURE.md):
1. **Test 1**: Open pop-out window on Model Picker
2. **Test 2**: Verify state sync from main window to pop-out
3. **Test 3**: Verify state sync from pop-out to main window
4. **Test 4**: Verify multiple pop-outs work independently
5. **Test 5**: Verify filter operations propagate correctly
6. **Test 6**: Verify pop-out window closes cleanly
7. **Test 7**: Verify page refresh closes all pop-outs
8. **Test 8**: Multi-monitor scenario (if available)
9. **Test 9**: Network latency simulation with DevTools throttling
10. **Test 10**: Console validation - verify message flow

**Testing Environment**:
- URL: `http://192.168.0.244:4205/automobiles/discover` (or localhost:4205)
- Backend API: `generic-prime.minilab` (or configured endpoint)
- Browser: Chrome/Chromium with DevTools
- Need at least 2 windows for testing

**Expected Output**:
- ✅ Pop-outs open, display correctly, close without errors
- ✅ State synchronization works in both directions
- ✅ Multiple pop-outs can operate simultaneously
- ✅ Console shows proper message flow with no errors
- ✅ No memory leaks or event listener cleanup issues
- Document any issues found for follow-up debugging

---

## After Pop-Out Testing: Fix Known Bugs

**Priority**: MEDIUM (User Experience)

### Bug #13: PrimeNG Dropdown Keyboard Navigation
**Component**: p-dropdown with `[filter]="true"` in Query Control (Manufacturer filter)
**Issue**: Keyboard navigation broken - arrow keys don't highlight, Enter/Space don't select
**Workaround**: Mouse click works fine
**Fix Steps**:
1. Inspect component in browser DevTools for missing tabindex/accessibility attributes
2. Test if issue is PrimeNG bug or configuration conflict
3. Check if `[editable]="true"` + `[filter]="true"` combination causes issue
4. Implement onKeyDown event handler as workaround if needed
5. Verify with other filters (Body Class, etc.)

### Bug #7: Multiselect Visual State
**Component**: p-multiSelect (Body Class filter)
**Issue**: Checkboxes remain checked visually after clearing filters (filtering works correctly)
**Impact**: Visual inconsistency - misleads users about active filters
**Fix Steps**:
1. Inspect p-multiSelect state after filter clear
2. Manually update visual state after API response
3. Force change detection or component refresh
4. Test with various filter combinations

---

## Priority Order (Updated)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **0** | **Session 17 Complete**: Dependency graph visualization (145+ nodes, 300+ edges) | **DONE** | **✅ COMPLETE** |
| **0.5** | **Session 18 Complete**: Modal visibility fix + drag handle + source documentation | **DONE** | **✅ COMPLETE** |
| **1** | **Create Knowledge Graphs for Physics Topics** (Electromagnetism, Thermodynamics, Quantum Mechanics) | **HIGH** | Pending |
| **2** | **Perform pop-out manual testing (10 tests)** | **HIGH** | Pending |
| **3** | **Fix Bug #13 (dropdown keyboard nav)** | **MEDIUM** | Pending |
| 4 | Fix Bug #7 (multiselect visual state) | Medium | Pending |
| 5 | Document source code fully (framework services, components) | High | Pending |
| 6 | Plan agriculture domain implementation | Low | Pending |
| 7 | Plan chemistry domain implementation | Low | Pending |
| 8 | Plan mathematics domain implementation | Low | Pending |

---

## Known PrimeNG Bug (Deferred): Fix Dropdown Keyboard Navigation (Bug #13)

**Priority**: Medium (User Experience - Filter Usability)

**Bug Details**:
- Component: `p-dropdown` in Query Control panel (Manufacturer filter)
- Issue: Keyboard navigation broken with `[filter]="true"` attribute
- Expected: Arrow keys highlight options, Enter/Space selects
- Actual: Keyboard keys do nothing, mouse click is only workaround

**What to Do**:

1. **Investigate Root Cause**
   - Located in: `frontend/src/domain-config/automobile/configs/filter-definitions.ts`
   - PrimeNG version: 14.2.3
   - Check if issue is PrimeNG bug or configuration conflict
   - Test with filter disabled to isolate the cause

2. **Attempt Fixes** (in order of complexity):
   - Verify `[showToggleAll]="true"` doesn't interfere with keyboard handling
   - Check if `[editable]="true"` and `[filter]="true"` together cause issue
   - Inspect DOM for missing `tabindex` or accessibility attributes
   - Test with `onKeyDown` event handler as workaround if needed

3. **Verify PrimeNG Version**
   - Current: 14.2.3
   - Check if newer version (14.3+) or patch fixes this
   - Document version constraint if upgrade needed

4. **Testing**
   - Verify arrow keys highlight options in dropdown
   - Verify Enter key selects highlighted option
   - Verify Space key selects highlighted option
   - Ensure mouse interaction still works
   - Test with other filters (Body Class, etc.)

---

## Deferred Work: Live Report Updates (Architectural Issue)

**Status**: Investigation Complete - Deferred (Low Priority)

**Why Deferred**:
- Root cause: Angular dev-server cannot inject cache-control headers for static assets
- Client-side cache-busting (iframe + timestamp) insufficient due to browser caching layers
- **Solution requires architectural change**: Separate Node.js/Express server
- Not worth time investment when tests generate fresh data on each run

**Future Options** (if prioritized):
- **Option A** (Recommended): Lightweight Node.js/Express server on port 4206 serving `playwright-report/`
- **Option B** (Complex): WebSocket-based report watcher with real-time updates
- **Option C** (Production Grade): Third-party service integration (Currents.dev, Testomat.io)

**Code Status**:
- `proxy.conf.js` implemented and left in place for reference
- `ReportComponent` updated with iframe + timestamp cache-busting
- Both approaches documented in `PROJECT-STATUS.md` Session 12

See `docs/claude/PROJECT-STATUS.md` for complete technical analysis and architectural solutions.

---

## Completed Work

**Session 12: Live Report Updates Research**
- ✅ Deep research into browser caching (20+ sources)
- ✅ Analyzed Playwright report architecture
- ✅ Investigated Angular dev-server proxy limitations
- ✅ Implemented proxy.conf.js with cache headers + ETag rotation
- ✅ Updated ReportComponent with iframe cache-busting
- ✅ Documented root causes and architectural solutions
- ✅ Documented why problem persists despite attempted fixes

**Session 11: Live Report Updates Investigation**
- ✅ Investigated Playwright report caching issues
- ✅ Analyzed root cause: HTTP cache preventing fresh loads
- ✅ Identified proper solution: proxy configuration with cache-control headers
- ✅ Discovered implementation error: JSON cannot contain functions
- ✅ Reverted invalid changes to maintain stable codebase

**Session 9: Kubernetes Infrastructure Testing**
- ✅ Tested backend service scaling to zero replicas
- ✅ Verified service recovery and auto-restart
- ✅ Identified missing error handling in frontend
- ✅ Documented all findings and recovery procedures

**Session 8: E2E Test Suite Complete**
- ✅ Refactored 10 failing tests using URL-first approach
- ✅ Achieved 100% pass rate (33/33 tests)
- ✅ Improved execution time: 39.5 seconds (down from 51.6s with failures)
- ✅ Established URL-first testing pattern for stable test automation

---

## Optional: Add Backend Error Handling (Future Session)

**Priority**: Medium (User Experience Gap)

**Context**: Session 9 identified that frontend lacks error handling when backend service is unavailable. Users see blank/frozen UI instead of helpful error messages.

**What to Do** (when prioritized):

1. Create Error Boundary Component
   - Location: `frontend/src/app/features/error/`
   - Global error handler for HTTP failures
   - Display user-friendly messages for API errors

2. Update HTTP Interceptor
   - Catch 5xx errors (backend down)
   - Catch network timeouts
   - Implement retry logic with exponential backoff

3. Add Loading States
   - Show spinner during API calls
   - Display timeout notifications after 10+ seconds
   - Provide manual retry button

---

## Optional: Expand E2E Coverage to Phases 6-9

**Priority**: Low (Nice-to-have, not blocking)

**What to Do** (if pursuing):

1. **Phase 6: Panel Pop-Out Windows**
   - Tests pop-out/undock panel behavior
   - Challenge: Playwright multi-window handling requires special setup
   - Recommendation: Manual testing for now (complex automation overhead)

2. **Phase 7: Edge Cases & Browser History**
   - Tests browser back/forward button behavior
   - Tests history state management with filters
   - Requires: Specialized Playwright history navigation patterns

3. **Phase 8: Keyboard Navigation & Accessibility**
   - Tests keyboard-only navigation paths
   - Tests focus management and ARIA attributes
   - Requires: Playwright accessibility assertions

4. **Phase 9: Performance & Data Handling**
   - Tests behavior with large result sets
   - Tests pagination with various page sizes
   - Tests filter combination performance

**Recommendation**:
- Phases 1-5 provide solid core functionality coverage
- Phases 6-9 have diminishing returns for automation effort
- Continue with manual spot-checks for these areas per MANUAL-TEST-PLAN.md
- Revisit if specific bugs emerge in these areas

---

## Current E2E Testing Status

**Pass Rate**: 33/33 (100%) ✅
- Phase 1: 3/3 tests passing ✓
- Phase 2.1: 4/4 tests passing ✓
- Phase 2.2: 3/3 tests passing ✓
- Phase 2.3: 3/3 tests passing ✓
- Phase 2.4: 4/4 tests passing ✓
- Phase 2.5: 3/3 tests passing ✓
- Phase 2.6: 2/2 tests passing ✓
- Phase 2.7: 1/1 test passing ✓
- Phase 3: 3/3 tests passing ✓
- Phase 4: 3/3 tests passing ✓
- Phase 5: 3/3 tests passing ✓

**Test Coverage**: ~40% of MANUAL-TEST-PLAN.md test cases automated

---

**Last Updated**: 2025-12-15T01:45:00Z
