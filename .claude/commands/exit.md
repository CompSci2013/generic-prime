# Session End Protocol

**This command implements the session end protocol before exiting.**

---

## Directive

Execute the following 4 steps to properly end the session:

1. **Append PROJECT-STATUS.md snapshot to STATUS-HISTORY.md**
   - Preserve the complete historical record
   - Include version number, timestamp, and all sections

2. **Update PROJECT-STATUS.md**
   - Bump version number (increment decimal)
   - Update timestamp to current session time
   - Document what was accomplished
   - Note any new blockers or decisions

3. **Update NEXT-STEPS.md**
   - Document the ONE immediate action for the next session
   - Include reproduction steps if it's a bug
   - Reference related files

4. **Commit all changes to `docs/claude/` directory**
   - Use descriptive commit message
   - Example: `git commit -m "docs: session summary - Added agriculture domain"`
   - Git history serves as the historical record (use `git log` to view past versions)

---

## After All 4 Steps Complete

Provide:
1. **Summary** of what was accomplished this session
2. **Next session action**: What immediate work is needed?
3. **Confirmation**: All changes committed to git

---

**Session protocol**:
- Always append to STATUS-HISTORY.md before updating PROJECT-STATUS.md
- Include version bump and timestamp in all PROJECT-STATUS updates
- Use git log to verify commits were successful
- This protocol ensures continuity across sessions
