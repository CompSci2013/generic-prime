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

## Current Priority: Test Frontend + Bug #10/#7

**Status**: Bug #11 FIXED, ready for frontend testing

### Governing Tactic (from PROJECT-STATUS.md)

> **Bug #11 fixed. Test frontend, then proceed to Bug #10 or #7.**
>
> Frontend picker has been updated to use flat format with client-side pagination.
> Need to verify the UI works correctly with the new API response.

---

## Bug #11: COMPLETED

| Metric | Before | After |
|--------|--------|-------|
| API Response | 72 manufacturers (nested) | **881 combinations (flat)** |
| Pagination | In-memory `.slice()` | **ES composite cursor** |
| Backend Version | v1.1.0 | **v1.2.0** |

---

## Immediate Actions

### Step 1: Test Frontend with New API

```bash
# Start dev container and server
cd ~/projects/generic-prime/frontend
podman start generic-prime-frontend-dev 2>/dev/null || \
  podman run -d --name generic-prime-frontend-dev --network host \
    -v $(pwd):/app:z -w /app localhost/generic-prime-frontend:dev
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205
```

**Test in browser**: `http://192.168.0.244:4205/discover`

**Verify**:
- [ ] Manufacturer-Model picker opens
- [ ] Shows 881 total combinations (not 72)
- [ ] Pagination works (client-side)
- [ ] Search filters correctly
- [ ] Selection persists to URL

### Step 2: Fix Bug #10 (Pop-out Statistics)

**Problem**: Pop-out statistics panel breaks with pre-selected filters.

**Location**: Likely in `PopOutContextService` or chart components.

**Investigation**:
1. Open app with filters in URL
2. Pop out statistics panel
3. Check console for errors
4. Trace data flow from URL → state → charts

### Step 3: Fix Bug #7 (Checkbox Visual State)

**Problem**: Checkboxes remain visually checked after clearing selection.

**Location**: Likely CSS/PrimeNG styling issue in picker component.

**Investigation**:
1. Select items in picker
2. Clear selection
3. Check if `[(selection)]` binding updates
4. Check if PrimeNG checkbox component re-renders

---

## Future Enhancement: Cursor-Based Pagination in Picker

The picker framework currently uses page-based pagination. For datasets > 10K records, implement cursor-based pagination:

```typescript
// Add to PickerApiParams
export interface PickerApiParams {
  page: number;
  size: number;
  afterKey?: { [key: string]: any };  // Cursor for next page
  // ...
}

// Add to PickerApiResponse
export interface PickerApiResponse<T> {
  results: T[];
  total: number;
  afterKey?: { [key: string]: any };  // Cursor from response
  hasMore?: boolean;
  // ...
}
```

**Not urgent** - current client-side pagination works for 881 records.

---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Test API directly
curl -s -H "Host: generic-prime.minilab" \
  "http://192.168.0.110/api/specs/v1/manufacturer-model-combinations?size=5" | jq

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
**Updated By**: Bug #11 fix session - Backend v1.2.0 deployed, frontend updated
