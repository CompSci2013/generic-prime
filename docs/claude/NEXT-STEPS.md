# Next Steps

**Current Session**: Session 76 - Abstraction Leak Fixes & CDK Research
**Previous Session**: Session 75 - Query Panel User Stories
**Status**: v7.11, Abstraction leaks fixed, CDK research documented

---

## IMMEDIATE ACTION: Explore CDK Mixed Orientation for Panel Grid

**Priority**: Medium
**Scope**: Evaluate if panel grid layout would improve UX

### Context

User requested research on Angular CDK drag-drop improvements after v14 → v21 upgrade. Research found:
- Current implementation already uses best practices
- New feature: `cdkDropListOrientation="mixed"` available since Angular Material v18.1.0
- Enables flex-wrap grid layouts with drag-drop reordering

### Implementation Pattern

```html
<div cdkDropList cdkDropListOrientation="mixed" class="panel-grid">
  @for (panel of panelOrder; track panel) {
    <div cdkDrag>{{ panel }}</div>
  }
</div>
```

```scss
.panel-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
```

**Caveat**: Mixed orientation disables sorting animations (DOM manipulation instead of CSS transforms).

### Steps

1. Evaluate if grid layout benefits discover page UX
2. If yes, modify discover.component.html to use `cdkDropListOrientation="mixed"`
3. Update SCSS to use flex-wrap layout
4. Test drag-drop behavior in new layout

### Key Files

| File | Purpose |
|------|---------|
| `frontend/src/app/features/discover/discover.component.html` | Panel container |
| `frontend/src/app/features/discover/discover.component.scss` | Panel styling |
| `docs/claude/TANGENTS.md` | Full research notes (Tangent #5) |

---

## Alternative Tasks

| Task | Priority | Notes |
|------|----------|-------|
| Continue User Story Validation | HIGH | Results Table, Statistics Panel, Picker |
| Fix Bug #7 (multiselect visual state) | Medium | Low priority |
| IdP Phase 1 (Keycloak) | HIGH | Next major milestone |

---

## SESSION 76 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Fixed chart click abstraction leak (toUrlParams() on ChartDataSource)
2. ✅ Fixed QueryControlComponent abstraction leak (generic RangeConfig)
3. ✅ Documented UserPreferencesService leaks in TANGENTS.md
4. ✅ Researched Angular CDK drag-drop v18+ features
5. ✅ Documented CDK mixed orientation in TANGENTS.md
6. ✅ Bumped version to 21.1.2

---
