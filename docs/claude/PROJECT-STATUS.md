# Project Status

**Version**: 5.75
**Timestamp**: 2025-12-27T15:09:00-05:00
**Updated By**: Session 66 - Angular 20 + PrimeNG 20 Upgrade

---

## Session 66 Summary: Angular 20 + PrimeNG 20 Upgrade

**Status**: ✅ **COMPLETED** - Full Angular 20 + PrimeNG 20, production ready

### What Was Accomplished

**Angular 20 Upgrade**:
1. ✅ Angular 19.2.17 → 20.3.15
2. ✅ Angular CDK 19.2.19 → 20.2.14
3. ✅ PrimeNG 19.1.7-lts → 20.4.0
4. ✅ @primeng/themes 21.0.2 → 20.4.0
5. ✅ Build tools updated to v20
6. ✅ Version bumped to 6.0.0

**PrimeNG 20 Breaking Changes Fixed**:
1. ✅ DropdownModule renamed to SelectModule (`p-dropdown` → `p-select`)
2. ✅ Row expansion template: `pTemplate="rowexpansion"` → `#expandedrow`
3. ✅ pRowToggler directive broken in controlled mode - replaced with programmatic `table.toggleRow()`
4. ✅ Checkbox dark theme visibility - added explicit CSS borders
5. ✅ Panel dark theme - added CSS overrides for statistics panel
6. ✅ Track expressions updated to use unique fields (NG0956 warning)

**Components Updated**:
- results-table.component (html, ts, scss)
- basic-results-table.component (html, ts)
- query-control.component (html, ts, scss)
- query-panel.component (html, ts, scss)
- statistics-panel.component (scss)
- ui-kit.module.ts
- styles.scss
- app.config.ts

### Current Stack

| Component | Version |
|-----------|---------|
| Angular | 20.3.15 |
| Angular CDK | 20.2.14 |
| PrimeNG | 20.4.0 |
| TypeScript | 5.8.3 |
| zone.js | 0.15.0 |
| Frontend | **6.0.0** |

### Branch

- `feature/angular-15-upgrade` (contains all Angular 14→20 upgrades)
- **Pushed to GitHub**: cc3e66e
- **Pending**: Merge to main, deploy v6.0.0 to K3s

---

## Known Bugs

| Bug | Component | Severity | Status |
|-----|-----------|----------|--------|
| #13 | p-dropdown (Query Control) | Medium | ✅ **FIXED - Session 56** |
| #14 | Pop-Out Filter Sync | Medium | ✅ **FIXED - Session 56** |
| #7 | p-multiSelect (Body Class) | Low | Pending |
| Pop-out re-render | BasicResultsTable | Medium | Deferred |

---

## Priority Order (Updated)

| Phase | Work | Priority | Status |
|-------|------|----------|--------|
| **1** | **Deploy v6.0.0 to K3s** | **HIGH** | **Pending** |
| **2** | **Merge feature/angular-15-upgrade to main** | **HIGH** | **Ready** |
| **3** | **IdP Phase 1: Deploy Keycloak Infrastructure** | **HIGH** | Pending |
| 4 | Fix pop-out re-render bug | Medium | Deferred |
| 5 | Fix Bug #7 (multiselect visual state) | Low | Pending |

---

**Last Updated**: 2025-12-27T15:09:00-05:00 (Session 66 - Angular 20 Upgrade)
