/**
 * Main Pipeline
 * 
 * Orchestrates the complete automated testing and bug fixing pipeline
 */

import { Page } from '@playwright/test';
import { 
  PipelineState, 
  BugReport,
  ConsistencyCheckResult 
} from './types';
import { 
  DEFAULT_PIPELINE_CONFIG,
  PipelineConfig 
} from './config';
import { 
  createScreenshotDirectory,
  takeScreenshotWithUrlBar,
  generateScreenshotFilename 
} from './screenshot-utils';
import { 
  runAllConsistencyChecks 
} from './visual-analysis';
import { 
  createBugReport,
  updateBugStatus,
  incrementBugAttempts,
  shouldMarkAsUnresolved,
  updatePipelineState,
  exportBugReport
} from './bug-reporter';
import { 
  processBugWithAI 
} from './ai-fixer';
import { 
  runPipelineTests,
  createBasicTestSteps 
} from './test-runner';

/**
 * Main Pipeline Class
 */
export class AutomatedPipeline {
  private config: PipelineConfig;
  private state: PipelineState;
  private currentIteration: number;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...config };
    this.state = {
      iteration: 0,
      bugs: [],
      resolvedBugs: [],
      unresolvedBugs: [],
      shouldContinue: true,
      stats: {
        totalBugs: 0,
        resolvedBugs: 0,
        unresolvedBugs: 0,
        screenshotsTaken: 0
      }
    };
    this.currentIteration = 0;
  }

  /**
   * Start the automated pipeline
   */
  async start(page: Page): Promise<void> {
    console.log('[PIPELINE] Starting automated testing pipeline');
    
    // Create screenshot directory
    createScreenshotDirectory(this.config.screenshotDir);
    
    // Run initial tests to establish baseline
    await this.runInitialTests(page);
    
    // Main pipeline loop
    while (this.state.shouldContinue && this.currentIteration < this.config.maxIterations) {
      console.log(`\n[PIPELINE] Starting iteration ${this.currentIteration + 1}`);
      
      // Run analysis phase
      const analysisResults = await this.runAnalysisPhase(page);
      
      // Check if any bugs were detected
      if (analysisResults.bugs.length > 0) {
        console.log(`[PIPELINE] Found ${analysisResults.bugs.length} bugs in iteration ${this.currentIteration + 1}`);
        
        // Process each bug through the AI fixing cycle
        for (const bug of analysisResults.bugs) {
          await this.processBug(page, bug);
        }
      } else {
        console.log(`[PIPELINE] No bugs detected in iteration ${this.currentIteration + 1}`);
      }
      
      // Check if we should continue
      this.state.shouldContinue = this.shouldContinuePipeline();
      
      this.currentIteration++;
      this.state.iteration = this.currentIteration;
    }
    
    // Finalize pipeline
    await this.finalizePipeline(page);
  }

  /**
   * Run initial tests to establish baseline
   */
  private async runInitialTests(page: Page): Promise<void> {
    console.log('[PIPELINE] Running initial tests to establish baseline');
    
    try {
      // Navigate to main page
      await page.goto('/automobiles/discover');
      await page.waitForSelector('[data-testid="basic-results-table"]', { timeout: 10000 });
      
      // Take baseline screenshot
      const filename = generateScreenshotFilename('baseline', 'initial', new Date());
      const screenshotPath = `${this.config.screenshotDir}/${filename}`;
      
      await takeScreenshotWithUrlBar(
        page,
        screenshotPath,
        'baseline',
        'initial'
      );
      
      console.log('[PIPELINE] Initial tests completed successfully');
      
    } catch (error) {
      console.error('[PIPELINE] Error in initial tests:', error);
    }
  }

  /**
   * Run analysis phase - exercise controls and take screenshots
   */
  private async runAnalysisPhase(page: Page): Promise<{ 
    success: boolean; 
    screenshots: string[]; 
    bugs: BugReport[] 
  }> {
    console.log('[PIPELINE] Running analysis phase');
    
    const screenshots: string[] = [];
    const bugs: BugReport[] = [];
    
    try {
      // Navigate to main page
      await page.goto('/automobiles/discover');
      await page.waitForSelector('[data-testid="basic-results-table"]', { timeout: 10000 });
      
      // Take screenshot of main page
      const mainScreenshot = await this.takeComponentScreenshot(page, 'main', 'discover-page');
      screenshots.push(mainScreenshot);
      
      // Run tests to exercise all controls
      const testSteps = createBasicTestSteps();
      const testResults = await runPipelineTests(page, testSteps, this.config);
      
      // Take screenshots of key components
      const queryControlScreenshot = await this.takeComponentScreenshot(page, 'query-control', 'query-control-open');
      screenshots.push(queryControlScreenshot);
      
      const resultsTableScreenshot = await this.takeComponentScreenshot(page, 'results-table', 'results-table-loaded');
      screenshots.push(resultsTableScreenshot);
      
      // Run consistency checks
      const consistencyResults = await this.runConsistencyChecks(screenshots);
      
      // Report any inconsistencies as bugs
      for (const check of consistencyResults) {
        if (!check.passed) {
          const bug = createBugReport(
            `consistency-${Date.now()}`,
            `Inconsistency detected: ${check.description}`,
            'consistency-check',
            page.url(),
            check.screenshots || []
          );
          bugs.push(bug);
        }
      }
      
      console.log(`[PIPELINE] Analysis phase completed with ${bugs.length} bugs detected`);
      
      return {
        success: true,
        screenshots,
        bugs
      };
      
    } catch (error) {
      console.error('[PIPELINE] Error in analysis phase:', error);
      return {
        success: false,
        screenshots,
        bugs
      };
    }
  }

  /**
   * Take a screenshot of a specific component
   */
  private async takeComponentScreenshot(
    page: Page,
    component: string,
    step: string
  ): Promise<string> {
    const filename = generateScreenshotFilename(component, step, new Date());
    const screenshotPath = `${this.config.screenshotDir}/${filename}`;
    
    await takeScreenshotWithUrlBar(
      page,
      screenshotPath,
      component,
      step
    );
    
    this.state.stats.screenshotsTaken++;
    return screenshotPath;
  }

  /**
   * Run consistency checks on screenshots
   */
  private async runConsistencyChecks(screenshots: string[]): Promise<ConsistencyCheckResult[]> {
    console.log('[PIPELINE] Running consistency checks');
    
    // Group screenshots by component (simplified for this implementation)
    const screenshotGroups: Record<string, string[]> = {
      main: screenshots.filter(s => s.includes('main') || s.includes('discover')),
      query: screenshots.filter(s => s.includes('query')),
      results: screenshots.filter(s => s.includes('results'))
    };
    
    return await runAllConsistencyChecks(screenshotGroups);
  }

  /**
   * Process a single bug through the AI fixing cycle
   */
  private async processBug(page: Page, bug: BugReport): Promise<void> {
    console.log(`[PIPELINE] Processing bug: ${bug.id}`);
    
    // Update bug status to in-progress
    const inProgressBug = updateBugStatus(bug, 'in-progress');
    
    // Increment attempt count
    const bugWithAttempts = incrementBugAttempts(inProgressBug);
    
    // Check if this bug should be marked as unresolved
    if (shouldMarkAsUnresolved(bugWithAttempts, this.config.maxBugAttempts)) {
      const unresolvedBug = updateBugStatus(bugWithAttempts, 'unresolved');
      this.state.unresolvedBugs.push(unresolvedBug);
      this.state.bugs = this.state.bugs.filter(b => b.id !== bug.id);
      
      console.log(`[PIPELINE] Bug marked as unresolved after ${this.config.maxBugAttempts} attempts: ${bug.id}`);
      return;
    }
    
    // Update bug in pipeline state
    this.state.bugs = this.state.bugs.map(b => b.id === bug.id ? bugWithAttempts : b);
    
    try {
      // Process bug with AI
      console.log(`[PIPELINE] Sending bug ${bug.id} to AI for analysis and fixing`);
      const aiResult = await processBugWithAI(bug, {
        aiModelEndpoint: this.config.aiModel.endpoint,
        apiKey: this.config.aiModel.apiKey
      });
      
      if (aiResult.success) {
        console.log(`[PIPELINE] AI successfully fixed bug: ${bug.id}`);
        
        // Update bug status to resolved
        const resolvedBug = updateBugStatus(bugWithAttempts, 'resolved');
        this.state.resolvedBugs.push(resolvedBug);
        this.state.bugs = this.state.bugs.filter(b => b.id !== bug.id);
        
        // Update stats
        this.state.stats.resolvedBugs++;
      } else {
        console.log(`[PIPELINE] AI failed to fix bug: ${bug.id}`);
        // Bug remains in open state for next iteration
      }
      
    } catch (error) {
      console.error(`[PIPELINE] Error processing bug ${bug.id}:`, error);
      // Bug remains in open state for next iteration
    }
  }

  /**
   * Determine if pipeline should continue
   */
  private shouldContinuePipeline(): boolean {
    // Continue if:
    // 1. We haven't reached max iterations
    // 2. There are still open bugs (that aren't unresolved)
    // 3. There are no unresolved bugs that should block continuation
    
    const openBugs = this.state.bugs.filter(bug => bug.status === 'open');
    const unresolvedBugs = this.state.unresolvedBugs;
    
    console.log(`[PIPELINE] Pipeline status - Open bugs: ${openBugs.length}, Unresolved bugs: ${unresolvedBugs.length}`);
    
    // If we've reached max iterations, stop
    if (this.currentIteration >= this.config.maxIterations) {
      console.log('[PIPELINE] Stopping - reached max iterations');
      return false;
    }
    
    // If there are no open bugs, we're done
    if (openBugs.length === 0) {
      console.log('[PIPELINE] Stopping - no open bugs remaining');
      return false;
    }
    
    // If there are unresolved bugs that should be skipped, we might continue
    // But for this implementation, we'll stop if there are any unresolved bugs
    if (unresolvedBugs.length > 0) {
      console.log('[PIPELINE] Stopping - unresolved bugs exist');
      return false;
    }
    
    return true;
  }

  /**
   * Finalize the pipeline
   */
  private async finalizePipeline(page: Page): Promise<void> {
    console.log('[PIPELINE] Finalizing pipeline');
    
    // Export bug report
    const reportPath = this.config.bugReportPath;
    await exportBugReport(this.state.bugs, reportPath);
    
    console.log(`[PIPELINE] Bug report exported to ${reportPath}`);
    
    // Print summary
    const summary = `
=== PIPELINE SUMMARY ===
Iterations: ${this.currentIteration}
Total Bugs Detected: ${this.state.stats.totalBugs}
Resolved Bugs: ${this.state.stats.resolvedBugs}
Unresolved Bugs: ${this.state.stats.unresolvedBugs}
Screenshots Taken: ${this.state.stats.screenshotsTaken}
    `.trim();
    
    console.log(summary);
    
    console.log('[PIPELINE] Pipeline completed');
  }

  /**
   * Get current pipeline state
   */
  getState(): PipelineState {
    return { ...this.state };
  }

  /**
   * Get configuration
   */
  getConfig(): PipelineConfig {
    return { ...this.config };
  }
}

/**
 * Run the pipeline with default configuration
 */
export async function runPipeline(page: Page): Promise<void> {
  const pipeline = new AutomatedPipeline();
  await pipeline.start(page);
}

/**
 * Run the pipeline with custom configuration
 */
export async function runPipelineWithConfig(
  page: Page, 
  config: Partial<PipelineConfig>
): Promise<void> {
  const pipeline = new AutomatedPipeline(config);
  await pipeline.start(page);
}
