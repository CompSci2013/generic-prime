#!/usr/bin/env python3
"""
Autonomous Visual Testing Pipeline

A fully self-contained pipeline that:
1. Collects screenshots via Playwright
2. Analyzes them with qwen3-vl vision model on Mimir
3. Gets code fixes from qwen3-coder on Mimir
4. Applies fixes directly to files
5. Verifies fixes by re-testing
6. Generates a final report

No VS Code extensions required. Just Python + Mimir.

Usage:
    python3 scripts/autonomous-pipeline.py

Requirements:
    - Dev server running on localhost:4205
    - Mimir accessible at mimir:11434
    - Playwright installed (npm install)
"""

import subprocess
import json
import base64
import re
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Optional
import urllib.request
import urllib.error

# Configuration
MIMIR_HOST = "http://mimir:11434"
VISION_MODEL = "qwen3-vl:235b-a22b-instruct-q4_K_M"
CODER_MODEL = "qwen3-coder:30b-a3b-q8_0"
BASE_URL = "http://localhost:4205"
MAX_FIX_ATTEMPTS = 3
MAX_CYCLES = 5

# Paths
FRONTEND_DIR = Path(__file__).parent.parent
SCREENSHOTS_DIR = FRONTEND_DIR / "screenshots" / "captures"
REPORTS_DIR = FRONTEND_DIR / "reports"

# Prompts
VISION_PROMPT = """You are a UI quality analyst. Analyze this screenshot from an Angular/PrimeNG web application.

Look for:
1. Layout issues (misaligned elements, overlapping, cut-off text)
2. State mismatches (filter chips not matching URL, wrong counts)
3. Visual bugs (missing icons, broken layouts, invisible elements)
4. Data issues (empty tables when data expected)

The application shows automobile data with:
- Query Control Panel (filter dropdown, filter chips)
- Results Table (data-testid="basic-results-table")
- Statistics Panel (charts)
- Picker Panel (manufacturer/model selection)

URL is shown in the overlay bar at top of screenshot.

Respond with ONLY valid JSON (no markdown):
{
  "status": "pass" | "fail",
  "bugs": [
    {
      "id": "BUG-001",
      "severity": "critical" | "high" | "medium" | "low",
      "component": "component name",
      "description": "what's wrong",
      "expected": "what should be",
      "actual": "what is shown",
      "suggested_fix": "high-level fix approach"
    }
  ],
  "observations": ["general observations"]
}
"""

CODER_PROMPT_TEMPLATE = """You are a senior Angular developer. Fix this bug in a PrimeNG 20 application.

Project details:
- Angular 20.3.15 with standalone components
- PrimeNG 20.4.0 (Dropdown is now p-select, not p-dropdown)
- TypeScript 5.8.3
- URL-first state management via UrlStateService

Bug to fix:
- Component: {component}
- Description: {description}
- Expected: {expected}
- Actual: {actual}
- Suggested approach: {suggested_fix}

Provide the fix in this EXACT format:

FILE: relative/path/to/file.ts
```typescript
// The exact code block to find and replace
// or new code to add
```

OLD_CODE:
```typescript
// The exact existing code to replace (if modifying)
```

NEW_CODE:
```typescript
// The new code that should replace it
```

EXPLANATION:
Brief explanation of what the fix does.

If you need to see file contents first, say "NEED_FILE: path/to/file" and I will provide it.
"""


class AutonomousPipeline:
    def __init__(self):
        self.bugs = []
        self.fixed_bugs = []
        self.unresolved_bugs = []
        self.cycle = 0
        self.start_time = datetime.now()

    def run(self):
        """Main pipeline execution."""
        print(f"\n{'='*60}")
        print(f"AUTONOMOUS VISUAL TESTING PIPELINE")
        print(f"Started: {self.start_time.isoformat()}")
        print(f"{'='*60}\n")

        # Verify prerequisites
        if not self.check_prerequisites():
            return False

        while self.cycle < MAX_CYCLES:
            self.cycle += 1
            print(f"\n--- Cycle {self.cycle}/{MAX_CYCLES} ---\n")

            # Phase 1: Collect screenshots
            if not self.collect_screenshots():
                print("Screenshot collection failed")
                continue

            # Phase 2: Analyze with vision model
            new_bugs = self.analyze_screenshots()

            if not new_bugs:
                print("\n✅ No bugs detected! Pipeline complete.\n")
                break

            # Phase 3: Fix bugs
            for bug in new_bugs:
                if bug['id'] not in [b['id'] for b in self.bugs]:
                    bug['attempts'] = 0
                    self.bugs.append(bug)

            bugs_to_fix = [b for b in self.bugs if b['attempts'] < MAX_FIX_ATTEMPTS]

            if not bugs_to_fix:
                print("\n⚠️ All bugs exhausted fix attempts.\n")
                break

            for bug in bugs_to_fix:
                self.fix_bug(bug)

            # Phase 4: Verification happens in next cycle

        # Phase 5: Generate report
        self.generate_report()
        return True

    def check_prerequisites(self) -> bool:
        """Verify dev server and Mimir are accessible."""
        print("[Prerequisites] Checking...")

        # Check dev server (Angular serves from root, routes are client-side)
        try:
            req = urllib.request.urlopen(f"{BASE_URL}/", timeout=5)
            print(f"  ✅ Dev server: {BASE_URL}")
        except Exception as e:
            print(f"  ❌ Dev server not accessible: {e}")
            print("     Run: npm run dev:server")
            return False

        # Check Mimir
        try:
            req = urllib.request.urlopen(f"{MIMIR_HOST}/api/tags", timeout=5)
            data = json.loads(req.read())
            models = [m['name'] for m in data.get('models', [])]

            has_vision = any(VISION_MODEL in m for m in models)
            has_coder = any(CODER_MODEL in m for m in models)

            print(f"  ✅ Mimir: {MIMIR_HOST}")
            print(f"     Vision model ({VISION_MODEL}): {'✅' if has_vision else '❌'}")
            print(f"     Coder model ({CODER_MODEL}): {'✅' if has_coder else '❌'}")

            if not has_vision or not has_coder:
                print("     Warning: Required models may not be available")
        except Exception as e:
            print(f"  ❌ Mimir not accessible: {e}")
            return False

        return True

    def collect_screenshots(self) -> bool:
        """Run Playwright to collect screenshots."""
        print("[Phase 1] Collecting screenshots...")

        # Clear old screenshots
        if SCREENSHOTS_DIR.exists():
            for f in SCREENSHOTS_DIR.glob("*.png"):
                f.unlink()
        SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

        # Run the screenshot collector
        result = subprocess.run(
            ["npm", "run", "visual-collect"],
            cwd=FRONTEND_DIR,
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode != 0:
            print(f"  ❌ Screenshot collection failed:")
            print(result.stderr[-500:] if result.stderr else "No error output")
            return False

        screenshots = list(SCREENSHOTS_DIR.glob("*.png"))
        print(f"  ✅ Collected {len(screenshots)} screenshots")
        return len(screenshots) > 0

    def analyze_screenshots(self) -> list:
        """Send screenshots to vision model for analysis."""
        print("[Phase 2] Analyzing screenshots with vision model...")

        all_bugs = []
        screenshots = sorted(SCREENSHOTS_DIR.glob("*.png"))

        for screenshot in screenshots:
            print(f"  Analyzing {screenshot.name}...")

            # Load and encode image
            with open(screenshot, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')

            # Call vision model
            response = self.call_ollama(
                model=VISION_MODEL,
                prompt=VISION_PROMPT,
                images=[image_data]
            )

            if not response:
                print(f"    ⚠️ No response for {screenshot.name}")
                continue

            # Parse response
            try:
                # Extract JSON from response
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    result = json.loads(json_match.group())
                    bugs = result.get('bugs', [])

                    for bug in bugs:
                        bug['screenshot'] = str(screenshot)
                        all_bugs.append(bug)

                    if bugs:
                        print(f"    Found {len(bugs)} bugs")
                    else:
                        print(f"    ✅ No bugs")
            except json.JSONDecodeError as e:
                print(f"    ⚠️ Failed to parse response: {e}")

        print(f"  Total bugs found: {len(all_bugs)}")
        return all_bugs

    def fix_bug(self, bug: dict):
        """Get fix from coder model and apply it."""
        bug['attempts'] += 1
        print(f"\n[Phase 3] Fixing bug {bug['id']} (attempt {bug['attempts']}/{MAX_FIX_ATTEMPTS})")
        print(f"  Component: {bug.get('component', 'unknown')}")
        print(f"  Issue: {bug.get('description', 'unknown')}")

        # Build prompt
        prompt = CODER_PROMPT_TEMPLATE.format(
            component=bug.get('component', 'unknown'),
            description=bug.get('description', 'unknown'),
            expected=bug.get('expected', 'unknown'),
            actual=bug.get('actual', 'unknown'),
            suggested_fix=bug.get('suggested_fix', 'unknown')
        )

        # Call coder model
        response = self.call_ollama(
            model=CODER_MODEL,
            prompt=prompt
        )

        if not response:
            print("  ❌ No response from coder model")
            return

        # Check if model needs file contents
        if "NEED_FILE:" in response:
            file_match = re.search(r'NEED_FILE:\s*(\S+)', response)
            if file_match:
                file_path = FRONTEND_DIR / "src" / file_match.group(1)
                if file_path.exists():
                    file_content = file_path.read_text()
                    prompt += f"\n\nHere is the file content:\n```typescript\n{file_content}\n```"
                    response = self.call_ollama(model=CODER_MODEL, prompt=prompt)

        # Parse and apply fix
        self.apply_fix(bug, response)

    def apply_fix(self, bug: dict, response: str):
        """Parse coder response and apply the fix."""
        # Extract file path
        file_match = re.search(r'FILE:\s*(\S+)', response)
        if not file_match:
            print("  ⚠️ No file path in response")
            return

        file_path = file_match.group(1)

        # Handle relative paths
        if file_path.startswith('src/'):
            full_path = FRONTEND_DIR / file_path
        elif file_path.startswith('frontend/'):
            full_path = FRONTEND_DIR.parent / file_path
        else:
            full_path = FRONTEND_DIR / "src" / file_path

        if not full_path.exists():
            print(f"  ⚠️ File not found: {full_path}")
            return

        # Extract old and new code
        old_match = re.search(r'OLD_CODE:\s*```\w*\n([\s\S]*?)```', response)
        new_match = re.search(r'NEW_CODE:\s*```\w*\n([\s\S]*?)```', response)

        if old_match and new_match:
            old_code = old_match.group(1).strip()
            new_code = new_match.group(1).strip()

            # Read file
            content = full_path.read_text()

            # Apply replacement
            if old_code in content:
                new_content = content.replace(old_code, new_code, 1)
                full_path.write_text(new_content)
                print(f"  ✅ Applied fix to {file_path}")
                bug['fixed'] = True
                self.fixed_bugs.append(bug)
            else:
                print(f"  ⚠️ Could not find code to replace in {file_path}")
                print(f"     Looking for: {old_code[:100]}...")
        else:
            print("  ⚠️ Could not parse OLD_CODE/NEW_CODE blocks")

    def call_ollama(self, model: str, prompt: str, images: list = None) -> Optional[str]:
        """Call Ollama API."""
        url = f"{MIMIR_HOST}/api/generate"

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_ctx": 8192
            }
        }

        if images:
            payload["images"] = images

        try:
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )

            with urllib.request.urlopen(req, timeout=300) as resp:
                result = json.loads(resp.read())
                return result.get('response', '')
        except urllib.error.URLError as e:
            print(f"  ❌ Ollama API error: {e}")
            return None
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return None

    def generate_report(self):
        """Generate final pipeline report."""
        print("\n[Phase 5] Generating report...")

        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORTS_DIR / f"pipeline-{datetime.now().strftime('%Y%m%d-%H%M%S')}.md"

        duration = datetime.now() - self.start_time

        # Categorize bugs
        fixed = [b for b in self.bugs if b.get('fixed')]
        unresolved = [b for b in self.bugs if not b.get('fixed') and b.get('attempts', 0) >= MAX_FIX_ATTEMPTS]
        remaining = [b for b in self.bugs if not b.get('fixed') and b.get('attempts', 0) < MAX_FIX_ATTEMPTS]

        report = f"""# Visual Testing Pipeline Report

**Generated**: {datetime.now().isoformat()}
**Duration**: {duration}
**Cycles**: {self.cycle}

## Summary

| Metric | Count |
|--------|-------|
| Total Bugs Found | {len(self.bugs)} |
| Fixed | {len(fixed)} |
| Unresolved | {len(unresolved)} |
| Remaining | {len(remaining)} |

## Fixed Bugs

"""

        for bug in fixed:
            report += f"### {bug.get('id', 'Unknown')}\n"
            report += f"- **Component**: {bug.get('component', 'unknown')}\n"
            report += f"- **Description**: {bug.get('description', 'unknown')}\n"
            report += f"- **Attempts**: {bug.get('attempts', 0)}\n\n"

        report += "\n## Unresolved Bugs\n\n"

        for bug in unresolved:
            report += f"### {bug.get('id', 'Unknown')}\n"
            report += f"- **Component**: {bug.get('component', 'unknown')}\n"
            report += f"- **Description**: {bug.get('description', 'unknown')}\n"
            report += f"- **Attempts**: {bug.get('attempts', 0)}\n"
            report += f"- **Screenshot**: {bug.get('screenshot', 'N/A')}\n\n"

        report += "\n---\n*Generated by Autonomous Visual Testing Pipeline*\n"

        report_path.write_text(report)
        print(f"  ✅ Report saved to {report_path}")

        # Print summary
        print(f"\n{'='*60}")
        print("PIPELINE COMPLETE")
        print(f"{'='*60}")
        print(f"Duration: {duration}")
        print(f"Cycles: {self.cycle}")
        print(f"Bugs: {len(fixed)} fixed, {len(unresolved)} unresolved, {len(remaining)} remaining")
        print(f"Report: {report_path}")
        print(f"{'='*60}\n")


if __name__ == "__main__":
    pipeline = AutonomousPipeline()
    success = pipeline.run()
    sys.exit(0 if success else 1)
