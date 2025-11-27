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

## Current Priority: Deploy and Validate Backend

**Status**: READY TO DEPLOY

### Governing Tactic (from PROJECT-STATUS.md)

> **Deploy and validate backend API, THEN fix Bug #11.**
>
> 1. Build new container image with renamed service
> 2. Deploy to Kubernetes
> 3. Validate endpoints respond correctly
> 4. THEN proceed with Bug #11 composite aggregation fix
>
> **DO NOT modify frontend code until backend is deployed and validated.**

---

## Phase 1: Deploy Backend (DO THIS FIRST)

### 1.1 Build Container Image

```bash
cd ~/projects/data-broker/generic-prime

# Build new image with renamed service
podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:v1.1.0 .
```

### 1.2 Delete Old Deployment

```bash
# Delete old deployment (uses old name)
kubectl delete deployment generic-prime-backend -n generic-prime
kubectl delete service generic-prime-backend -n generic-prime
```

### 1.3 Deploy New Service

```bash
cd ~/projects/data-broker/generic-prime

# Apply new K8s manifests
kubectl apply -f infra/k8s/deployment.yaml
kubectl apply -f infra/k8s/service.yaml

# Update ingress (already updated, but apply to be safe)
kubectl apply -f ~/projects/generic-prime/k8s/ingress.yaml
```

### 1.4 Verify Deployment

```bash
# Check pods are running
kubectl get pods -n generic-prime -l app=generic-prime-backend-api

# Check service exists
kubectl get svc -n generic-prime

# Check logs
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50
```

---

## Phase 2: Validate Endpoints

### 2.1 Test via Ingress

```bash
# Health check
curl -s "http://generic-prime.minilab/api/specs/v1/../health" | jq

# Test manufacturer-model combinations
curl -s "http://generic-prime.minilab/api/specs/v1/manufacturer-model-combinations?size=10" | jq

# Test vehicle details
curl -s "http://generic-prime.minilab/api/specs/v1/vehicles/details?size=5" | jq

# Test filters
curl -s "http://generic-prime.minilab/api/specs/v1/filters/manufacturers" | jq
```

### 2.2 Validation Checklist

- [ ] Pods are Running (2 replicas)
- [ ] Health endpoint returns `status: ok`
- [ ] Ready endpoint returns `status: ready`
- [ ] `/manufacturer-model-combinations` returns data (will still show 72, that's expected)
- [ ] `/vehicles/details` returns paginated results
- [ ] `/filters/manufacturers` returns manufacturer list

**Once all checks pass, proceed to Phase 3.**

---

## Phase 3: Fix Bug #11 (After Validation)

### Background

Bug #11 root cause: `/manufacturer-model-combinations` uses in-memory pagination.

| Issue | Current | Required |
|-------|---------|----------|
| ES Query | Nested `terms` with `size: 100` | Composite aggregation with cursor |
| Pagination | JavaScript `.slice()` | ES `after` cursor |
| Response | 72 manufacturers (nested) | 881 combinations (flat) |

Full analysis: [../investigation/BACKEND-PAGINATION-ANALYSIS.md](../investigation/BACKEND-PAGINATION-ANALYSIS.md)

### Implementation Steps

1. **Replace ES query** in `~/projects/data-broker/generic-prime/src/services/elasticsearchService.js`
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

4. **Update controller** in `~/projects/data-broker/generic-prime/src/controllers/specsController.js`
   - Accept `after` parameter instead of (or in addition to) `page`
   - Return cursor in response

5. **Build and deploy updated image**
   ```bash
   cd ~/projects/data-broker/generic-prime
   podman build -f infra/Dockerfile -t localhost/generic-prime-backend-api:v1.2.0 .
   kubectl set image deployment/generic-prime-backend-api \
     backend-api=localhost/generic-prime-backend-api:v1.2.0 -n generic-prime
   ```

6. **Verify fix**
   - Test endpoint returns 881 combinations (paginated)
   - Test cursor-based pagination works
   - Verify frontend displays all combinations

---

## Quick Commands

```bash
# Elasticsearch
kubectl port-forward -n data svc/elasticsearch 9200:9200 &
curl -s "http://localhost:9200/_cluster/health" | jq '.status'

# Backend (via ingress)
curl -s "http://generic-prime.minilab/api/specs/v1/manufacturer-model-combinations?size=20" | jq

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

# K8s
kubectl get pods -n generic-prime
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50

# Git
git status
git add -A && git commit -m "docs: description"
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
**Updated By**: Backend migration session - ready for deployment
