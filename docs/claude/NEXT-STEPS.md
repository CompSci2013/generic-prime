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

## Current Priority: Picker Isolation Testing

**Status**: QueryControl testing complete, moving to Picker

### Governing Tactic (from PROJECT-STATUS.md)

> **Continue isolation testing approach.**
> Test each component in isolation before re-enabling all panels.

---

## Immediate Actions

### 1. Test Picker in Isolation

Swap QueryControl for Picker in discover.component.html:

```html
<!-- Comment out QueryControl, add Picker -->
<!-- <app-query-control ... /> -->
<app-base-picker [configId]="'manufacturer-model'" ...></app-base-picker>
```

Test scenarios:
- Picker loads 881 combinations
- Selection updates URL
- URL paste updates picker selection
- Pop-out picker syncs with main window

### 2. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

### 3. Test Statistics in Isolation

After Picker is verified, swap for Statistics panel and test chart interactions.

### 4. Re-enable All Panels

Once each component is verified individually, restore full discover page.

---

## Current Discover Page State

**ISOLATION MODE**: Only QueryControl is rendered (ready to swap for Picker)

```
discover.component.html:
├── Header (with isolation notice)
├── QueryControl panel (with pop-out button)  ← SWAP THIS FOR PICKER
├── Debug panel (shows URL state JSON)
└── [REMOVED: picker, statistics, results]
```

---

## Key Files for Isolation Testing

| File | Purpose |
|------|---------|
| `discover.component.html` | Toggle which panels are visible |
| `discover.component.ts` | Pop-out handling, URL state debug |
| `panel-popout.component.ts` | BroadcastChannel communication |
| `base-picker.component.ts` | Picker functionality |

---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Test API directly
curl -s -H "Host: generic-prime.minilab" \
  "http://192.168.0.110/api/specs/v1/manufacturer-model-combinations?page=1&size=20" | jq

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

**Last Updated**: 2025-11-27
**Updated By**: QueryControl bug fixes session - dropdown and Clear All fixed
