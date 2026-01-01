# Visual Testing Pipeline - Autonomous Workflow

You are running an autonomous visual testing pipeline. Execute ALL steps without waiting for user input.

## Auto-Approve Required

Before starting, ensure these are enabled in Cline settings:
- Read all files
- Edit project files
- Execute safe commands
- Use MCP servers (if available)

---

## PHASE 1: Screenshot Collection

Run the screenshot collector:

```bash
cd /home/odin/projects/generic-prime/frontend && npm run visual-collect
```

Wait for completion. Screenshots will be saved to `frontend/screenshots/captures/`.

---

## PHASE 2: Visual Analysis with Mimir

For each screenshot in `frontend/screenshots/captures/`, send it to Mimir's vision model for analysis.

### API Call Format

```bash
# Convert image to base64
BASE64=$(base64 -w 0 frontend/screenshots/captures/01-initial-load.png)

# Call Mimir's qwen3-vl vision model
curl -s http://mimir:11434/api/generate \
  -d '{
    "model": "qwen3-vl:235b-a22b-instruct-q4_K_M",
    "prompt": "Analyze this UI screenshot for bugs, layout issues, state inconsistencies. Output JSON with bug_id, severity, component, description, expected, actual, suggested_fix.",
    "images": ["'"$BASE64"'"],
    "stream": false
  }' | jq -r '.response'
```

### Analysis Checklist

For each screenshot, check:
1. All panels visible and properly rendered
2. Filter chips match URL parameters
3. Results count is reasonable (4000-5000 for unfiltered)
4. No visual glitches, overlapping elements, or broken layouts
5. PrimeNG components render correctly (p-select, p-table, p-dialog)

Save analysis results to `frontend/reports/bug-reports/cycle-1-bugs.json`.

---

## PHASE 3: Bug Fixing

For each bug found, call Mimir's coder model to get a fix:

```bash
curl -s http://mimir:11434/api/generate \
  -d '{
    "model": "qwen3-coder:30b-a3b-q8_0",
    "prompt": "Fix this Angular/PrimeNG bug:\n\nBug: [description]\nComponent: [component]\nExpected: [expected]\nActual: [actual]\n\nProvide the exact code fix with file path.",
    "stream": false
  }' | jq -r '.response'
```

### Apply Fixes

1. Read the suggested fix from coder model
2. Identify the file to modify
3. Make the code change
4. Record what was changed

---

## PHASE 4: Verification

After applying fixes:

1. Re-run screenshot collection: `npm run visual-collect`
2. Re-analyze only the screenshots related to fixed bugs
3. If bug persists after 3 attempts, mark as "unresolved"

---

## PHASE 5: Report Generation

Create final report at `frontend/reports/pipeline-report.md`:

```markdown
# Visual Pipeline Report

**Date**: [timestamp]
**Cycles**: [number]

## Fixed Bugs
- [list]

## Unresolved Bugs
- [list]

## Files Modified
- [list]
```

---

## Important Notes

- **DO NOT** run `ng build` or `ng serve` - dev server runs separately
- **DO NOT** ask user for confirmation - this is autonomous
- **DO** continue through all phases even if some steps fail
- **DO** log progress to console
- **Mimir host**: http://mimir:11434
- **Vision model**: qwen3-vl:235b-a22b-instruct-q4_K_M
- **Coder model**: qwen3-coder:30b-a3b-q8_0

---

## Execution

Start now. Execute Phase 1 through Phase 5 sequentially without stopping.
