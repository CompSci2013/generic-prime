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

# Start dev server in background (takes ~15-20 seconds to build)
echo "Starting dev server..."
podman exec -d generic-prime-e2e bash -c "cd /app/frontend && npm start -- --host 0.0.0.0 --port 4205 2>&1 | tee /tmp/dev-server.log" > /dev/null

# Wait for dev server to be ready (watch for "Compiled successfully" message)
echo "Waiting for dev server to compile and start..."
for i in {1..60}; do
  if podman exec generic-prime-e2e sh -c "grep -q 'Compiled successfully' /tmp/dev-server.log 2>/dev/null" 2>/dev/null; then
    echo "Dev server ready!"
    break
  fi
  sleep 1
  if [ $i -eq 60 ]; then
    echo "Dev server failed to start after 60 seconds"
    exit 1
  fi
done

sleep 2

# Run tests (app should now be at http://localhost:4205)
podman exec -it generic-prime-e2e bash -c "cd /app/frontend && npx playwright test"
