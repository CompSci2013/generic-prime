# Project Status

**Version**: 2.7
**Timestamp**: 2025-12-06T00:00:00Z
**Updated By**: Documentation Restructuring Session

---

## Current State

### Port 4205 (generic-prime) - IN DEVELOPMENT

**Application**: Fully functional Angular 14 discovery interface
- All 4 panels operational (Query Control, Picker, Statistics, Results Table)
- Drag-drop, collapse, and pop-out functionality working
- Dark theme (PrimeNG lara-dark-blue) active
- Panel headers streamlined with consistent compact design pattern

**Backend**: `generic-prime-backend-api:v1.5.0` (Kubernetes)
- Elasticsearch integration: autos-unified (4,887 docs), autos-vins (55,463 docs)
- API endpoint: `http://generic-prime.minilab/api/specs/v1/`

**Domains**: Automobile (only domain currently active)

### Port 4201 (autos-prime-ng) - REFERENCE
- Unaffected, serves as working reference

---

## Known Bugs

| Bug | Component | Severity | Status |
|-----|-----------|----------|--------|
| #13 | p-dropdown (Query Control) | Medium | Not Started |
| #7 | p-multiSelect (Body Class) | Low | Not Started |

**Bug #13**: Keyboard navigation broken with `[filter]="true"`
- Arrow keys should highlight options, currently do nothing
- Enter/Space should select, currently do nothing
- Mouse click works (only workaround)

**Bug #7**: Visual state bug - checkboxes remain checked after clearing filters
- Actual filtering works correctly
- Only visual state is wrong

---

## What Changed This Session

**Documentation Restructuring**:
1. Removed all Gemini references (24 files deleted)
2. Rebuilt CLAUDE.md - Static constraints only, no architecture
3. Rebuilt ORIENTATION.md - Static infrastructure knowledge only
4. Rebuilt PROJECT-STATUS.md - Current snapshot only, no session history
5. Rebuilt NEXT-STEPS.md - Ultra-focused immediate work only
6. Created .claude/commands/bootstrap.md - Clean bootstrap directive
7. Updated README.md and DOCUMENT-MAP.md

**Goals Achieved**:
- Eliminated circular references across documentation
- Reduced token waste from duplicate information
- Clear separation of concerns: CLAUDE (constraints) → ORIENTATION (architecture) → PROJECT-STATUS (current state) → NEXT-STEPS (immediate work)
- `/bootstrap` now reads 4 focused files instead of 8 redundant ones

---

## Next Session Focus

See [NEXT-STEPS.md](NEXT-STEPS.md) for immediate work.

---

**When this status changes, append it to STATUS-HISTORY.md before updating.**
