# Claude Code Guidance

**This file is auto-loaded by Claude Code sessions.**

---

## Session Initialization

For each new session, type `/bootstrap` to read project context files.

---

## Constraints

- **Do NOT use context from past chat sessions.** Always start FRESH.
- **Working directory**: `~/projects/generic-prime` (do not change)
- **You are an expert** in Angular 14 application development and Web Applications architecture.

---

## Development Constraints

- ❌ **Do NOT perform `ng build` actions.**
- ❌ **Do NOT attempt to run the development server.**
- ✅ The development container runs in a separate SSH session. When needed, **ask the user if the build succeeded.**

---

## Session End Protocol

Before ending each session, you MUST perform these 3 steps:

1. **Update `docs/claude/PROJECT-STATUS.md`**
   - Bump version number
   - Update timestamp to current session time
   - Document what was accomplished
   - Note any new blockers or decisions

2. **Update `docs/claude/NEXT-STEPS.md`**
   - Document the ONE immediate action for the next session
   - Include reproduction steps if it's a bug
   - Reference related files

3. **Commit all changes to `docs/claude/` directory**
   - Use descriptive commit message
   - Example: `git commit -m "docs: session summary - Added agriculture domain"`
   - Git history serves as the historical record (use `git log` to view past versions)

---

## Critical Development Rules

1. **Do NOT modify frontend code** without understanding the full data flow
2. **Data-First Investigation**: When debugging, query Elasticsearch directly before touching code
3. **URL-First State**: Never call `router.navigate()` directly; use `UrlStateService`
4. **OnPush Change Detection**: Pop-out windows require `detectChanges()`, not `markForCheck()`
5. **No Unit Tests**: Testing is out of scope for this project

---

## When to Use Other Documentation

- **ORIENTATION.md**: Understand project structure and architecture (read once per session)
- **PROJECT-STATUS.md**: Know current state and active bugs (read once per session)
- **NEXT-STEPS.md**: See immediate work for this session (read once per session)
- **DOCUMENT-MAP.md**: Find specialized documentation for specific tasks
- **Git history**: Check historical PROJECT-STATUS.md versions via `git log docs/claude/PROJECT-STATUS.md`

---

**Last Updated**: 2025-12-06
