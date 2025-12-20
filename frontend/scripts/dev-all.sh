#!/bin/bash

###############################################################################
# All-in-One Development Script
#
# Purpose: Run dev server, test runner, and report server simultaneously
#
# Usage:
#   ./scripts/dev-all.sh
#
# This starts ALL THREE services in one terminal:
#   1. Angular dev server on port 4205
#   2. Playwright UI mode on port 3000 (auto-runs tests)
#   3. Test report server on port 9323
#
# Windows Browser Access:
#   - Dev app: http://192.168.0.244:4205
#   - Playwright UI: http://localhost:3000
#   - Test results: http://192.168.0.244:9323
#
# Workflow:
#   1. Start this script
#   2. Edit code in VS Code
#   3. Watch results automatically in Playwright UI
#   4. View test failures in report browser
#
# Stop: Press Ctrl+C to stop all services
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if npm modules are installed
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found${NC}"
    echo "Run: npm install"
    exit 1
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}All-in-One Development Environment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Starting all services...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    kill %1 2>/dev/null || true
    kill %2 2>/dev/null || true
    kill %3 2>/dev/null || true
    wait 2>/dev/null || true
    echo -e "${RED}All services stopped${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

echo -e "${CYAN}[1]${NC} ${GREEN}Angular Dev Server${NC} - port 4205"
echo "    URL: http://192.168.0.244:4205"
echo "    • Auto-recompiles on file changes"
echo "    • Hot module reloading enabled"
echo ""

echo -e "${CYAN}[2]${NC} ${GREEN}Playwright UI Mode${NC} - port 3000"
echo "    URL: http://localhost:3000"
echo "    • Auto-reruns tests on code changes"
echo "    • Step-through test execution"
echo "    • Inspect DOM during tests"
echo ""

echo -e "${CYAN}[3]${NC} ${GREEN}Test Report Server${NC} - port 9323"
echo "    URL: http://192.168.0.244:9323"
echo "    • Shows all test results"
echo "    • Updates after each test run"
echo ""

echo "================================================"
echo -e "${YELLOW}Development Workflow:${NC}"
echo "  1. Edit code in VS Code"
echo "  2. See changes in dev browser (4205)"
echo "  3. Tests auto-run in Playwright UI (3000)"
echo "  4. Results visible in report browser (9323)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "================================================"
echo ""

# Run all three services concurrently
npx concurrently \
  --kill-others-on-fail \
  --prefix "[DEV] " \
  --prefix "[TEST] " \
  --prefix "[REPORT] " \
  --prefix-colors "cyan,green,yellow" \
  "ng serve --host 0.0.0.0 --port 4205" \
  "npx playwright test --ui --host 0.0.0.0" \
  "npx playwright show-report --host 0.0.0.0"

# Wait for user to stop (Ctrl+C)
wait
