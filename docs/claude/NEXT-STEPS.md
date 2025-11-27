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

## Current Priority: Isolation Testing

**Status**: QueryControl isolation testing complete, minor bugs remain

### Governing Tactic (from PROJECT-STATUS.md)

> **Continue isolation testing approach.**
> Test each component in isolation before re-enabling all panels.

---

## Immediate Actions

### 1. Fix QueryControl Bugs

User mentioned "a few other bugs" - need to identify and fix these in next session.

**To discover bugs**:
1. Start dev server: `podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205`
2. Open `http://192.168.0.244:4205/discover`
3. Test filter add/remove, clear all, pop-out scenarios
4. Document any issues found

### 2. Test Picker in Isolation

After QueryControl is verified:
1. Edit `discover.component.html` - swap QueryControl for Picker
2. Test Picker scenarios (selection, URL sync, pop-out)
3. Fix any issues found

### 3. Continue Component-by-Component

Order: QueryControl → Picker → Statistics → Results → All together

---

## Current Discover Page State

**ISOLATION MODE**: Only QueryControl is rendered

```
discover.component.html:
├── Header (with isolation notice)
├── QueryControl panel (with pop-out button)
├── Debug panel (shows URL state JSON)
└── [REMOVED: picker, statistics, results]
```

To restore full page later:
- Revert `discover.component.html` to include all panels
- Remove debug panel and isolation notice

---

## Key Files for Isolation Testing

| File | Purpose |
|------|---------|
| `discover.component.html` | Toggle which panels are visible |
| `discover.component.ts` | Pop-out handling, URL state debug |
| `panel-popout.component.ts` | BroadcastChannel communication |
| `query-control.component.ts` | Filter management, chips |

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
**Updated By**: Bug #10 isolation testing session - pop-out communication fixed
