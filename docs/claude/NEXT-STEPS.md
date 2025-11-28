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

## Current Priority: Add Statistics Panel

**Status**: 3 of 4 panels active (Query Control, Picker, Results Table). Statistics panel remaining.

### Governing Tactic (from PROJECT-STATUS.md)

> **Continue isolation testing approach.**
> Test each component in isolation before re-enabling all panels.

---

## Completed This Session

- Body Class multiselect with checkboxes (p-multiSelect)
- Array serialization for URL (comma-separated)
- Query Control re-enabled on discover page
- Fixed `.split is not a function` crash in Query Control

---

## Immediate Actions

### 1. Add Statistics Panel (PRIORITY)

Add Statistics panel to discover page to complete isolation testing:

```html
<!-- In discover.component.html, add after Results Table -->
<div class="panel-wrapper">
  <div class="panel-header">
    <h3 class="panel-title">Statistics</h3>
    <!-- Pop-out button here -->
  </div>
  <app-statistics-panel
    [domainConfig]="domainConfig">
  </app-statistics-panel>
</div>
```

Test scenarios:
- Statistics load with vehicle data
- Chart interactions work
- Highlight filters update URL
- Pop-out statistics syncs with main window

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

### 4. Remove Isolation Mode

Once Statistics panel verified, update discover.component.html:
- Remove "ISOLATION MODE" notice
- Remove debug panel (or make collapsible)
- Restore normal page layout

---

## Current Discover Page State

**ISOLATION MODE**: Query Control + Picker + Results Table are rendered

```
discover.component.html:
├── Header (with isolation notice)
├── Query Control panel (with pop-out button)
├── Picker panel (with pop-out button)
├── Results Table panel (with pop-out button)
├── Debug panel (shows URL state JSON)
└── [REMOVED: statistics-panel]
```

---

## Key Files for Current Work

| File | Purpose |
|------|---------|
| `discover.component.html` | Add Statistics panel |
| `statistics-panel.component.ts` | Statistics rendering |
| `automobile.chart-configs.ts` | Chart configuration |

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

**Last Updated**: 2025-11-28
**Updated By**: Body Class multiselect + Query Control session
