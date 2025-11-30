# Next Steps

**Purpose**: Actionable items for the current session.
**Update Policy**: Update this file AND [PROJECT-STATUS.md](PROJECT-STATUS.md) before ending each session.

---

## Session Start Checklist

1. Read [ORIENTATION.md](ORIENTATION.md) (~3 min)
2. Read [PROJECT-STATUS.md](PROJECT-STATUS.md) for current state and approach
3. Review this file for immediate actions
4. Discuss with developer before starting work

---

## Current Priority: Add Agriculture Domain

**Status**: Dark theme implementation complete. UI styling is fully finished.

### Governing Tactic (from PROJECT-STATUS.md)

> **Dark theme implementation complete. UI is now fully styled with dark/black theme.**
> The application now features a cohesive dark theme matching Visual Studio's color scheme.

---

## Completed This Session (2025-11-30 - Dark Theme Implementation)

- **PrimeNG Theme Switched** - Changed from `lara-light-blue` to `lara-dark-blue`
- **Dark Theme Applied** - Page background `#3c3c3c`, panels `#252526`, controls black
- **Plotly Charts Dark Mode** - All 4 chart sources updated with dark backgrounds and white text
- **Query Control Styled** - Dark panel with black input backgrounds
- **Table Rows Compacted** - Row height reduced by 50%
- **Panel Headers Refined** - Padding reduced, icons cleaned up (no circular backgrounds)
- **White Text Applied** - All text changed to white for readability on dark backgrounds

---

## Immediate Actions

### 1. Add "Agriculture" Domain (PRIORITY)

Create a new "agriculture" domain to validate the new flexible domain architecture. This will involve:
- Creating a new folder `frontend/src/domain-config/agriculture/`
- Defining a new set of models, adapters, and configs for the agriculture domain.
- Adding the new domain provider to the `DOMAIN_PROVIDERS` array.
- Creating a simple way to switch between domains in the UI (e.g., a dropdown in the header).

### 2. Fix Bug #13 - Dropdown Keyboard Navigation

**Problem**: PrimeNG p-dropdown with `[filter]="true"` keyboard navigation broken:
- Down arrow should highlight next option
- Up arrow should highlight previous option
- Enter/Space should select highlighted option
- Currently: Arrow keys do nothing, can only click

**Investigation needed**:
- Check PrimeNG version compatibility
- Check if `[filter]="true"` disables keyboard nav
- Try PrimeNG accessibility settings

### 3. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

---

## Current Discover Page State

**FULL LAYOUT**: All 4 panels with drag-drop, collapse, and pop-out

```
discover.component.html:
├── Header (domain label) - White text on dark background
├── cdkDropList (panels-container)
│   ├── Query Control panel (dark themed) - draggable, collapsible, pop-out
│   ├── Manufacturer-Model Picker panel (dark themed) - draggable, collapsible, pop-out
│   ├── Statistics panel (dark themed) - draggable, collapsible, pop-out
│   │   └── 2×2 Chart Grid (dark Plotly charts with white text)
│   └── Results Table panel (dark themed, compact rows) - draggable, collapsible, pop-out
```

---

## Key Files for Current Work

| File | Purpose |
|------|---------|
| `frontend/src/domain-config/` | Directory for all domain configurations. |
| `frontend/src/domain-config/domain-providers.ts` | Centralized array of all domain providers. |
| `app.component.ts` | Where domains are registered at startup. |
| `discover.component.html` | Main discover page layout (restored). |
| `discover.component.ts` | Panel management, pop-out coordination. |


---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Check backend pods
kubectl get pods -n generic-prime

# Backend logs
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50
```

---

## Session End Checklist

Before ending session:

1. [ ] Archive current PROJECT-STATUS.md to STATUS-HISTORY.md
2. [ ] Update PROJECT-STATUS.md with:
   - New version number (increment)
   - New timestamp
   - Findings and decisions
3. [ ] Update this NEXT-STEPS.md with next actions
4. [ ] Commit changes: `git add -A && git commit -m "docs: session summary"`
5. [ ] Push if appropriate

---

**Last Updated**: 2025-11-30
**Updated By**: Dark Theme Implementation Session
