/**
 * Test Runner
 * 
 * Component for executing tests and managing test steps
 */

import { Page } from '@playwright/test';
import { TestStep, PipelineState } from './types';
import { takeScreenshotWithUrlBar, createScreenshotDirectory, generateScreenshotFilename } from './screenshot-utils';
import { DEFAULT_PIPELINE_CONFIG } from './config';

/**
 * Execute a single test step
 */
export async function executeTestStep(
  page: Page,
  step: TestStep,
  screenshotDir: string,
  iteration: number
): Promise<{ success: boolean; screenshots: string[] }> {
  const screenshots: string[] = [];
  
  try {
    // Create screenshot directory if it doesn't exist
    createScreenshotDirectory(screenshotDir);
    
    // Generate unique filename for this step
    const filename = generateScreenshotFilename(
      step.component,
      step.id,
      new Date()
    );
    
    const screenshotPath = `${screenshotDir}/${filename}`;
    
    console.log(`[TEST RUNNER] Executing step: ${step.description} (${step.id})`);
    
    // Execute the test step
    await step.execute(page, null);
    
    // Take screenshot after execution
    const screenshotData = await takeScreenshotWithUrlBar(
      page,
      screenshotPath,
      step.component,
      step.id
    );
    
    screenshots.push(screenshotData.path);
    
    // If validation function exists, run it
    if (step.validate) {
      const isValid = await step.validate(page, null);
      if (!isValid) {
        console.log(`[TEST RUNNER] Validation failed for step: ${step.id}`);
        return { success: false, screenshots };
      }
    }
    
    console.log(`[TEST RUNNER] Step completed successfully: ${step.id}`);
    return { success: true, screenshots };
    
  } catch (error) {
    console.error(`[TEST RUNNER] Error executing step ${step.id}:`, error);
    return { success: false, screenshots };
  }
}

/**
 * Run all test steps for a component
 */
export async function runComponentTests(
  page: Page,
  steps: TestStep[],
  screenshotDir: string,
  iteration: number
): Promise<{ success: boolean; screenshots: string[] }> {
  const allScreenshots: string[] = [];
  let allSuccess = true;
  
  console.log(`[TEST RUNNER] Running ${steps.length} tests for component`);
  
  for (const step of steps) {
    const result = await executeTestStep(
      page,
      step,
      screenshotDir,
      iteration
    );
    
    allScreenshots.push(...result.screenshots);
    
    if (!result.success) {
      allSuccess = false;
      console.log(`[TEST RUNNER] Test step failed: ${step.id}`);
    }
  }
  
  console.log(`[TEST RUNNER] Component tests ${allSuccess ? 'completed successfully' : 'had failures'}`);
  return { success: allSuccess, screenshots: allScreenshots };
}

/**
 * Run all pipeline tests
 */
export async function runPipelineTests(
  page: Page,
  testSteps: TestStep[],
  config = DEFAULT_PIPELINE_CONFIG
): Promise<{ success: boolean; screenshots: string[]; state: PipelineState }> {
  const screenshots: string[] = [];
  let allSuccess = true;
  
  // Initialize pipeline state
  const state: PipelineState = {
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
  
  console.log('[TEST RUNNER] Starting full pipeline tests');
  
  // Run all test steps
  for (const step of testSteps) {
    const result = await executeTestStep(
      page,
      step,
      config.screenshotDir,
      state.iteration
    );
    
    screenshots.push(...result.screenshots);
    
    if (!result.success) {
      allSuccess = false;
      console.log(`[TEST RUNNER] Test step failed: ${step.id}`);
    }
  }
  
  console.log(`[TEST RUNNER] Pipeline tests ${allSuccess ? 'completed successfully' : 'had failures'}`);
  
  return {
    success: allSuccess,
    screenshots,
    state
  };
}

/**
 * Create basic test steps for the main components
 */
export function createBasicTestSteps(): TestStep[] {
  // These would be actual test steps that interact with the application
  // For now, we'll create placeholder steps that demonstrate the structure
  
  const testSteps: TestStep[] = [
    {
      id: 'navigate-to-discover',
      description: 'Navigate to discover page',
      component: 'main',
      execute: async (page: Page) => {
        await page.goto('/automobiles/discover');
        await page.waitForSelector('[data-testid="basic-results-table"]', { timeout: 10000 });
      }
    },
    {
      id: 'open-query-control',
      description: 'Open query control panel',
      component: 'query-control',
      execute: async (page: Page) => {
        const panel = page.locator('[data-testid="query-control-panel"]');
        await panel.waitFor({ timeout: 5000 });
      }
    },
    {
      id: 'select-manufacturer-filter',
      description: 'Select manufacturer filter',
      component: 'query-control',
      execute: async (page: Page) => {
        // This would interact with the actual filter dropdown
        const dropdown = page.locator('[data-testid="filter-field-dropdown"]');
        await dropdown.click();
        await page.waitForTimeout(500);
      }
    },
    {
      id: 'check-results-table',
      description: 'Verify results table is visible',
      component: 'results-table',
      execute: async (page: Page) => {
        const table = page.locator('[data-testid="basic-results-table"]');
        await table.waitFor({ timeout: 5000 });
      },
      validate: async (page: Page) => {
        const table = page.locator('[data-testid="basic-results-table"]');
        return await table.isVisible();
      }
    }
  ];
  
  return testSteps;
}

/**
 * Run specific component tests
 */
export async function runSpecificComponentTests(
  page: Page,
  component: string,
  config = DEFAULT_PIPELINE_CONFIG
): Promise<{ success: boolean; screenshots: string[] }> {
  console.log(`[TEST RUNNER] Running tests for component: ${component}`);
  
  // Create test steps for specific component
  const testSteps = createBasicTestSteps().filter(step => step.component === component);
  
  if (testSteps.length === 0) {
    console.log(`[TEST RUNNER] No tests found for component: ${component}`);
    return { success: true, screenshots: [] };
  }
  
  // Run the tests
  const result = await runComponentTests(
    page,
    testSteps,
    config.screenshotDir,
    0 // iteration
  );
  
  return result;
}
