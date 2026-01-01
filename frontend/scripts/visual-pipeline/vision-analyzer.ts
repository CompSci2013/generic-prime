/**
 * Visual Testing Pipeline - Vision Analyzer
 *
 * Sends screenshots to qwen3-vl on Mimir for visual bug detection.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { CONFIG, VISION_SYSTEM_PROMPT, SCREENSHOT_STEPS } from './config';
import type {
  ScreenshotResult,
  VisionAnalysisResult,
  Bug,
  OllamaRequest,
  OllamaResponse
} from './types';

export class VisionAnalyzer {
  private bugCounter: Record<string, number> = {};

  async analyzeAll(screenshots: ScreenshotResult[]): Promise<Bug[]> {
    const allBugs: Bug[] = [];

    for (const screenshot of screenshots) {
      try {
        console.log(`[VisionAnalyzer] Analyzing ${screenshot.step_id}...`);
        const result = await this.analyzeScreenshot(screenshot);

        if (result.bugs.length > 0) {
          console.log(`[VisionAnalyzer] Found ${result.bugs.length} bugs in ${screenshot.step_id}`);
        }

        // Convert to full Bug objects
        for (const bug of result.bugs) {
          allBugs.push({
            ...bug,
            fix_attempts: 0,
            status: 'open',
            fix_history: []
          });
        }

        // Also analyze pop-out screenshots if present
        if (screenshot.popout_screenshots) {
          for (const popoutPath of screenshot.popout_screenshots) {
            const popoutResult = await this.analyzePopoutScreenshot(
              screenshot,
              popoutPath
            );
            for (const bug of popoutResult.bugs) {
              allBugs.push({
                ...bug,
                fix_attempts: 0,
                status: 'open',
                fix_history: []
              });
            }
          }
        }
      } catch (error) {
        console.error(`[VisionAnalyzer] Failed to analyze ${screenshot.step_id}:`, error);
      }
    }

    return allBugs;
  }

  private async analyzeScreenshot(screenshot: ScreenshotResult): Promise<VisionAnalysisResult> {
    const step = SCREENSHOT_STEPS.find(s => s.id === screenshot.step_id);
    const imageBase64 = await this.loadImageAsBase64(screenshot.screenshot_path);

    const prompt = this.buildAnalysisPrompt(screenshot, step);
    const response = await this.callOllama(CONFIG.visionModel, prompt, [imageBase64]);

    return this.parseVisionResponse(response, screenshot.step_id);
  }

  private async analyzePopoutScreenshot(
    mainScreenshot: ScreenshotResult,
    popoutPath: string
  ): Promise<VisionAnalysisResult> {
    const mainImageBase64 = await this.loadImageAsBase64(mainScreenshot.screenshot_path);
    const popoutImageBase64 = await this.loadImageAsBase64(popoutPath);

    const prompt = this.buildCrossWindowPrompt(mainScreenshot);
    const response = await this.callOllama(
      CONFIG.visionModel,
      prompt,
      [mainImageBase64, popoutImageBase64]
    );

    return this.parseVisionResponse(response, `${mainScreenshot.step_id}-popout`);
  }

  private buildAnalysisPrompt(
    screenshot: ScreenshotResult,
    step?: typeof SCREENSHOT_STEPS[0]
  ): string {
    const expectedState = screenshot.expected_state;

    return `${VISION_SYSTEM_PROMPT}

Analyze this screenshot from the automobile discovery application.

Screenshot ID: ${screenshot.step_id}
Step Description: ${step?.description || 'Unknown step'}
URL (shown in overlay): ${screenshot.url}
Timestamp: ${screenshot.timestamp}

Expected State:
- Visible panels: ${expectedState.panels?.join(', ') || 'All standard panels'}
- URL parameters: ${JSON.stringify(expectedState.urlParams || {})}
- Expected results count range: ${expectedState.resultsCount ? `${expectedState.resultsCount.min}-${expectedState.resultsCount.max}` : 'N/A'}
- Expected filter chips: ${expectedState.filterChips?.join(', ') || 'None'}

Tasks:
1. Verify all expected panels are visible and properly rendered
2. Check that filter chips (if any) match the URL parameters shown in the overlay
3. Verify results table count matches expected range (if visible)
4. Check for any visual anomalies or layout issues
5. Verify PrimeNG components render correctly (dropdowns, dialogs, tables)

Respond with valid JSON only in this exact format:
{
  "screenshot_id": "${screenshot.step_id}",
  "overall_status": "pass" | "fail" | "warning",
  "bugs": [
    {
      "bug_id": "BUG-{category}-{number}",
      "severity": "critical" | "high" | "medium" | "low",
      "category": "layout" | "state" | "data" | "visual" | "sync",
      "component": "string",
      "description": "string",
      "expected": "string",
      "actual": "string",
      "screenshot_id": "${screenshot.step_id}",
      "screenshot_path": "${screenshot.screenshot_path}",
      "suggested_fix": "string"
    }
  ],
  "observations": ["string"]
}`;
  }

  private buildCrossWindowPrompt(mainScreenshot: ScreenshotResult): string {
    return `${VISION_SYSTEM_PROMPT}

Compare these two screenshots to verify cross-window synchronization.

The FIRST image is the main window.
The SECOND image is the pop-out window.

Main Window URL: ${mainScreenshot.url}
Screenshot ID: ${mainScreenshot.step_id}

The pop-out window should display:
- Same filter state as main window
- Statistics/charts consistent with main window data
- No stale or outdated data

Verify:
1. If main window shows filtered results, pop-out should reflect same filters
2. Chart data should be consistent with filtered results
3. No loading spinners stuck indefinitely
4. No error messages visible

Respond with valid JSON only in this format:
{
  "screenshot_id": "${mainScreenshot.step_id}-sync",
  "overall_status": "pass" | "fail" | "warning",
  "bugs": [
    {
      "bug_id": "BUG-SYNC-{number}",
      "severity": "high",
      "category": "sync",
      "component": "string",
      "description": "string",
      "expected": "string",
      "actual": "string",
      "screenshot_id": "${mainScreenshot.step_id}-popout",
      "screenshot_path": "${mainScreenshot.popout_screenshots?.[0] || ''}",
      "suggested_fix": "string"
    }
  ],
  "observations": ["string"]
}`;
  }

  private async loadImageAsBase64(imagePath: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  }

  private async callOllama(
    model: string,
    prompt: string,
    images?: string[],
    retries: number = CONFIG.retries.ollama
  ): Promise<string> {
    const url = `${CONFIG.ollamaHost}${CONFIG.ollamaEndpoint}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const request: OllamaRequest = {
          model,
          prompt,
          images,
          stream: false,
          options: {
            temperature: 0.3,
            num_ctx: 8192
          }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.ollamaTimeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama returned ${response.status}: ${response.statusText}`);
        }

        const data: OllamaResponse = await response.json();
        return data.response;
      } catch (error) {
        console.error(`[VisionAnalyzer] Attempt ${attempt}/${retries} failed:`, error);

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const backoff = CONFIG.retries.initialBackoff * Math.pow(CONFIG.retries.backoffMultiplier, attempt - 1);
        console.log(`[VisionAnalyzer] Retrying in ${backoff}ms...`);
        await this.sleep(backoff);
      }
    }

    throw new Error('Exhausted retries');
  }

  private parseVisionResponse(response: string, screenshotId: string): VisionAnalysisResult {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response;

      // Remove markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr.trim());

      // Ensure bug IDs are unique
      if (parsed.bugs) {
        for (const bug of parsed.bugs) {
          if (!bug.bug_id || bug.bug_id.includes('{')) {
            bug.bug_id = this.generateBugId(bug.category);
          }
        }
      }

      return {
        screenshot_id: parsed.screenshot_id || screenshotId,
        overall_status: parsed.overall_status || 'warning',
        bugs: parsed.bugs || [],
        observations: parsed.observations || []
      };
    } catch (error) {
      console.error('[VisionAnalyzer] Failed to parse response:', error);
      console.error('[VisionAnalyzer] Raw response:', response.slice(0, 500));

      return {
        screenshot_id: screenshotId,
        overall_status: 'warning',
        bugs: [],
        observations: ['Failed to parse vision model response']
      };
    }
  }

  private generateBugId(category: string): string {
    const cat = category?.toUpperCase() || 'UNKNOWN';
    this.bugCounter[cat] = (this.bugCounter[cat] || 0) + 1;
    return `BUG-${cat}-${String(this.bugCounter[cat]).padStart(3, '0')}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI entry point
if (require.main === module) {
  const analyzer = new VisionAnalyzer();

  // Read screenshots from stdin or use sample data
  const sampleScreenshots: ScreenshotResult[] = [
    {
      step_id: '01-initial-load',
      screenshot_path: path.join(__dirname, '../../screenshots/captures/01-initial-load.png'),
      url: 'http://localhost:4205/automobiles/discover',
      timestamp: new Date().toISOString(),
      expected_state: {
        panels: ['query-control-panel', 'basic-results-table-panel'],
        resultsCount: { min: 4000, max: 5000 }
      }
    }
  ];

  analyzer.analyzeAll(sampleScreenshots)
    .then((bugs) => {
      console.log(`\nFound ${bugs.length} bugs`);
      console.log(JSON.stringify(bugs, null, 2));
    })
    .catch((error) => {
      console.error('Vision analysis failed:', error);
      process.exit(1);
    });
}
