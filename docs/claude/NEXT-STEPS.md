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

## Current Priority: Bug #13 - Dropdown Keyboard Navigation

**Status**: Results Table isolation testing in progress, keyboard navigation bug identified

### Governing Tactic (from PROJECT-STATUS.md)

> **Continue isolation testing approach.**
> Test each component in isolation before re-enabling all panels.

---

## Completed This Session

- Results Table isolation testing (with Picker for easier testing)
- Dropdown improvements - dynamic options from backend `/agg/:field`
- Filter clearing now removes params from URL
- Dropdown search input added (`[filter]="true"`)
- All body classes now available (12 total, including Sports Car)
- Backend v1.5.0 deployed with generic aggregation endpoint

---

## Immediate Actions

### 1. Fix Bug #13 - Dropdown Keyboard Navigation (PRIORITY)

**Problem**: PrimeNG p-dropdown with `[filter]="true"` keyboard navigation broken:
- Down arrow should highlight next option
- Up arrow should highlight previous option
- Enter/Space should select highlighted option
- Currently: Arrow keys do nothing, can only click

**Investigation needed**:
- Check PrimeNG version compatibility
- Check if `[filter]="true"` disables keyboard nav
- Try PrimeNG accessibility settings
- May need to add `[autoDisplayFirst]="false"` or other attributes

**File to modify**: `results-table.component.html` (p-dropdown element)

### 2. Test Statistics in Isolation

Swap Picker for Statistics panel in discover.component.html:

```html
<!-- Comment out Picker, add Statistics -->
<!-- <app-base-picker ... /> -->
<app-statistics-panel ...></app-statistics-panel>
```

Test scenarios:
- Statistics load with vehicle data
- Chart interactions work
- Highlight filters update URL
- Pop-out statistics syncs with main window

### 3. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

### 4. Re-enable All Panels

Once each component is verified individually, restore full discover page.

---

## Current Discover Page State

**ISOLATION MODE**: Picker + Results Table are rendered

```
discover.component.html:
├── Header (with isolation notice)
├── Picker panel (with pop-out button)
├── Results Table panel (TESTING IN PROGRESS)
├── Debug panel (shows URL state JSON)
└── [REMOVED: query-control, statistics]
```

---

## Key Files for Current Work

| File | Purpose |
|------|---------|
| `results-table.component.html` | p-dropdown keyboard fix |
| `results-table.component.ts` | Dynamic option loading |
| `automobile.filter-definitions.ts` | Filter configs with optionsEndpoint |
| `domain-config.interface.ts` | FilterDefinition with optionsEndpoint |
| `elasticsearchService.js` | Backend /agg/:field endpoint |

---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Test new agg endpoint
curl -s "http://generic-prime.minilab/api/specs/v1/agg/body_class" | jq

# Check backend pods
kubectl get pods -n generic-prime

# Backend logs
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50

# Backend deployment (when code changes)
cd ~/projects/data-broker/generic-prime
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:vX.Y.Z .
podman save localhost/generic-prime-backend-api:vX.Y.Z -o /tmp/backend-vX.Y.Z.tar && \
  sudo k3s ctr images import /tmp/backend-vX.Y.Z.tar && \
  sudo rm /tmp/backend-vX.Y.Z.tar
kubectl set image deployment/generic-prime-backend-api -n generic-prime \
  backend-api=localhost/generic-prime-backend-api:vX.Y.Z
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

**Last Updated**: 2025-11-27
**Updated By**: Results Table isolation testing session - dropdown improvements, Bug #13 identified
