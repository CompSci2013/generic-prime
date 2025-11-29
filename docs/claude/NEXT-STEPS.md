# Next Steps

**Purpose**: Actionable items for the current session.
**Update Policy**: Update this file AND [PROJECT-STATUS.md](PROJECT-STATUS.md) before ending each session.

---

## Session Start Checklist

1. Read [ORIENTATION.md](ORIENTATION.md) (~3 min)
2. Read [PROJECT-STATUS.md](PROJECT-STATUS.md) for current state and approach
3. Review this file for immediate actions
4. Discuss with developer before starting work

---

## Current Priority: Validate Domain Architecture

**Status**: The domain configuration has been refactored to support multiple domains. The next step is to validate this new architecture.

### Governing Tactic (from PROJECT-STATUS.md)

> **Validate the new domain architecture.**
> The refactoring is complete. The next logical step is to prove the new architecture by adding a second domain.

---

## Completed This Session

- **Domain Configuration Refactoring** - Decoupled domain configuration from the main application module to allow for dynamic registration of multiple domains.
- **Bug Fixes** - Fixed compilation errors introduced during the refactoring.

---

## Immediate Actions

### 1. Add "Agriculture" Domain (PRIORITY)

Create a new "agriculture" domain to validate the new flexible domain architecture. This will involve:
- Creating a new folder `frontend/src/domain-config/agriculture/`
- Defining a new set of models, adapters, and configs for the agriculture domain.
- Adding the new domain provider to the `DOMAIN_PROVIDERS` array.
- Creating a simple way to switch between domains in the UI (e.g., a dropdown in the header).

### 2. Fix Bug #13 - Dropdown Keyboard Navigation

**Problem**: PrimeNG p-dropdown with `[filter]="true"` keyboard navigation broken:
- Down arrow should highlight next option
- Up arrow should highlight previous option
- Enter/Space should select highlighted option
- Currently: Arrow keys do nothing, can only click

**Investigation needed**:
- Check PrimeNG version compatibility
- Check if `[filter]="true"` disables keyboard nav
- Try PrimeNG accessibility settings

### 3. Fix Bug #7 (Checkboxes)

Low priority checkbox visual state bug - checkboxes stay checked after clearing.

---

## Current Discover Page State

**ISOLATION MODE**: Query Control + Picker + Results Table are rendered

```
discover.component.html:
├── Header (with isolation notice)
├── Query Control panel (with pop-out button)
├── Picker panel (with pop-out button)
├── Results Table panel (with pop-out button)
├── Debug panel (shows URL state JSON)
└── [REMOVED: statistics-panel]
```

---

## Key Files for Current Work

| File | Purpose |
|------|---------|
| `frontend/src/domain-config/` | Directory for all domain configurations. |
| `frontend/src/domain-config/domain-providers.ts` | Centralized array of all domain providers. |
| `app.component.ts` | Where domains are registered at startup. |


---

## Quick Commands

```bash
# Frontend dev server
podman exec -it generic-prime-frontend-dev npm start -- --host 0.0.0.0 --port 4205

# Check backend pods
kubectl get pods -n generic-prime

# Backend logs
kubectl logs -n generic-prime -l app=generic-prime-backend-api --tail=50
```

---

## Session End Checklist

Before ending session:

1. [x] Archive current PROJECT-STATUS.md to STATUS-HISTORY.md
2. [x] Update PROJECT-STATUS.md with:
   - New version number (increment)
   - New timestamp
   - Findings and decisions
3. [x] Update this NEXT-STEPS.md with next actions
4. [ ] Commit changes: `git add -A && git commit -m "docs: session summary"`
5. [ ] Push if appropriate

---

**Last Updated**: 2025-11-29
**Updated By**: Domain Configuration Refactoring Session
