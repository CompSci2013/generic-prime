# Deploy to Kubernetes

**This command builds and deploys the Generic Prime application to Kubernetes on Loki.**

---

## Overview

Deployment involves 3 phases:
1. **Build**: Create production Docker image on Thor
2. **Import**: Transfer image to Kubernetes containerd on Loki
3. **Deploy**: Apply Kubernetes manifests and verify pods

---

## Prerequisites

- SSH access to `loki` (Kubernetes master)
- SSH access to `thor` (build server / k8s node)
- Docker installed on Thor
- kubectl configured on Loki
- The `generic-prime` namespace exists

---

## Directive

Execute the following deployment steps:

### Phase 1: Build Production Image on Thor

```bash
# Build the production Docker image
ssh thor "cd /home/odin/projects/generic-prime/frontend && docker build -f Dockerfile.prod -t generic-prime-frontend:prod ."
```

**Expected output**: Multi-stage build completing with nginx image

### Phase 2: Transfer Image to Kubernetes

```bash
# Save image to tarball, pipe to Loki, import to containerd
ssh thor "docker save generic-prime-frontend:prod" | ssh loki "sudo ctr -n k8s.io images import -"
```

**Expected output**: Image imported successfully into k8s.io namespace

### Phase 3: Deploy to Kubernetes

```bash
# Apply all Kubernetes manifests
ssh loki "kubectl apply -f /home/odin/projects/generic-prime/k8s/"

# Restart deployment to pick up new image
ssh loki "kubectl rollout restart deployment/generic-prime-frontend -n generic-prime"

# Wait for rollout to complete
ssh loki "kubectl rollout status deployment/generic-prime-frontend -n generic-prime --timeout=120s"
```

**Expected output**: "deployment 'generic-prime-frontend' successfully rolled out"

### Phase 4: Verify Deployment

```bash
# Check pod status
ssh loki "kubectl get pods -n generic-prime -l app=generic-prime-frontend"

# Check service endpoints
ssh loki "kubectl get svc -n generic-prime"

# Quick health check
ssh loki "kubectl exec -n generic-prime deploy/generic-prime-frontend -- curl -s localhost/health || echo 'Health endpoint not configured'"
```

---

## Troubleshooting

If pods are not starting:
```bash
# Check pod events
ssh loki "kubectl describe pod -n generic-prime -l app=generic-prime-frontend"

# Check logs
ssh loki "kubectl logs -n generic-prime -l app=generic-prime-frontend --tail=50"
```

If image pull fails:
```bash
# Verify image exists in containerd
ssh loki "sudo ctr -n k8s.io images ls | grep generic-prime"
```

---

## Architecture Reference

- **Image**: `localhost/generic-prime-frontend:prod`
- **Namespace**: `generic-prime`
- **Deployment**: `generic-prime-frontend` (2 replicas)
- **Service**: ClusterIP on port 80
- **Ingress**: `generic-prime.minilab` via Traefik
- **Node Selector**: `kubernetes.io/hostname: thor`

---

## Post-Deployment

After successful deployment:
1. Access the application at `http://generic-prime.minilab/`
2. Verify the application loads correctly
3. Test key functionality (filters, pop-outs, picker)

---

**Version**: 1.0
**Created**: 2025-12-25
**Purpose**: Automate production deployment to Kubernetes
**Audience**: Claude Code sessions requiring deployment
