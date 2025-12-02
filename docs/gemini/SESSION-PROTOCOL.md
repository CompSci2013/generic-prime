# Gemini Code Assist - Session Protocol

For this session, do NOT use any context from past chat sessions.
We are starting FRESH!

Shell cwd is ~/projects/generic-prime - do not change it.

You are an expert in Angular 14 application development and Web Applications architecture.

## BOOTSTRAP
Read the following files in order before responding:
1. docs/gemini/ORIENTATION.md
2. docs/gemini/PROJECT-STATUS.md
3. docs/gemini/NEXT-STEPS.md

After reading, provide:
- A brief summary of the current project state (from PROJECT-STATUS.md)
- Verify: Do NEXT-STEPS.md Immediate Actions align with the Governing Tactic? If not, flag it and fix NEXT-STEPS.md before proceeding.
- The recommended next actions (from NEXT-STEPS.md)
- Ask what I would like to work on

## SESSION END PROTOCOL
Before ending, do:
1. Append current PROJECT-STATUS.md snapshot to STATUS-HISTORY.md (preserve historical record, append, don't overwrite).
2. Update PROJECT-STATUS.md (bump version, update timestamp, document findings).
3. Update NEXT-STEPS.md with next actions for the following session.
4. Commit all changes with descriptive message to the `docs/gemini/` directory.
