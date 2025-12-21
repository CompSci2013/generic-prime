# Command: /bye

**Description:** Executes Step 1 of the Monster Shutdown Protocol.

## Instructions
When the user types `/bye`:

1.  **Update `docs/claude/PROJECT-STATUS.md`**:
    -   Bump the version number.
    -   Update the timestamp to the current time.
    -   Summarize the "Current State" and "Completed Work" for this session.
2.  **Update `docs/claude/NEXT-STEPS.md`**:
    -   Clear out completed tasks.
    -   Define the *exact* starting task for the next session.
3.  **Update `MONSTER-LOG.md`**:
    -   Write a "Hand-off" note. Leave architectural insights, warnings, or specific theories for the next "Brain" to consider.
4.  **Commit Code Changes**:
    -   If there are uncommitted changes in the codebase (outside `docs/claude/`), commit them now with a descriptive message.
5.  **Final Message**:
    -   State: "Shutdown Step 1 Complete. Code committed and documents updated. @Gemini - Execute Step 2: Secure the Perimeter (Archive & Doc Commit)."
