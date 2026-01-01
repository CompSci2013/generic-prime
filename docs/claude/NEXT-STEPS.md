# Next Steps

**Current Session**: Session 69 - Mimir Models & Cleanup
**Status**: ✅ COMPLETED - Model tooling fixed, session cruft cleaned

---

## IMMEDIATE ACTION 1: Fix Query Panel Bugs

**Priority**: HIGH
**Scope**: Fix 4 bugs identified during QA testing

**Bugs to Fix**:
1. **Autocomplete [object Object]** - Manufacturer/Model autocomplete values serialize incorrectly
2. **Year range filters don't apply** - UI inputs don't trigger filter updates
3. **Year range doesn't populate from URL** - URL params don't populate the inputs

**Investigation Notes**:
- The autocomplete `onSelect` event emits `$event` which may be an object, not a string
- Need to check if `$event.value` or `$event` is the correct value to use
- Year range inputs may not be bound correctly in query-panel.component.html

**Files to Investigate**:
- `frontend/src/framework/components/query-panel/query-panel.component.html` (lines 106-129 for autocomplete, 50-73 for range)
- `frontend/src/framework/components/query-panel/query-panel.component.ts` (onFilterChange, onAutocompleteSearch)

---

## IMMEDIATE ACTION 2: Deploy v6.0.0 to K3s

**Priority**: HIGH
**Scope**: Build and deploy Angular 20 production image

**Steps**:
1. Build production Docker image:
   ```bash
   cd /home/odin/projects/generic-prime/frontend
   podman build -t localhost/generic-prime-frontend:v6.0.0 -f Dockerfile.prod .
   ```
2. Import into K3s:
   ```bash
   podman save localhost/generic-prime-frontend:v6.0.0 -o /tmp/frontend-v6.0.0.tar
   sudo k3s ctr images import /tmp/frontend-v6.0.0.tar
   ```
3. Deploy:
   ```bash
   kubectl -n generic-prime set image deployment/generic-prime-frontend frontend=localhost/generic-prime-frontend:v6.0.0
   kubectl -n generic-prime rollout status deployment/generic-prime-frontend
   ```
4. Verify at http://generic-prime.minilab (should show v6.0.0)

---

## SESSION 69 COMPLETION SUMMARY

**Primary Accomplishments**:
- ✅ Fixed `mimir-models` bash function - SIZE and CONTEXT columns now accurate
- ✅ Methodically inspected all 14 Ollama models on Mimir
- ✅ Updated `~/ollama-model-variants.md` with RoPE scaling documentation
- ✅ Cleaned up session cruft (15 screenshots, old reports)
- ✅ Preserved valuable artifacts (REQUIREMENTS.md, QA-TEST-MANUAL.md, pipelines)

**Key Files Modified**:
- `~/.bashrc` - mimir-models function rewritten
- `~/ollama-model-variants.md` - RoPE scaling guidance added

**Not Fixed (Documented)**:
- 4 QA bugs identified but not fixed (per user request to undo code changes)

**Current State**:
- Branch: feature/cline-experiment
- Version: 6.0.0
- Build: Passing
- Mimir models: All 14 models documented with accurate metrics

---

**Last Updated**: 2026-01-01T09:35:00-05:00 (Session 69)
