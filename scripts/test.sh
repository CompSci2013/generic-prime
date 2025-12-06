#!/bin/bash
# Run E2E tests using the e2e container with bind mounts
# Usage: ./scripts/run-e2e-tests.sh
#
# Container management: Start container with source code mounted, but NOT node_modules
# This allows test file changes without rebuilding, while keeping Playwright from the container build

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Start or recreate the e2e container with proper bind mounts
# -v src mount: only mount source files, exclude node_modules
# -v node_modules volume: keep container's node_modules (with Playwright)
podman stop generic-prime-e2e 2>/dev/null || true
podman rm generic-prime-e2e 2>/dev/null || true

podman run -d --name generic-prime-e2e --network host \
  -v "$REPO_ROOT/frontend/src:/app/frontend/src:z" \
  -v "$REPO_ROOT/frontend/e2e:/app/frontend/e2e:z" \
  -v "$REPO_ROOT/frontend/playwright.config.ts:/app/frontend/playwright.config.ts:z" \
  -v "$REPO_ROOT/frontend/tsconfig.json:/app/frontend/tsconfig.json:z" \
  -w /app \
  localhost/generic-prime-e2e:latest \
  > /dev/null

# Wait for container to be ready
sleep 2

# Run tests with IN_DOCKER env var to skip webServer config
podman exec -it generic-prime-e2e bash -c "cd /app/frontend && IN_DOCKER=true npm run test:e2e"
