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

## Current Priority: Bug #10 or Bug #7

**Status**: Bug #11 RESOLVED, picker working with server-side pagination

### Governing Tactic (from PROJECT-STATUS.md)

> **Bug #11 fully resolved. Proceed to Bug #10 or #7.**

---

## Bug #11: RESOLVED ✓

| Metric | Before | After |
|--------|--------|-------|
| API Response | Cursor-based (`afterKey`) | **Offset-based (`page`, `size`)** |
| Pagination | Frontend was broken | **Server-side, industry standard** |
| Backend Version | v1.2.0 | **v1.3.0** |
| Picker | 400 error | **Working, 881 combinations** |

---

## Immediate Actions

### Option A: Fix Bug #10 (Pop-out Statistics)

**Problem**: Pop-out statistics panel breaks with pre-selected filters.

**Severity**: Medium

**Location**: Likely in `PopOutContextService` or chart components.

**Investigation**:
1. Open app with filters in URL (e.g., `?manufacturer=Ford`)
2. Pop out statistics panel
3. Check console for errors
4. Trace data flow from URL → state → charts

### Option B: Fix Bug #7 (Checkbox Visual State)

**Problem**: Checkboxes remain visually checked after clearing selection.

**Severity**: Low

**Location**: Likely CSS/PrimeNG styling issue in picker component.

**Investigation**:
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
**Updated By**: Pagination fix session - Backend v1.3.0 deployed, picker working
