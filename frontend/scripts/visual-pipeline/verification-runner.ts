/**
 * Visual Testing Pipeline - Verification Runner
 *
 * Selectively re-runs screenshot collection and analysis for fixed bugs.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CONFIG, SELECTORS, SCREENSHOT_STEPS } from './config';
import { VisionAnalyzer } from './vision-analyzer';
import type {
  Bug,
  ScreenshotResult,
  ScreenshotStep,
  VerificationResult
} from './types';

const FRONTEND_ROOT = path.resolve(__dirname, '../..');

export class VerificationRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private popoutPage: Page | null = null;
  private visionAnalyzer: VisionAnalyzer;

  constructor() {
    this.visionAnalyzer = new VisionAnalyzer();
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      viewport: CONFIG.viewport,
      ignoreHTTPSErrors: true
    });

    this.page = await this.context.newPage();
    console.log('[VerificationRunner] Browser initialized');
  }

  async cleanup(): Promise<void> {
    if (this.popoutPage) {
      await this.popoutPage.close().catch(() => {});
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('[VerificationRunner] Browser closed');
  }

  /**
   * Verify a list of bugs that have had fixes applied.
   * Only re-runs the screenshot steps relevant to each bug.
   */
  async verifyFixes(bugs: Bug[]): Promise<VerificationResult[]> {
    await this.initialize();
    const results: VerificationResult[] = [];

    try {
      // Group bugs by their screenshot step to minimize re-runs
      const bugsByStep = this.groupBugsByStep(bugs);

      for (const [stepId, stepBugs] of Object.entries(bugsByStep)) {
        console.log(`[VerificationRunner] Verifying ${stepBugs.length} bugs for step ${stepId}`);

        // Re-run the screenshot step
        const screenshot = await this.captureStep(stepId);

        if (!screenshot) {
          // Mark all bugs for this step as failed verification
          for (const bug of stepBugs) {
            results.push({
              bug_id: bug.bug_id,
              status: 'fail',
              checks_passed: 0,
              checks_failed: 1,
              error_message: `Failed to capture screenshot for step ${stepId}`
            });
          }
          continue;
        }

        // Analyze the screenshot
        const analysisResult = await this.visionAnalyzer.analyzeAll([screenshot]);

        // Check if each bug is still present
        for (const bug of stepBugs) {
          const stillPresent = this.isBugStillPresent(bug, analysisResult);

          results.push({
            bug_id: bug.bug_id,
            status: stillPresent ? 'fail' : 'pass',
            checks_passed: stillPresent ? 0 : 1,
            checks_failed: stillPresent ? 1 : 0,
            error_message: stillPresent ? 'Bug still detected after fix' : undefined
          });

          if (stillPresent) {
            console.log(`[VerificationRunner] ❌ Bug ${bug.bug_id} still present`);
          } else {
            console.log(`[VerificationRunner] ✅ Bug ${bug.bug_id} fixed`);
          }
        }
      }

      return results;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Group bugs by their screenshot step for efficient verification.
   */
  private groupBugsByStep(bugs: Bug[]): Record<string, Bug[]> {
    const grouped: Record<string, Bug[]> = {};

    for (const bug of bugs) {
      const stepId = bug.screenshot_id.replace(/-popout$/, '').replace(/-sync$/, '');
      if (!grouped[stepId]) {
        grouped[stepId] = [];
      }
      grouped[stepId].push(bug);
    }

    return grouped;
  }

  /**
   * Capture a single screenshot step.
   */
  private async captureStep(stepId: string): Promise<ScreenshotResult | null> {
    const step = SCREENSHOT_STEPS.find(s => s.id === stepId);
    if (!step) {
      console.error(`[VerificationRunner] Unknown step: ${stepId}`);
      return null;
    }

    const page = this.page!;

    try {
      // Execute prerequisites if needed
      await this.executePrerequisites(step, page);

      // Execute the step action
      await this.executeStepAction(stepId, page);

      // Inject URL bar overlay
      await this.injectUrlBar(page);

      // Capture screenshot
      const screenshotPath = path.join(
        FRONTEND_ROOT,
        CONFIG.screenshotsDir,
        `verify-${stepId}.png`
      );

      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      // Capture pop-out if needed
      let popoutScreenshots: string[] | undefined;
      if (step.capturePopouts && this.popoutPage) {
        await this.injectUrlBar(this.popoutPage);
        const popoutPath = path.join(
          FRONTEND_ROOT,
          CONFIG.screenshotsDir,
          `verify-${stepId}-popout.png`
        );
        await this.popoutPage.screenshot({
          path: popoutPath,
          fullPage: true
        });
        popoutScreenshots = [popoutPath];
      }

      return {
        step_id: stepId,
        screenshot_path: screenshotPath,
        url: page.url(),
        timestamp: new Date().toISOString(),
        expected_state: step.expectedState,
        popout_screenshots: popoutScreenshots
      };
    } catch (error) {
      console.error(`[VerificationRunner] Failed to capture step ${stepId}:`, error);
      return null;
    }
  }

  /**
   * Execute prerequisite steps if the step has dependencies.
   */
  private async executePrerequisites(step: ScreenshotStep, page: Page): Promise<void> {
    // Always start from the discover page
    await page.goto(`${CONFIG.baseUrl}${CONFIG.discoverRoute}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector(SELECTORS.resultsTable, {
      timeout: CONFIG.screenshotTimeout
    });
    await this.waitForSpinnerGone(page);

    // Handle dependencies
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        await this.executeStepAction(depId, page);
      }
    }
  }

  /**
   * Check if a bug is still present in the new analysis.
   */
  private isBugStillPresent(bug: Bug, newBugs: Bug[]): boolean {
    // Match by component and category
    return newBugs.some(newBug =>
      newBug.component === bug.component &&
      newBug.category === bug.category &&
      this.similarDescription(bug.description, newBug.description)
    );
  }

  /**
   * Check if two bug descriptions are similar enough to be the same bug.
   */
  private similarDescription(desc1: string, desc2: string): boolean {
    // Simple keyword matching - check if 50% of words overlap
    const words1 = new Set(desc1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(desc2.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    let overlap = 0;
    for (const word of words1) {
      if (words2.has(word)) overlap++;
    }

    const minSize = Math.min(words1.size, words2.size);
    return minSize > 0 && (overlap / minSize) >= 0.5;
  }

  // Step execution methods (simplified from screenshot-collector)
  private async executeStepAction(stepId: string, page: Page): Promise<void> {
    switch (stepId) {
      case '01-initial-load':
        // Already at discover page from prerequisites
        break;

      case '04-filter-applied':
        await this.applyManufacturerFilter(page, 'Chevrolet');
        break;

      case '06-combined-filters':
        await this.applyManufacturerFilter(page, 'Chevrolet');
        await this.applyYearRange(page, 2020, 2024);
        break;

      case '11-popout-opened':
      case '12-popout-synced':
        await this.openStatisticsPopout(page);
        break;

      case '13-filters-cleared':
        await this.clearAllFilters(page);
        break;

      // Other steps just need navigation which is handled in prerequisites
      default:
        break;
    }
  }

  private async waitForSpinnerGone(page: Page): Promise<void> {
    try {
      await page.waitForSelector(SELECTORS.spinner, {
        state: 'hidden',
        timeout: CONFIG.networkIdleTimeout
      });
    } catch {
      // Spinner may not exist
    }
  }

  private async applyManufacturerFilter(page: Page, manufacturer: string): Promise<void> {
    await page.click(SELECTORS.filterDropdown);
    await page.waitForSelector(SELECTORS.dropdownPanel);
    await page.click(`${SELECTORS.dropdownItems}:has-text("Manufacturer")`);
    await page.waitForSelector(SELECTORS.dialog);
    await page.click(`${SELECTORS.dialog} label:has-text("${manufacturer}")`);
    await page.click(SELECTORS.dialogApply);
    await page.waitForSelector(SELECTORS.dialog, { state: 'hidden' });
    await this.waitForSpinnerGone(page);
    await page.waitForURL(/manufacturer/);
  }

  private async applyYearRange(page: Page, min: number, max: number): Promise<void> {
    await page.click(SELECTORS.filterDropdown);
    await page.waitForSelector(SELECTORS.dropdownPanel);
    await page.click(`${SELECTORS.dropdownItems}:has-text("Year")`);
    await page.waitForSelector(SELECTORS.dialog);
    await page.fill('#yearMin input', String(min));
    await page.fill('#yearMax input', String(max));
    await page.click(SELECTORS.dialogApply);
    await page.waitForSelector(SELECTORS.dialog, { state: 'hidden' });
    await this.waitForSpinnerGone(page);
    await page.waitForURL(/yearMin/);
  }

  private async openStatisticsPopout(page: Page): Promise<void> {
    const popupPromise = this.context!.waitForEvent('page');
    await page.click(SELECTORS.popoutStatistics);
    this.popoutPage = await popupPromise;
    await this.popoutPage.waitForLoadState('networkidle');
  }

  private async clearAllFilters(page: Page): Promise<void> {
    const clearButton = page.locator('button:has-text("Clear All")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.waitForSpinnerGone(page);
    } else {
      await page.goto(`${CONFIG.baseUrl}${CONFIG.discoverRoute}`);
      await page.waitForLoadState('networkidle');
    }
  }

  private async injectUrlBar(page: Page): Promise<void> {
    const url = page.url();
    await page.evaluate((currentUrl: string) => {
      const existing = document.querySelector('#visual-pipeline-url-bar');
      if (existing) existing.remove();

      const div = document.createElement('div');
      div.id = 'visual-pipeline-url-bar';
      div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 32px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #ecf0f1;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 12px;
        padding: 8px 16px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border-bottom: 1px solid #3498db;
      `;

      const icon = document.createElement('span');
      icon.textContent = '\u{1F50D}';
      icon.style.fontSize = '14px';

      const urlSpan = document.createElement('span');
      urlSpan.textContent = currentUrl;
      urlSpan.style.color = '#3498db';
      urlSpan.style.fontWeight = '500';

      const timestamp = document.createElement('span');
      timestamp.textContent = new Date().toISOString().slice(11, 19);
      timestamp.style.marginLeft = 'auto';
      timestamp.style.color = '#95a5a6';
      timestamp.style.fontSize = '11px';

      div.appendChild(icon);
      div.appendChild(urlSpan);
      div.appendChild(timestamp);
      document.body.prepend(div);

      document.body.style.paddingTop = '40px';
    }, url);
  }
}

// CLI entry point
if (require.main === module) {
  const runner = new VerificationRunner();

  // Sample bug for testing
  const sampleBugs: Bug[] = [
    {
      bug_id: 'BUG-SYNC-001',
      severity: 'high',
      category: 'sync',
      component: 'statistics-panel',
      description: 'Pop-out statistics shows stale data after filter applied',
      expected: 'Statistics should reflect filtered data',
      actual: 'Statistics shows unfiltered totals',
      screenshot_id: '12-popout-synced',
      screenshot_path: 'screenshots/captures/12-popout-synced.png',
      suggested_fix: 'Verify BroadcastChannel STATE_UPDATE',
      fix_attempts: 1,
      status: 'fixing',
      fix_history: []
    }
  ];

  runner.verifyFixes(sampleBugs)
    .then((results) => {
      console.log(`\nVerification complete`);
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}
