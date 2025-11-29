# Project Status

**Version**: 2.2
**Timestamp**: 2025-11-29T15:30:00Z
**Updated By**: Domain Configuration Refactoring Session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT
- **Domain configuration refactored** - Now supports dynamic registration of multiple domains.
- **Compilation errors fixed** - Application now compiles successfully after refactoring.
- Discover page in **ISOLATION MODE** - testing Query Control + Picker + Results Table
- Backend at `generic-prime-backend-api:v1.5.0`

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected by changes
- Continues to serve as working reference

---

## Session Summary (2025-11-29)

### Domain Configuration Refactoring

Refactored the domain configuration to support multiple domains dynamically. This addresses a key architectural goal of the project.

| Component | Change |
|-----------|--------|
| `automobile.domain-config.ts` | Created a `DOMAIN_PROVIDER` for dynamic registration. |
| `domain-providers.ts` | Created a centralized array of domain providers. |
| `domain-config-registry.service.ts` | Added `registerDomainProviders` method to dynamically load domains. |
| `app.component.ts` | Application now registers all domains at startup. |
| `app.module.ts` | Removed static, hardcoded domain configuration. |

### Bug Fixes

| Bug | Description | Resolution |
|-----|-------------|------------|
| Multiple | Compilation errors after refactoring | Fixed 3 separate compilation errors in `resource-management.service.ts` and `domain-config.interface.ts`. |

---

## Governing Tactic

**Validate the new domain architecture.**

The refactoring is complete. The next logical step is to prove the new architecture by adding a second domain.

---

## Known Facts

| Resource | Value | Notes |
|----------|-------|-------|
| Elasticsearch Cluster | `elasticsearch.data.svc.cluster.local:9200` | K8s internal |
| Index: Vehicle Specs | `autos-unified` | 4,887 documents |
| Index: VIN Records | `autos-vins` | 55,463 documents |
| Unique Manufacturers | 72 | Verified via ES |
| Unique Mfr-Model Combos | 881 | Working in picker |
| Unique Body Classes | 12 | Via /agg/body_class |
| **Backend Source** | `~/projects/data-broker/generic-prime/src/` | JavaScript/Express |
| **Backend Image** | `localhost/generic-prime-backend-api:v1.5.0` | **Current** |

---

## Critical Bugs

| Bug | Severity | Status | Summary |
|-----|----------|--------|---------|
| #13 | Medium | Not started | Dropdown keyboard navigation (arrow keys, Enter/Space) broken |
| #7 | Low | Not started | Checkboxes stay checked after clearing |

---

## Next Session

1. **Add a new "agriculture" domain** - Create a new domain configuration to prove the new architecture.
2. **Fix Bug #13** - Dropdown keyboard navigation (may be PrimeNG issue)
3. **Fix Bug #7** - Checkbox visual state

See [NEXT-STEPS.md](NEXT-STEPS.md) for details.

---

**When this status changes, copy it to STATUS-HISTORY.md before updating.**
