# Bug Fix Session Instructions

**Purpose**: Special session prompt for implementing bug fixes in generic-prime.

**Context**: This repository has two unresolved bugs. A reference document explains how similar bugs were resolved in another codebase, providing implementation patterns and lessons learned.

---

## Session Startup Instructions

For this session, do NOT use any context from past chat sessions.
We are starting FRESH!

Shell cwd is ~/projects/generic-prime - do not change it.

You are an expert in Angular 14 application development and Web Applications architecture.

### BOOTSTRAP: Read the following files in order before responding:

1. `docs/claude/ORIENTATION.md`
2. `docs/claude/PROJECT-STATUS.md`
3. `docs/claude/NEXT-STEPS.md`
4. **`docs/claude/BUG-REFERENCE.md`** ← Read this: Cross-repository bug analysis and implementation patterns

Do not verify with builds or trying to run the application. I do these things in a separate ssh session.

---

## After Reading, Provide:

- A brief summary of the current project state (from PROJECT-STATUS.md)
- Verify: Do NEXT-STEPS.md Immediate Actions align with the Governing Tactic? If not, flag it and fix NEXT-STEPS.md before proceeding.
- **Verify: Are the unresolved bugs (#13, #7) explicitly listed in NEXT-STEPS.md as priorities?** If not, add them.
- The recommended next actions (from NEXT-STEPS.md)
- Ask what I would like to work on

---

## Special Focus: Unresolved Bugs

This session has a special focus on resolving the **two remaining open bugs**:

### Bug #13: Dropdown Keyboard Navigation (MEDIUM PRIORITY)
- **Status**: Not started
- **Affected Component**: PrimeNG p-dropdown with `[filter]="true"`
- **Problem**: Arrow keys and Enter/Space don't work; only mouse selection works
- **Reference**: See `BUG-REFERENCE.md` section "Bug #13: Dropdown Keyboard Navigation"
- **Recommended Solutions**:
  1. PrimeNG version check (may need upgrade)
  2. Use p-multiSelect alternative (pattern proven in reference)
  3. Custom keyboard handler with `@HostListener`

### Bug #7: Checkbox Visual State (LOW PRIORITY)
- **Status**: Not started
- **Affected Component**: p-multiSelect checkboxes
- **Problem**: Checkboxes remain visually checked after clearing filters
- **Reference**: See `BUG-REFERENCE.md` section "Bug #7: Checkbox Visual State"
- **Recommended Solutions**:
  1. Explicit state reset in clearFilters() method
  2. Two-way binding verification with `[(ngModel)]`
  3. Check change detection in filter clearing logic

---

## Reference Document

**BUG-REFERENCE.md** provides:
- Detailed problem descriptions for both unresolved bugs
- Implementation patterns showing how these bugs were resolved elsewhere
- Code examples and architectural patterns
- Testing recommendations and success criteria

**Location**: `docs/claude/BUG-REFERENCE.md`

Use this document as a guide for implementing fixes, but make implementation decisions appropriate for this codebase.

---

## Session Goal

**Primary Goal**: Fix Bug #13 and/or Bug #7

**Success Criteria**:
- [ ] Bug fix implemented and working
- [ ] Tests verify the fix works as expected
- [ ] Changes committed with detailed commit messages
- [ ] PROJECT-STATUS.md updated with results

**If Time Permits**:
- Re-enable any previously disabled panels or features
- Test integration with the full application
- Performance verification after fixes

---

## SESSION END PROTOCOL

Before ending, do:

1. **Archive PROJECT-STATUS.md to STATUS-HISTORY.md**
   - Copy current PROJECT-STATUS.md content
   - Append to STATUS-HISTORY.md under a new version section with separator

2. **Update PROJECT-STATUS.md**
   - Bump version number (e.g., 2.6 → 2.7)
   - Update timestamp to current UTC
   - Document bugs fixed or progress made (if any)
   - Update "Current State" section with session results
   - Update "Governing Tactic" if strategy changed
   - Update "Critical Bugs" section with status changes

3. **Update NEXT-STEPS.md**
   - Document completed items
   - List new priorities for next session
   - Update "Immediate Actions" section
   - Clear or update completed tasks

4. **Commit changes**
   ```bash
   git add -A
   git commit -m "docs: session summary - [brief description of work done]"
   ```

---

## Testing Checklist

When implementing bug fixes, verify with these test cases:

**For Bug #13 (Keyboard Navigation)**:
- [ ] Focus dropdown and press Down arrow → option highlights
- [ ] Press Up arrow → previous option highlights
- [ ] Press Enter/Space → highlighted option selects
- [ ] Selected value updates in component and URL
- [ ] Works with search filter enabled
- [ ] Works with search filter disabled
- [ ] Works with multiple dropdowns on page

**For Bug #7 (Checkbox Visual State)**:
- [ ] Select multiple values in multiselect
- [ ] Click Clear All or clear filter
- [ ] All checkboxes update to unchecked state visually
- [ ] Actual filter state matches visual state
- [ ] URL parameters cleared correctly
- [ ] Results table updates with unfiltered data
- [ ] Re-selecting filters works after clearing

---

## Key Files to Reference

**Bug Fix Implementation**:
- `src/app/features/discover/components/results-table/results-table.component.ts` - Where filters are applied
- `src/app/features/discover/components/results-table/results-table.component.html` - Template with dropdowns/multiselects
- `src/app/features/discover/components/query-control/query-control.component.ts` - Query control and Clear All
- `src/app/features/discover/discover.component.ts` - Main page state management

**Reference Materials**:
- `docs/claude/BUG-REFERENCE.md` - Implementation patterns and solutions
- `docs/INFRASTRUCTURE-ANALYSIS.md` - Backend API contracts
- `docs/specs/04-state-management-specification.md` - URL/filter state management

---

## Notes for Fresh Sessions

- **BUG-REFERENCE.md is Essential**: Read it to understand the problem context and proven solutions
- **Don't Skip the Reference**: The document contains implementation patterns you'll need
- **Test First**: Use the testing checklist before considering a fix complete
- **Make Implementation Decisions**: Adapt the reference patterns to fit this codebase's architecture
- **Document Your Work**: Update PROJECT-STATUS.md and NEXT-STEPS.md as you progress

---

**Last Updated**: 2025-12-01
**For**: Bug fix sessions in generic-prime
