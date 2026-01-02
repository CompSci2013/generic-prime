# Session End Protocol

**This command implements the session end protocol before exiting.**

---

## Directive

Execute the following steps to properly end the session:

### 1. Update Documentation

1. **Update `docs/claude/PROJECT-STATUS.md`**
   - Bump the version number
   - Update the timestamp to the current time. **CRITICAL**: Use `date -Iseconds` to get the timestamp.
   - Summarize the "Current State" and "Completed Work" for this session
   - Note any new blockers or decisions

2. **Update `docs/claude/NEXT-STEPS.md`**
   - Clear out completed tasks
   - Define the *exact* starting task for the next session
   - Include reproduction steps if it's a bug
   - Reference related files

---

### 2. Commit Changes (Two Commits)

3. **First commit** - Documentation updates:
   - Run `git add docs/claude/`
   - Commit: `docs: session [Version] summary - [Brief Description]`

4. **Second commit** - Remaining changes (if any):
   - Run `git add .`
   - Review staged files with `git status`
   - Commit with appropriate message based on changes (e.g., `feat:`, `fix:`, `chore:`)
   - Skip if no remaining changes

---

### 3. Final Message

5. **Provide**:
   - Summary of what was accomplished this session
   - Next session action: What immediate work is needed?
   - Confirmation: All changes committed to git

---

**Session protocol**:
- Include version bump and timestamp in all PROJECT-STATUS updates
- Use git log to verify commits were successful
- Git history serves as the historical record for tracking changes
- This protocol ensures continuity across sessions
