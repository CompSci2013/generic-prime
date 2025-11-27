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

## Current Priority: Fix Bug #11

**Status**: READY TO IMPLEMENT

### Governing Tactic (from PROJECT-STATUS.md)

> **Backend deployed. Now fix Bug #11.**
>
> The `/manufacturer-model-combinations` endpoint must be rewritten to use ES composite aggregation for true server-side pagination.
>
> **Bug #11 is now UNBLOCKED and is the immediate priority.**

---

## Bug #11: The Problem

| Issue | Current | Required |
|-------|---------|----------|
| ES Query | Nested `terms` with `size: 100` | Composite aggregation with cursor |
| Pagination | JavaScript `.slice()` | ES `after` cursor |
| Response | 72 manufacturers (nested) | 881 combinations (flat) |
| Data Loss | Chevrolet missing 12, Ford missing 11 | All combinations returned |

**Root Cause**: In-memory pagination disguised as server-side pagination.

Full analysis: [../investigation/BACKEND-PAGINATION-ANALYSIS.md](../investigation/BACKEND-PAGINATION-ANALYSIS.md)

---

## Implementation Steps

### Step 1: Read Current Implementation

```bash
# Backend source location
cat ~/projects/data-broker/generic-prime/src/services/elasticsearchService.js
```

Key function: `getManufacturerModelCombinations()` (around line 50-150)

### Step 2: Replace ES Query with Composite Aggregation

**Current (broken)**:
```javascript
aggs: {
  manufacturers: {
    terms: { field: 'manufacturer.keyword', size: 100 },
    aggs: {
      models: { terms: { field: 'model.keyword', size: 100 } }
    }
  }
}
```

**New (correct)**:
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

### Step 3: Add Total Count Query

```javascript
// Separate query for total count (cardinality)
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

### Step 4: Update Response Format

**Current (nested)**:
```json
{
  "data": [
    {
      "manufacturer": "Ford",
      "count": 665,
      "models": [{ "model": "F-150", "count": 23 }]
    }
  ]
}
```

**New (flat)**:
```json
{
  "data": [
    { "manufacturer": "Ford", "model": "F-150", "count": 23 }
  ],
  "afterKey": { "manufacturer": "Ford", "model": "F-150" },
  "total": 881
}
```

### Step 5: Update Controller

File: `~/projects/data-broker/generic-prime/src/controllers/specsController.js`

- Accept `after` parameter (JSON cursor) instead of `page`
- Return `afterKey` cursor in response
- Keep backward compatibility if possible

### Step 6: Build and Deploy

```bash
cd ~/projects/data-broker/generic-prime

# Build new image
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:v1.2.0 .

# Export for containerd
podman save -o /tmp/generic-prime-backend-api-v1.2.0.tar localhost/generic-prime-backend-api:v1.2.0

# Import to containerd (requires sudo)
sudo ctr -n k8s.io images import /tmp/generic-prime-backend-api-v1.2.0.tar

# Update deployment
# First update infra/k8s/deployment.yaml to use v1.2.0
kubectl apply -f infra/k8s/deployment.yaml
```

### Step 7: Verify Fix

```bash
# Test endpoint returns 881 combinations
curl -s -H "Host: generic-prime.minilab" \
  "http://192.168.0.110/api/specs/v1/manufacturer-model-combinations?size=20" | jq '.total'

# Expected: 881

# Test cursor-based pagination
curl -s -H "Host: generic-prime.minilab" \
  "http://192.168.0.110/api/specs/v1/manufacturer-model-combinations?size=20" | jq '.afterKey'

# Should return cursor for next page
```

---

## Quick Commands

```bash
# Backend source
cat ~/projects/data-broker/generic-prime/src/services/elasticsearchService.js

# Test composite aggregation directly on ES (via port-forward)
kubectl port-forward -n data svc/elasticsearch 9200:9200 &
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

# K8s
kubectl get pods -n generic-prime
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50

# Test via ingress
curl -s -H "Host: generic-prime.minilab" "http://192.168.0.110/api/specs/v1/manufacturer-model-combinations?size=5" | jq
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
**Updated By**: Backend deployment session - Bug #11 now unblocked
