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

## Current Priority: Statistics Isolation Testing

**Status**: QueryControl and Picker testing complete, moving to Statistics

### Governing Tactic (from PROJECT-STATUS.md)

> **Continue isolation testing approach.**
> Test each component in isolation before re-enabling all panels.

---

## Completed This Session

- Picker isolation testing - ALL TESTS PASSED
- Column sorting implemented (backend v1.4.0 + frontend)
- Backend deployment pattern documented in ORIENTATION.md

---

## Immediate Actions

### 1. Test Statistics in Isolation

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

### 2. Test Results in Isolation

After Statistics verified, add Results panel:
- Table loads with vehicle data
- Pagination works
- Sorting works
- Selection works

### 3. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

### 4. Fix New Bugs (Low Priority)

| Bug | Description |
|-----|-------------|
| Search filter partial match | Searching "15" returns no results (should match years) |
| URL params case sensitive | `Ford` vs `ford` treated differently |

### 5. Re-enable All Panels

Once each component is verified individually, restore full discover page.

---

## Current Discover Page State

**ISOLATION MODE**: Picker is rendered (ready to swap for Statistics)

```
discover.component.html:
├── Header (with isolation notice)
├── Picker panel (with pop-out button)  ← SWAP THIS FOR STATISTICS
├── Debug panel (shows URL state JSON)
└── [REMOVED: query-control, statistics, results]
```

---

## Key Files for Isolation Testing

| File | Purpose |
|------|---------|
| `discover.component.html` | Toggle which panels are visible |
| `discover.component.ts` | Pop-out handling, URL state debug |
| `panel-popout.component.ts` | BroadcastChannel communication |
| `statistics-panel.component.ts` | Statistics/charts functionality |
| `results-table.component.ts` | Results table functionality |

---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Test API directly
curl -s -H "Host: generic-prime.minilab" \
  "http://192.168.0.110/api/specs/v1/vehicles/details?page=1&size=20" | jq

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
**Updated By**: Picker isolation testing session - sorting implemented, all tests passed
