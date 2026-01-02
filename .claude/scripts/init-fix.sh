#!/bin/bash
# Initialize a bug fix session
#
# Usage: .claude/scripts/init-fix.sh <bug_id> <test_path>
# Example: .claude/scripts/init-fix.sh BUG-001 e2e/regression/bug-001-keyboard-selection.spec.ts

set -e

BUG_ID=${1:?"Usage: init-fix.sh <bug_id> <test_path>"}
TEST_PATH=${2:?"Usage: init-fix.sh <bug_id> <test_path>"}
MAX_ATTEMPTS=${3:-3}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
STATE_FILE="$PROJECT_DIR/.claude/fix-state.json"

# Verify test file exists
if [ ! -f "$PROJECT_DIR/frontend/$TEST_PATH" ]; then
  echo "ERROR: Test file not found: frontend/$TEST_PATH" >&2
  exit 1
fi

# Create state file
cat > "$STATE_FILE" << EOF
{
  "bug_id": "$BUG_ID",
  "test_path": "$TEST_PATH",
  "attempt": 1,
  "max_attempts": $MAX_ATTEMPTS,
  "status": "in_progress",
  "strategy": "local",
  "last_error": "",
  "started_at": "$(date -Iseconds)",
  "history": []
}
EOF

echo "Fix session initialized for $BUG_ID"
echo "State file: $STATE_FILE"
echo ""
echo "Configuration:"
echo "  Test path: frontend/$TEST_PATH"
echo "  Max attempts: $MAX_ATTEMPTS"
echo "  Current strategy: local (attempt 1)"
echo ""
echo "Start Claude Code to begin the fix loop."
echo "Claude will continue working until tests pass or max attempts reached."
