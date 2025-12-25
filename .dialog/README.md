# Dialog Files

This directory contains timestamped dialog files for Claude-Gemini collaboration sessions.

## File Format

Dialog files follow a turn-based script format (like a play):

```
CLAUDE:2025-12-25T10:00:00
Claude's output goes here. Can be multiple lines.

GEMINI:2025-12-25T10:01:30
Gemini's response goes here.

DEVELOPER:2025-12-25T10:05:00
Developer input when human intervention is needed.
```

## Turn Indicator

The **last line** of the file indicates whose turn it is next:
- `CLAUDE:<timestamp>` → Claude should respond
- `GEMINI:<timestamp>` → Waiting for Gemini
- `DEVELOPER:<timestamp>` → Waiting for human input

## File Naming

Files are named with ISO 8601 timestamps:
```
YYYY-MM-DDTHH:MM:SS_session.dialog
```

Example: `2025-12-25T18:45:00_session.dialog`

## Session Dialog Rotation

**Trigger**: When a dialog file exceeds **1,000 lines**, create a new session.

### Rotation Process

1. Create new dialog file with current timestamp
2. Compact the **last 25 entries** from the old dialog into the new file
3. **Target reduction: 65%** - preserve enough context

### Compaction Format

```
## SESSION CONTEXT (Compacted from previous dialog)

**SPEAKER:HH:MM** - One-line summary with critical details preserved.

**SPEAKER:HH:MM** - Another entry. Include: file names, bug numbers, key decisions.

---

## CURRENT SESSION

CLAUDE:<new-timestamp>
Session rotated from previous dialog. Context preserved above.

GEMINI:<new-timestamp>
```

### What to Preserve
- Bug numbers and their status (FIXED, REPRODUCED, etc.)
- File paths that were modified
- Key decisions made
- Test results (PASS/FAIL counts)
- Critical discoveries

### What to Omit
- Verbose code snippets (keep only file:line references)
- Full test output (keep only summary)
- Detailed explanations (keep only conclusions)
- Repeated context between entries

## Related Commands

- `/monsterwatch` - Starts the dialog monitoring session
- `/monster` - Traditional Monster Protocol (separate files)

## Related Files

- `MONSTER-LOG.md` - Deployment plan (project root)
- `MONSTER-CLAUDE.md` - Reality checks and status (project root)
- `docs/claude/PROJECT-STATUS.md` - Updated at session end
- `docs/claude/NEXT-STEPS.md` - Updated at session end
