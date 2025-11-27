# Backend API Updates - Quick Reference

**Last Updated:** 2025-11-23
**Purpose:** Quick guide for updating the Generic-Prime backend API

---

## Backend Location

**All files in one project:** `~/projects/generic-prime/`

```
Backend Source:  ~/projects/generic-prime/backend-specs/
Frontend Source: ~/projects/generic-prime/frontend/
K8s Configs:     ~/projects/generic-prime/k8s/
```

---

## Quick Update Process

### 1. Edit Backend Code

```bash
cd ~/projects/generic-prime/backend-specs/src
nano services/elasticsearchService.js
```

### 2. Build & Deploy

```bash
cd ~/projects/generic-prime/backend-specs

# Build image (increment version: v1.0.1 → v1.0.2)
podman build -t localhost/generic-prime-backend:v1.0.2 .

# Export tar
podman save localhost/generic-prime-backend:v1.0.2 -o generic-prime-backend-v1.0.2.tar

# Import to K3s
sudo k3s ctr images import generic-prime-backend-v1.0.2.tar

# Update deployment manifest
cd ~/projects/generic-prime/k8s
nano backend-deployment.yaml  # Change image version to v1.0.2

# Apply deployment
kubectl apply -f backend-deployment.yaml

# Watch rollout
kubectl rollout status deployment/generic-prime-backend -n generic-prime

# Clean up
cd ~/projects/generic-prime/backend-specs
rm generic-prime-backend-v1.0.2.tar
```

### 3. Test Changes

```bash
# Test health endpoint
curl http://generic-prime.minilab/api/health | jq

# Test API endpoint
curl "http://generic-prime.minilab/api/vehicles/details?page=1&size=2" | jq
```

---

## Current Backend Configuration

**Namespace:** `generic-prime`
**Service:** `generic-prime-backend`
**Pods:** 2 replicas
**Port:** 3000
**Current Version:** v1.0.1 (as of 2025-11-23)

**Image:** `localhost/generic-prime-backend:v1.0.X`
**Deployment File:** `~/projects/generic-prime/k8s/backend-deployment.yaml`

---

## Common Backend Tasks

### Add Comma-Separated Filter Support

**File:** `~/projects/generic-prime/backend-specs/src/services/elasticsearchService.js`

**Pattern to follow** (already implemented for `manufacturer` and `model`):

```javascript
if (filters.fieldName) {
  // Handle comma-separated values (OR logic)
  const values = filters.fieldName.split(',').map(v => v.trim()).filter(v => v);

  if (values.length === 1) {
    // Single value: exact match
    query.bool.filter.push({
      term: { 'field_name.keyword': values[0] }
    });
  } else if (values.length > 1) {
    // Multiple values: OR logic
    query.bool.filter.push({
      bool: {
        should: values.map(val => ({
          term: { 'field_name.keyword': val }
        })),
        minimum_should_match: 1,
      },
    });
  }
}
```

**Fields needing this pattern:**
- ✅ `manufacturer` (line 226-248) - Already implemented
- ✅ `model` (line 250-272) - Already implemented
- ⚠️ `bodyClass` (line 290-296) - **NEEDS UPDATE** (as of 2025-11-23)

---

## Testing Comma-Separated Filters

```bash
# Test single value
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan&size=1" | jq '.total'

# Test multiple values (should return combined count)
curl "http://generic-prime.minilab/api/vehicles/details?bodyClass=Sedan,SUV&size=1" | jq '.total'

# Test manufacturer
curl "http://generic-prime.minilab/api/vehicles/details?manufacturer=Ford,Chevrolet&size=1" | jq '.total'
```

**Expected Results:**
- Single value: Returns count for that value
- Multiple values: Returns OR combined count (sum of both)
- If returns 0: Backend code not updated or pods not restarted

---

## Troubleshooting

### Changes Not Taking Effect

**Check running image version:**
```bash
kubectl get pods -n generic-prime -o jsonpath='{.items[?(@.metadata.labels.app=="generic-prime-backend")].spec.containers[0].image}' | tr ' ' '\n'
```

**Force pod restart:**
```bash
kubectl rollout restart deployment/generic-prime-backend -n generic-prime
```

### Image Not Found in K3s

```bash
# List K3s images
sudo k3s ctr images list | grep generic-prime-backend

# If missing, rebuild and import
cd ~/projects/generic-prime/backend-specs
podman save localhost/generic-prime-backend:vX.X.X -o api.tar
sudo k3s ctr images import api.tar
rm api.tar
```

---

## Version Tracking

Keep versions in sync across:
1. Podman build tag
2. K3s imported image
3. Deployment manifest (`backend-deployment.yaml`)
4. This documentation

**Recommended versioning:**
- Bug fixes: v1.0.X
- New features: v1.X.0
- Breaking changes: vX.0.0

---

## See Also

- **[DEVELOPER-ENVIRONMENT.md](DEVELOPER-ENVIRONMENT.md)** - Complete setup guide
- **[../CLAUDE.md](../CLAUDE.md)** - Framework architecture reference
- **[API-COMPARISON.md](API-COMPARISON.md)** - API endpoint documentation (if exists)

---

**Quick Links:**
- Backend Source: `/home/odin/projects/generic-prime/backend-specs`
- K8s Configs: `/home/odin/projects/generic-prime/k8s`
- Frontend Source: `/home/odin/projects/generic-prime/frontend`
