# Monster Watch Protocol

**This command enables Claude to collaborate with the Developer through a turn-based dialog file.**

---

## Overview

The Monster Watch Protocol provides structured communication between Claude and the Developer via timestamped dialog files in `.dialog/`. Claude reads context, responds when signaled, and awaits the Developer's next instruction.

---

## Dialog File Format

Dialog files in `.dialog/` follow a turn-based script format:

```
CLAUDE:<timestamp>
Claude's output goes here. Can be multiple lines.
This continues until the next speaker marker.

DEVELOPER:<timestamp>
Developer input and instructions.
```

**IMPORTANT**: All timestamps MUST use Thor's system time. Before writing any timestamp, Claude MUST run `date -Iseconds` to get the current time from Thor. Never use estimated or hardcoded timestamps.

**Turn Indicator**: The LAST line of the file indicates whose turn it is next:
- `CLAUDE:<timestamp>` → Claude should respond
- `DEVELOPER:<timestamp>` → Waiting for Developer input

---

## How It Works

### Initialization Phase
1. **Read** `MONSTER-LOG.md` to understand the current deployment plan
2. **Read** `MONSTER-CLAUDE.md` for current state assessment
3. **Read** `docs/claude/ORIENTATION.md` for Minilab infrastructure context (Mimir, Thor, Loki)
4. **Read** the active dialog file in `.dialog/`
5. **Write initial entry** and pass turn to DEVELOPER

### Response Behavior
- **Do NOT poll** - The Developer will signal when it's Claude's turn
- **When signaled**: Parse the preceding content, execute any instructions, write response
- **Pass turn**: End response with `DEVELOPER:<timestamp>`

### Claude Responsibilities
- ✅ **Reads** context files at session start (MONSTER-LOG, MONSTER-CLAUDE, ORIENTATION)
- ✅ **Understands** Minilab infrastructure (Mimir, Thor, Loki)
- ✅ **Executes** deployment commands, builds, and code changes when instructed
- ✅ **Responds** in the dialog file with results and status
- ✅ **Passes turn** to Developer after each response
- ✅ **Plans** complex tasks and writes detailed plans to MONSTER-LOG.md
- ❌ **Does NOT poll** - waits for Developer signal

---

## Usage

```bash
/monsterwatch
```

This command:
1. Reads `MONSTER-LOG.md` for the deployment plan
2. Reads `MONSTER-CLAUDE.md` for current state
3. Reads `docs/claude/ORIENTATION.md` for infrastructure context
4. Reads the active dialog file in `.dialog/`
5. Writes initial status entry
6. Passes turn to Developer and awaits signal

---

## Example Dialog

```
CLAUDE:2026-01-01T10:00:00
Starting Monster Watch session.

**Context Loaded**:
- MONSTER-LOG.md: Session 67 complete
- ORIENTATION.md: Minilab infrastructure understood

**Minilab Infrastructure**:
- Mimir (192.168.0.100): LLM inference (Ollama API :11434)
- Thor (192.168.0.244): K3s worker, development host
- Loki (192.168.0.110): K3s control plane, Traefik ingress

**Current State**:
- Branch: feature/cline-experiment
- Version: 6.0.0
- Build: Passing

Awaiting instructions.

DEVELOPER:2026-01-01T10:00:00

DEVELOPER:2026-01-01T10:05:00
Deploy v6.0.0 to K3s.

CLAUDE:2026-01-01T10:05:00

CLAUDE:2026-01-01T10:08:00
✅ Deployed v6.0.0 to K3s

Steps executed:
1. Built production image
2. Imported to K3s
3. Updated deployment
4. Verified pods running

Ready for next instruction.

DEVELOPER:2026-01-01T10:08:00
```

---

## Session Dialog Rotation

**Trigger**: When the active dialog file exceeds **1,000 lines**, create a new session dialog.

### Rotation Process

1. **Detect threshold**: After each Claude response, check line count of current dialog file
2. **If > 1,000 lines**:
   - Create new dialog file with timestamp: `.dialog/YYYY-MM-DDTHH:MM:SS_session.dialog`
   - Compact the **last 25 entries** from the old dialog into the new file
   - **Target reduction: 65%** (preserve enough context)

3. **Compaction format**:
   ```
   ## SESSION CONTEXT (Compacted from previous dialog)

   **SPEAKER:HH:MM** - One-line summary with critical details preserved.

   **SPEAKER:HH:MM** - Another entry. Include: file names, bug numbers, key decisions.
   ```

4. **After compaction header**, add:
   ```
   ---

   ## CURRENT SESSION

   CLAUDE:<new-timestamp>
   Session rotated from previous dialog. Context preserved above.

   DEVELOPER:<new-timestamp>
   ```

### What to Preserve in Compaction
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

---

## Stop Conditions

The session ends when:
- Developer sends `STOP` or `END SESSION` instruction
- Developer stops the Claude session
- Claude detects fatal error and reports it in the dialog

---

## Files Involved

- **`.dialog/`**: Directory containing timestamped dialog files
- **`MONSTER-LOG.md`**: Deployment plan at project root (read at start)
- **`MONSTER-CLAUDE.md`**: State assessment at project root (read at start)
- **`docs/claude/ORIENTATION.md`**: Minilab infrastructure context (Mimir, Thor, Loki)
- **`docs/claude/PROJECT-STATUS.md`**: Updated at session end
- **`docs/claude/NEXT-STEPS.md`**: Updated at session end

---

## Directive

When `/monsterwatch` is invoked:

1. **Read MONSTER-LOG.md** from `/home/odin/projects/generic-prime/MONSTER-LOG.md`
   - Understand the deployment plan and what needs to be executed

2. **Read MONSTER-CLAUDE.md** from `/home/odin/projects/generic-prime/MONSTER-CLAUDE.md`
   - Get current state assessment

3. **Read ORIENTATION.md** from `/home/odin/projects/generic-prime/docs/claude/ORIENTATION.md`
   - Understand Minilab infrastructure: Mimir (LLM), Thor (dev host), Loki (K3s control plane)

4. **Find active dialog file** in `/home/odin/projects/generic-prime/.dialog/`
   - Look for the most recent timestamped dialog file
   - Read its contents to understand conversation history

5. **Write initial entry**:
   - Run `date -Iseconds` to get Thor's current system time
   - Write session start with context summary
   - Include Minilab infrastructure understanding
   - End with `DEVELOPER:<timestamp>` turn marker

6. **Await Developer signal**
   - Do NOT poll for changes
   - Developer will indicate when Claude should respond

7. **Check for rotation** (after each response)
   - Count lines in current dialog file
   - If > 1,000 lines: trigger Session Dialog Rotation (see above)

---

## Session End

When session is stopped:

1. **Write final entry** to dialog file documenting session end

2. **Update PROJECT-STATUS.md**
   - Bump version and timestamp
   - Document what was accomplished during the session
   - Note any blockers or decisions made

3. **Update NEXT-STEPS.md**
   - Document immediate next action
   - Reference related files
   - Note any pending work

4. **Commit changes**
   - Use descriptive message documenting the work completed

---

**Version**: 3.0
**Created**: 2025-12-25
**Updated**: 2026-01-01 (Simplified to DEVELOPER-CLAUDE dialog, removed polling, added ORIENTATION.md)
**Purpose**: Enable structured Developer-Claude collaboration with turn-based dialog

---

**Usage**: `/monsterwatch` at start of any iterative session requiring structured dialog
