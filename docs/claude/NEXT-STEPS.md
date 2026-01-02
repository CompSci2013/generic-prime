# Next Steps

**Current Session**: Session 69 - Autonomous Fix Loop Implementation
**Previous Session**: Session 68 - Merged /bye and /exit Commands
**Status**: v7.3, Autonomous fix loop infrastructure complete

---

## IMMEDIATE ACTION: Test Autonomous Fix Loop with BUG-001

**Priority**: HIGH (Testing new infrastructure)
**Scope**: Run unattended bug fix session

### Prerequisites

1. **Restart Claude Code** (required for new permissions to take effect)

### Steps to Run Autonomous Fix Loop

1. **Initialize the fix session**:
   ```bash
   .claude/scripts/init-fix.sh BUG-001 e2e/regression/bug-001-keyboard-selection.spec.ts
   ```

2. **Start Claude with the fix prompt**:
   ```
   Fix the bug described in .claude/fix-state.json. The regression test at e2e/regression/bug-001-keyboard-selection.spec.ts must pass. Use strategy: local (attempt 1).
   ```

3. **Walk away** - The loop will:
   - Attempt 1: Local code analysis → fix → test runs automatically
   - If fail → Attempt 2: Web search for solutions → fix → test runs
   - If fail → Attempt 3: Deep investigation → fix → test runs
   - If fail → Mark DEFERRED and stop

### The Bug to Fix

**BUG-001**: Keyboard selection broken in filter dropdown
- **Location**: `frontend/src/framework/components/query-control/query-control.component.ts:233`
- **Issue**: Uses PrimeNG 20 selector (`.p-select-items .p-highlight`)
- **Fix**: Change to PrimeNG 21 selector (`.p-select-overlay .p-select-option.p-focus`)

### Verifying Results

After the session ends:
```bash
cat .claude/fix-state.json  # Check status (FIXED or DEFERRED)
cat .claude/fix-log.txt     # View detailed log
ls .claude/fix-archive/     # View archived sessions
```

---

## ALTERNATIVE: IdP Phase 1 (If Fix Loop Works)

**Priority**: HIGH (Architecture)
**Scope**: Deploy Keycloak to K3s

**Reference**: `docs/infrastructure/idp/IDENTITY-STRATEGY.md`

**Steps**:
1. Create K3s manifests for Postgres in `platform` namespace
2. Create K3s manifests for Keycloak
3. Configure Ingress for `auth.minilab`
4. Create test users (Bob/SuperAdmin, Alice/AutoAdmin, Frank/Viewer)

---

## SESSION 69 COMPLETION SUMMARY

**Primary Accomplishments**:
1. ✅ Validated Query Control user stories (Epic 1)
2. ✅ Discovered and documented BUG-001 (keyboard selection)
3. ✅ Implemented autonomous fix loop (Option B: Stop Hook + State File)
4. ✅ Configured permissions for unattended operation
5. ✅ Created regression test for BUG-001
