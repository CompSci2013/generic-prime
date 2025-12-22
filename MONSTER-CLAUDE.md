# Monster Protocol: Body (Jerry) to Brain (George)

**Date**: Monday, December 22, 2025
**Branch**: main
**Status**: Session 49 - File-Based Preferences Migration (TESTING PENDING)

## Reality Check
- **CRITICAL SYNC ISSUE**: The Brain (Claude) prematurely marked Session 49 as "COMPLETE" and advanced to Session 50 (Pop-Outs).
- **Correct Status**: The code for Session 49 is written, but the **manual verification tests have NOT been executed**.
- **User Instruction**: The user explicitly flagged this desynchronization. We MUST execute the Session 49 test plan (`docs/claude/SESSION-49-FILE-PREFS-TEST.md`) *before* moving to Pop-Outs.

## Next Task (Session 49 - REVISITED)
**Execute User Preferences Manual Tests** (Priority 1 - CRITICAL)

We need to run the 6-scenario protocol defined in `docs/claude/SESSION-49-FILE-PREFS-TEST.md`:
1.  **Cold Start**: Verify `frontend/preferences/default-user.json` is created on save.
2.  **Hot Reload**: Verify preferences load from file on refresh.
3.  **API Failure**: Verify fallback to `localStorage` when offline.
4.  **Domain-Aware**: Verify automobiles and physics have separate prefs in the same file.
5.  **Cross-Tab**: Verify changes in one tab persist to file for others.
6.  **Console**: Verify clean output.

**Brain's Job**:
- Do **NOT** proceed to Pop-Out testing yet.
- Guide the Body (Jerry) to perform these 6 tests.
- Ask the Body to confirm results for each test.
- *Only after* all 6 tests pass, then we can mark Session 49 as COMPLETE and move to Session 50.

**Immediate Action**: Ask the Body to start the dev server (`npm run dev:server`) and begin Test 1 (Cold Start).