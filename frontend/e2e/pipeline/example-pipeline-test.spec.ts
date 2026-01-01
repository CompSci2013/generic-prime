/**
 * Example Pipeline Test
 * 
 * Example of how to use the automated pipeline in a Playwright test
 */

import { test, expect } from '@playwright/test';
import { runPipeline, runPipelineWithConfig } from './pipeline';

test.describe('Automated Pipeline Test', () => {
  test('should run the automated pipeline', async ({ page }) => {
    // This test would typically be run with the dev server already running
    // The pipeline will exercise all controls and take screenshots
    
    console.log('Starting automated pipeline test...');
    
    // Run the pipeline - this will:
    // 1. Start chrome-headless
    // 2. Exercise all controls
    // 3. Take full screenshots at each step
    // 4. Add URL metadata to screenshots
    // 5. Check consistency between components
    // 6. Report any bugs found
    // 7. Process bugs through AI fixing cycle
    
    try {
      await runPipeline(page);
      console.log('Pipeline completed successfully');
    } catch (error) {
      console.error('Pipeline failed:', error);
      throw error;
    }
  });

  test('should run pipeline with custom configuration', async ({ page }) => {
    // Example of custom configuration
    const customConfig = {
      maxIterations: 5,
      maxBugAttempts: 2,
      screenshotDir: './screenshots/custom-pipeline',
      aiModel: {
        name: 'qwen',
        endpoint: 'https://api.example.com/v1/ai/fix',
        apiKey: process.env.AI_API_KEY || 'test-key'
      }
    };

    try {
      await runPipelineWithConfig(page, customConfig);
      console.log('Custom pipeline completed successfully');
    } catch (error) {
      console.error('Custom pipeline failed:', error);
      throw error;
    }
  });
});
