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

## Current Priority: Fix Backend API

**Status**: READY TO IMPLEMENT

### Governing Tactic (from PROJECT-STATUS.md)

> **Fix backend API before any frontend work.**
>
> The `/manufacturer-model-combinations` endpoint must be rewritten to use ES composite aggregation for true server-side pagination.
>
> **DO NOT modify frontend code until backend is fixed.**

### Background (Investigation Complete)

The backend investigation is **COMPLETE**. Root cause identified:

| Issue | Current | Required |
|-------|---------|----------|
| ES Query | Nested `terms` with `size: 100` | Composite aggregation with cursor |
| Pagination | JavaScript `.slice()` | ES `after` cursor |
| Response | 72 manufacturers (nested) | 881 combinations (flat) |

Full analysis: [../investigation/BACKEND-PAGINATION-ANALYSIS.md](../investigation/BACKEND-PAGINATION-ANALYSIS.md)

### Immediate Actions

**Rewrite `/manufacturer-model-combinations` endpoint:**

1. **Replace ES query** in `backend-specs/src/services/elasticsearchService.js`
   - Remove nested `terms` aggregation
   - Implement `composite` aggregation with cursor
   ```javascript
   aggs: {
     manufacturer_model_combos: {
       composite: {
         size: pageSize,
         after: afterCursor,  // null for first page
         sources: [
           { manufacturer: { terms: { field: 'manufacturer.keyword' } } },
           { model: { terms: { field: 'model.keyword' } } }
         ]
       }
     }
   }
   ```

2. **Add total count query** (cardinality aggregation)
   ```javascript
   aggs: {
     total_combos: {
       cardinality: {
         script: {
           source: "doc['manufacturer.keyword'].value + '|' + doc['model.keyword'].value"
         }
       }
     }
   }
   ```

3. **Update API contract**
   - Change pagination from page-based to cursor-based
   - Return flat list of manufacturer-model combinations
   - Include `afterKey` cursor for next page

4. **Update controller** in `backend-specs/src/controllers/specsController.js`
   - Accept `after` parameter instead of (or in addition to) `page`
   - Return cursor in response

5. **Test the changes**
   ```bash
   # Build and deploy
   cd backend-specs
   podman build -t localhost/generic-prime-backend:v1.1.0 .
   kubectl set image deployment/generic-prime-backend \
     backend-api=localhost/generic-prime-backend:v1.1.0 -n generic-prime

   # Test endpoint
   curl "http://localhost:3000/api/specs/v1/manufacturer-model-combinations?size=20" | jq
   ```

6. **Verify with frontend**
   - Update `responseTransformer` if needed
   - Test picker displays 881 combinations

---

## Architectural Requirements (Reference)

Two non-negotiable requirements documented:

1. **Frontend must accept ANY data structure** (flat or nested)
   - See: [../plan/07-DATA-MAPPER-SERVICE.md](../plan/07-DATA-MAPPER-SERVICE.md)

2. **Server-side pagination is mandatory**
   - No hardcoded size limits
   - Expect millions of rows

---

## Known Bugs (for reference)

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #11 | CRITICAL | ROOT CAUSE FOUND | Backend needs composite aggregation |
| #10 | Medium | Not started | Pop-out statistics breaks with filters |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

Full details: [../status/KNOWN-BUGS.md](../status/KNOWN-BUGS.md)

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

## Quick Commands

```bash
# Elasticsearch
kubectl port-forward -n data svc/elasticsearch 9200:9200 &
curl -s "http://localhost:9200/_cluster/health" | jq '.status'

# Backend (port-forward to test directly)
kubectl port-forward -n generic-prime svc/generic-prime-backend 3000:3000 &
curl -s "http://localhost:3000/api/specs/v1/manufacturer-model-combinations?size=20" | jq

# Test composite aggregation directly
curl -X POST "localhost:9200/autos-unified/_search" -H 'Content-Type: application/json' -d'
{
  "size": 0,
  "aggs": {
    "combos": {
      "composite": {
        "size": 20,
        "sources": [
          { "manufacturer": { "terms": { "field": "manufacturer.keyword" } } },
          { "model": { "terms": { "field": "model.keyword" } } }
        ]
      }
    }
  }
}'

# Frontend dev server (if needed)
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Git
git status
git add -A && git commit -m "docs: description"
```

---

**Last Updated**: 2025-11-27
**Updated By**: Backend investigation session - ready for implementation
