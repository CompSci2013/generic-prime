#!/bin/bash
# End a bug fix session and show results
#
# Usage: .claude/scripts/end-fix.sh

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_FILE="$PROJECT_DIR/.claude/fix-state.json"
LOG_FILE="$PROJECT_DIR/.claude/fix-log.txt"

if [ ! -f "$STATE_FILE" ]; then
  echo "No active fix session found."
  exit 0
fi

echo "=== Fix Session Summary ==="
echo ""

BUG_ID=$(jq -r '.bug_id' "$STATE_FILE")
STATUS=$(jq -r '.status' "$STATE_FILE")
ATTEMPTS=$(jq -r '.attempt' "$STATE_FILE")
STARTED=$(jq -r '.started_at' "$STATE_FILE")

echo "Bug ID: $BUG_ID"
echo "Status: $STATUS"
echo "Attempts: $ATTEMPTS"
echo "Started: $STARTED"
echo ""

echo "=== Attempt History ==="
jq -r '.history[] | "Attempt \(.attempt): \(.result) (\(.strategy))"' "$STATE_FILE" 2>/dev/null || echo "No history recorded"
echo ""

# Archive the session
ARCHIVE_DIR="$PROJECT_DIR/.claude/fix-archive"
mkdir -p "$ARCHIVE_DIR"
ARCHIVE_FILE="$ARCHIVE_DIR/${BUG_ID}-$(date +%Y%m%d-%H%M%S).json"
cp "$STATE_FILE" "$ARCHIVE_FILE"
echo "Session archived to: $ARCHIVE_FILE"

# Clean up
rm -f "$STATE_FILE"
echo "State file removed. Fix session ended."
