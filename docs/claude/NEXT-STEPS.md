# Next Steps

**Current Session**: Session 68 - Visual Testing Pipeline Implementation
**Status**: ✅ COMPLETED - Pipeline created

---

## IMMEDIATE ACTION 1: Test Visual Pipeline

**Priority**: MEDIUM
**Scope**: Run the pipeline against Mimir to verify Ollama integration

**Prerequisites**:
1. Dev server running: `npm run dev:server`
2. Mimir accessible: `http://mimir:11434`

**Steps**:
1. Run screenshot collector only:
   ```bash
   cd frontend
   npm run visual-collect
   ```
2. If screenshots captured, run full pipeline:
   ```bash
   npm run visual-pipeline
   ```

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

## IMMEDIATE ACTION 3: Merge to Main

**Priority**: HIGH
**Scope**: Merge feature branch after deployment verification

**Steps**:
1. Verify production is stable
2. Merge `feature/angular-15-upgrade` to `main`
3. Push to origin

---

## SESSION 68 COMPLETION SUMMARY

**Primary Accomplishments**:
- ✅ Updated `/monsterwatch` command (v3.0) - Removed Gemini, removed polling
- ✅ Updated ORIENTATION.md with Mimir model inventory (14 models)
- ✅ Created visual testing pipeline in `frontend/scripts/visual-pipeline/`
- ✅ 8 TypeScript modules with real Ollama API integration
- ✅ Created Cline slash command `/fix-visual-bugs`
- ✅ Added npm scripts and dependencies

**Key Files Created**:
- `frontend/scripts/visual-pipeline/*.ts` (8 files)
- `.claude/commands/fix-visual-bugs.md`

**Current State**:
- Branch: feature/cline-experiment
- Two pipeline implementations (Claude + Cline) coexist
- Pipeline ready for testing with Mimir

---

**Last Updated**: 2026-01-01T01:49:00-05:00 (Session 68)
