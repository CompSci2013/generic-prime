#!/bin/bash

###############################################################################
# Development Server + E2E Test Watch Mode Script
#
# Purpose: Run development server and Playwright in watch mode simultaneously
#
# Usage:
#   ./scripts/dev-with-tests.sh
#
# This script will:
#   1. Start Angular dev server on port 4205
#   2. Start Playwright test server on port 9323 in watch mode
#   3. Display both servers in the terminal for monitoring
#
# Windows Browser Access:
#   - Development app: http://192.168.0.244:4205
#   - Test results: http://192.168.0.244:9323
#
# Stop: Press Ctrl+C to stop both servers
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if npm modules are installed
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found${NC}"
    echo "Run: npm install"
    exit 1
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Development Server + E2E Test Watch Mode${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Starting services...${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill %1 2>/dev/null || true
    kill %2 2>/dev/null || true
    wait 2>/dev/null || true
    echo -e "${RED}Services stopped${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start dev server and test runner in background
echo -e "${GREEN}[1] Starting Angular dev server on port 4205...${NC}"
echo "    Access: http://192.168.0.244:4205"
echo ""

echo -e "${GREEN}[2] Starting Playwright test server on port 9323...${NC}"
echo "    Access: http://192.168.0.244:9323"
echo ""
echo "================================================"
echo ""

# Run both servers concurrently
# Dev server in first terminal, test runner in second
npx concurrently \
  --kill-others-on-fail \
  --prefix "[DEV]" \
  --prefix "[TEST]" \
  "ng serve --host 0.0.0.0 --port 4205" \
  "npx playwright test --ui --host 0.0.0.0"

# Wait for user to stop (Ctrl+C)
wait
