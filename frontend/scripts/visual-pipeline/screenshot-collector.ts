/**
 * Visual Testing Pipeline - Screenshot Collector
 *
 * Uses Playwright to systematically capture screenshots of the application
 * while exercising all controls.
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CONFIG, SELECTORS, SCREENSHOT_STEPS } from './config';
import type { ScreenshotResult, ScreenshotStep } from './types';

const FRONTEND_ROOT = path.resolve(__dirname, '../..');

export class ScreenshotCollector {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private popoutPage: Page | null = null;
  private results: ScreenshotResult[] = [];

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
    console.log('[ScreenshotCollector] Browser initialized');
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
    console.log('[ScreenshotCollector] Browser closed');
  }

  async collectAll(): Promise<ScreenshotResult[]> {
    await this.initialize();

    try {
      // Clear previous screenshots
      const screenshotsPath = path.join(FRONTEND_ROOT, CONFIG.screenshotsDir);
      await fs.rm(screenshotsPath, { recursive: true, force: true });
      await fs.mkdir(screenshotsPath, { recursive: true });

      // Execute each screenshot step
      for (const step of SCREENSHOT_STEPS) {
        try {
          console.log(`[Step ${step.id}] ${step.description}`);
          const result = await this.executeStep(step);
          this.results.push(result);
          console.log(`[Step ${step.id}] Screenshot captured: ${result.screenshot_path}`);
        } catch (error) {
          console.error(`[Step ${step.id}] Failed:`, error);
          // Continue with next step on failure
        }
      }

      return this.results;
    } finally {
      await this.cleanup();
    }
  }

  private async executeStep(step: ScreenshotStep): Promise<ScreenshotResult> {
    const page = this.page!;

    // Execute the action for this step
    await this.executeStepAction(step.id, page);

    // Inject URL bar overlay
    await this.injectUrlBar(page);

    // Capture screenshot
    const screenshotPath = path.join(
      FRONTEND_ROOT,
      CONFIG.screenshotsDir,
      `${step.id}.png`
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
        `${step.id}-popout.png`
      );
      await this.popoutPage.screenshot({
        path: popoutPath,
        fullPage: true
      });
      popoutScreenshots = [popoutPath];
    }

    return {
      step_id: step.id,
      screenshot_path: screenshotPath,
      url: page.url(),
      timestamp: new Date().toISOString(),
      expected_state: step.expectedState,
      popout_screenshots: popoutScreenshots
    };
  }

  private async executeStepAction(stepId: string, page: Page): Promise<void> {
    switch (stepId) {
      case '01-initial-load':
        await this.navigateToDiscover(page);
        break;

      case '02-filter-dropdown-open':
        await this.openFilterDropdown(page);
        break;

      case '03-manufacturer-dialog':
        await this.openManufacturerDialog(page);
        break;

      case '04-filter-applied':
        await this.applyManufacturerFilter(page, 'Chevrolet');
        break;

      case '05-year-range-dialog':
        await this.openYearRangeDialog(page);
        break;

      case '06-combined-filters':
        await this.applyYearRange(page, 2020, 2024);
        break;

      case '07-results-table':
        await this.scrollToResultsTable(page);
        break;

      case '08-pagination-page2':
        await this.navigateToPage(page, 2);
        break;

      case '09-picker-selection':
        await this.scrollToPicker(page);
        break;

      case '10-statistics-charts':
        await this.scrollToStatistics(page);
        break;

      case '11-popout-opened':
        await this.openStatisticsPopout(page);
        break;

      case '12-popout-synced':
        await this.verifyPopoutSync(page);
        break;

      case '13-filters-cleared':
        await this.clearAllFilters(page);
        break;

      default:
        console.warn(`Unknown step: ${stepId}`);
    }
  }

  // Navigation helpers
  private async navigateToDiscover(page: Page): Promise<void> {
    await page.goto(`${CONFIG.baseUrl}${CONFIG.discoverRoute}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector(SELECTORS.resultsTable, {
      timeout: CONFIG.screenshotTimeout
    });
    await this.waitForSpinnerGone(page);
  }

  private async waitForSpinnerGone(page: Page): Promise<void> {
    try {
      await page.waitForSelector(SELECTORS.spinner, {
        state: 'hidden',
        timeout: CONFIG.networkIdleTimeout
      });
    } catch {
      // Spinner may not exist, that's fine
    }
  }

  // Filter operations
  private async openFilterDropdown(page: Page): Promise<void> {
    await page.click(SELECTORS.filterDropdown);
    await page.waitForSelector(SELECTORS.dropdownPanel);
  }

  private async openManufacturerDialog(page: Page): Promise<void> {
    // Open dropdown if not already open
    const dropdownVisible = await page.isVisible(SELECTORS.dropdownPanel);
    if (!dropdownVisible) {
      await this.openFilterDropdown(page);
    }

    // Click on Manufacturer option
    await page.click(`${SELECTORS.dropdownItems}:has-text("Manufacturer")`);
    await page.waitForSelector(SELECTORS.dialog);
  }

  private async applyManufacturerFilter(page: Page, manufacturer: string): Promise<void> {
    // Ensure dialog is open
    const dialogVisible = await page.isVisible(SELECTORS.dialog);
    if (!dialogVisible) {
      await this.openManufacturerDialog(page);
    }

    // Find and click the checkbox for the manufacturer
    await page.click(`${SELECTORS.dialog} label:has-text("${manufacturer}")`);

    // Click Apply
    await page.click(SELECTORS.dialogApply);
    await page.waitForSelector(SELECTORS.dialog, { state: 'hidden' });
    await this.waitForSpinnerGone(page);

    // Wait for URL to update
    await page.waitForURL(/manufacturer/);
  }

  private async openYearRangeDialog(page: Page): Promise<void> {
    await this.openFilterDropdown(page);
    await page.click(`${SELECTORS.dropdownItems}:has-text("Year")`);
    await page.waitForSelector(SELECTORS.dialog);
  }

  private async applyYearRange(page: Page, min: number, max: number): Promise<void> {
    const dialogVisible = await page.isVisible(SELECTORS.dialog);
    if (!dialogVisible) {
      await this.openYearRangeDialog(page);
    }

    // Fill in year range inputs
    await page.fill('#yearMin input', String(min));
    await page.fill('#yearMax input', String(max));

    // Click Apply
    await page.click(SELECTORS.dialogApply);
    await page.waitForSelector(SELECTORS.dialog, { state: 'hidden' });
    await this.waitForSpinnerGone(page);

    await page.waitForURL(/yearMin/);
  }

  // Results table operations
  private async scrollToResultsTable(page: Page): Promise<void> {
    await page.locator(SELECTORS.resultsTable).scrollIntoViewIfNeeded();
  }

  private async navigateToPage(page: Page, pageNum: number): Promise<void> {
    await page.click(`.p-paginator button:has-text("${pageNum}")`);
    await this.waitForSpinnerGone(page);
  }

  // Picker operations
  private async scrollToPicker(page: Page): Promise<void> {
    await page.locator(SELECTORS.pickerPanel).scrollIntoViewIfNeeded();
  }

  // Statistics operations
  private async scrollToStatistics(page: Page): Promise<void> {
    await page.locator(SELECTORS.statisticsPanel).scrollIntoViewIfNeeded();
  }

  private async openStatisticsPopout(page: Page): Promise<void> {
    // Listen for new page before clicking
    const popupPromise = this.context!.waitForEvent('page');

    await page.click(SELECTORS.popoutStatistics);

    this.popoutPage = await popupPromise;
    await this.popoutPage.waitForLoadState('networkidle');
  }

  private async verifyPopoutSync(page: Page): Promise<void> {
    // Just wait a moment for sync
    if (this.popoutPage) {
      await this.popoutPage.waitForTimeout(1000);
    }
  }

  // Clear operations
  private async clearAllFilters(page: Page): Promise<void> {
    // Look for clear all button
    const clearButton = page.locator('button:has-text("Clear All")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.waitForSpinnerGone(page);
    } else {
      // Navigate to base URL without params
      await page.goto(`${CONFIG.baseUrl}${CONFIG.discoverRoute}`);
      await page.waitForLoadState('networkidle');
    }
  }

  // URL bar injection
  private async injectUrlBar(page: Page): Promise<void> {
    const url = page.url();
    await page.evaluate((currentUrl: string) => {
      // Remove existing URL bar if present
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
      icon.textContent = '\u{1F50D}'; // Magnifying glass
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

      // Adjust body padding
      document.body.style.paddingTop = '40px';
    }, url);
  }
}

// CLI entry point
if (require.main === module) {
  const collector = new ScreenshotCollector();
  collector.collectAll()
    .then((results) => {
      console.log(`\nCollected ${results.length} screenshots`);
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      console.error('Screenshot collection failed:', error);
      process.exit(1);
    });
}
