# Next Steps

**Current Session**: Session 29 - Framework Services JSDoc Documentation Enhancement

---

## SESSION 29 COMPLETED: Framework Services JSDoc Documentation Enhancement

**Status**: ✅ Completed. Enhanced documentation on 10+ framework services, improved coverage from 97% to estimated 98-99%.

### What Was Done
- ✅ Enhanced PickerConfigRegistry, DomainConfigRegistry, PopOutContextService
- ✅ Enhanced RequestCoordinatorService, HttpErrorInterceptor, GlobalErrorHandler
- ✅ Enhanced DomainConfigValidator, ErrorNotificationService
- ✅ Enhanced UrlStateService, ResourceManagementService
- ✅ Enhanced DependencyGraphComponent (updateNodeVisibility method)
- ✅ Added 50+ new JSDoc comments for properties and constructors
- ✅ Discovered and documented Compodoc 1.1.32 JSDoc requirements
- ✅ Applied consistent documentation pattern across codebase
- ✅ Updated PROJECT-STATUS.md with session progress

**Key Discovery**: Compodoc 1.1.32 requires individual `/** */` JSDoc comments directly above properties and methods - @property tags within interface documentation are NOT counted for coverage.

---

## SESSION 30 PLAN: Achieve 100% Compodoc Coverage

**Status**: Ready to complete final documentation push for 100% coverage.

### Immediate Next Actions

**1. Generate Compodoc Report and Identify Remaining Gaps** (10 minutes)
```bash
cd frontend
npm run docs
# Check: frontend/documents/coverage.html for percentage and file breakdown
```

Expected: See current coverage percentage (estimated 98-99%)

**2. Document Remaining Low-Coverage Files** (30-60 minutes)
- Identify files with <100% coverage from Compodoc report
- Focus on framework components if not already documented
- Add missing JSDoc to any undocumented methods/properties
- Priority: Files with public APIs (components, services)

**3. Run Compodoc Again and Verify 100% Coverage** (5 minutes)
```bash
npm run docs
# Verify all files now show 100% coverage
```

**4. Final Documentation Commit** (5 minutes)
```bash
git add -A
git commit -m "docs: Achieve 100% JSDoc documentation coverage

Final push to reach 100% Compodoc coverage across entire codebase.
All properties, methods, constructors, and parameters now have
individual JSDoc comments following Compodoc 1.1.32 requirements.

Coverage: 88% → 97% → 100%
Time invested: Session 28-29 (~8+ hours)
Files enhanced: 30+ TypeScript files
JSDoc comments added: 200+
"
```

**5. Update PROJECT-STATUS.md** (5 minutes)
- Set Version to 5.30
- Update Timestamp
- Document final coverage achievement (100%)
- Note: "100% JSDoc coverage achieved - all properties, methods, constructors documented"

---

## SESSION 31+ PLAN: Physics Knowledge Graphs (After 100% Coverage)

**Priority**: HIGH (Extends Physics domain educational value)

### What to Do

Implement knowledge graphs for remaining Physics course tiles following the Classical Mechanics pattern:

**1. Electromagnetism Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/electromagnetism-graph.ts`
   - Create: `ElectromagnetismGraphComponent` wrapper
   - Add route: `/physics/electromagnetism-graph`
   - Topics: Electric Fields, Magnetic Fields, Maxwell's Equations, Wave Propagation, Radiation, etc.

**2. Thermodynamics Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/thermodynamics-graph.ts`
   - Create: `ThermodynamicsGraphComponent` wrapper
   - Add route: `/physics/thermodynamics-graph`
   - Topics: Temperature, Energy, Entropy, Laws of Thermodynamics, Phase Transitions, etc.

**3. Quantum Mechanics Knowledge Graph** (2-3 hours)
   - Create: `frontend/src/app/features/physics/quantum-mechanics-graph.ts`
   - Create: `QuantumMechanicsGraphComponent` wrapper
   - Add route: `/physics/quantum-mechanics-graph`
   - Topics: Wave Functions, Schrödinger Equation, Uncertainty, Spin, Angular Momentum, etc.

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

## After Knowledge Graphs: Pop-Out Window Manual Testing

**Priority**: HIGH (Validates architecture stability)

**What to Do**: Follow the 10 test scenarios in POPOUT-ARCHITECTURE.md
1. Open pop-out window on Model Picker
2. Verify state sync from main window to pop-out
3. Verify state sync from pop-out to main window
4. Verify multiple pop-outs work independently
5. Verify filter operations propagate correctly
6. Verify pop-out window closes cleanly
7. Verify page refresh closes all pop-outs
8. Multi-monitor scenario (if available)
9. Network latency simulation with DevTools throttling
10. Console validation - verify message flow

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

---

## Priority Order (Master List)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **0** | **Session 17**: Dependency graph visualization (145+ nodes, 300+ edges) | **DONE** | **✅ COMPLETE** |
| **0.5** | **Session 18**: Modal visibility fix + drag handle | **DONE** | **✅ COMPLETE** |
| **1** | **Session 29**: Achieve 98-99% JSDoc documentation | **HIGH** | **✅ COMPLETE** |
| **1** | **Session 30 (NEXT)**: Achieve 100% JSDoc documentation | **HIGH** | **Immediate** |
| **2** | **Create Knowledge Graphs for Physics Topics** | **HIGH** | Pending |
| **3** | **Perform pop-out manual testing (10 tests)** | **HIGH** | Pending |
| **4** | **Fix Bug #13 (dropdown keyboard nav)** | **MEDIUM** | Pending |
| 5 | Fix Bug #7 (multiselect visual state) | Medium | Pending |
| 6 | Plan agriculture domain implementation | Low | Pending |
| 7 | Plan chemistry domain implementation | Low | Pending |
| 8 | Plan mathematics domain implementation | Low | Pending |

---

**Last Updated**: 2025-12-20T15:45:00Z
