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

## Current Priority: Bug #10 (In Progress)

**Status**: Partial fix applied, state propagation still broken

### Governing Tactic (from PROJECT-STATUS.md)

> **Bug #10 requires deeper investigation into state propagation.**

---

## Bug #10: Pop-out Statistics Panel

### What Was Done (2025-11-27)

1. **Identified root cause**: `UrlStateService` is `providedIn: 'root'` singleton using `ActivatedRoute` which doesn't receive child route updates

2. **Applied fixes** (not working):
   - `url-state.service.ts`: Changed to use `Router.events` + `NavigationEnd`
   - `url-state.service.ts`: Changed to use `router.url` for initialization
   - `panel-popout.component.ts`: Added `autoFetch: false`

3. **Observed behavior**:
   - URL bar updates correctly (Ford → Buick)
   - `[UrlState] Route queryParams changed` log fires
   - But Active Filter chips don't update
   - Pop-out window doesn't receive new state

### Next Steps for Bug #10

1. **Add debug logging** to trace state flow:
   ```typescript
   // In UrlStateService.watchRouteChanges()
   console.log('[UrlState] Emitting params:', params);

   // In ResourceManagementService.watchUrlChanges()
   console.log('[ResourceMgmt] Received URL params:', urlParams);
   console.log('[ResourceMgmt] Converted to filters:', filters);

   // In ResourceManagementService filters$ pipe
   console.log('[ResourceMgmt] filters$ emitting:', filters);

   // In QueryControl subscription
   console.log('[QueryControl] Received filters:', filters);
   ```

2. **Check if `watchParams()` distinctUntilChanged is filtering out emissions** - the JSON.stringify comparison might be matching when it shouldn't

3. **Verify BroadcastChannel message flow** - check if `STATE_UPDATE` messages are being sent/received by pop-out

### Key Files

| File | Purpose |
|------|---------|
| `url-state.service.ts` | URL → params observable |
| `resource-management.service.ts` | params → filters → state |
| `query-control.component.ts` | Subscribes to `filters$` for chips |
| `discover.component.ts` | Broadcasts state to pop-outs |
| `panel-popout.component.ts` | Receives state via BroadcastChannel |

---

## Bug #7: Checkbox Visual State (Low Priority)

**Problem**: Checkboxes remain visually checked after clearing selection.

**Severity**: Low

**Location**: Likely CSS/PrimeNG styling issue in picker component.

**Investigation** (when Bug #10 is resolved):
1. Select items in picker
2. Clear selection (click "Clear" button)
3. Check if `[(selection)]` binding updates
4. Check if PrimeNG checkbox component re-renders

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
**Updated By**: Bug #10 investigation session - partial fix, state propagation broken
