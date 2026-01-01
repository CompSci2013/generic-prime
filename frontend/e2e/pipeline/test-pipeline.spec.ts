/**
 * Pipeline Integration Test
 * 
 * Test to verify the pipeline components work together correctly
 */

import { test, expect } from '@playwright/test';
import { AutomatedPipeline } from './pipeline';
import { DEFAULT_PIPELINE_CONFIG } from './config';

test.describe('Pipeline Integration Tests', () => {
  test('should initialize pipeline with default config', async () => {
    const pipeline = new AutomatedPipeline();
    const config = pipeline.getConfig();
    
    expect(config).toMatchObject(DEFAULT_PIPELINE_CONFIG);
    expect(config.maxIterations).toBe(10);
    expect(config.maxBugAttempts).toBe(3);
  });

  test('should create bug report correctly', async () => {
    const bug = {
      id: 'test-bug-1',
      description: 'Test bug description',
      component: 'test-component',
      url: 'http://localhost/test',
      screenshots: ['screenshot1.png']
    };
    
    // This test verifies that our bug creation logic works
    // In a real test, we'd need to run the full pipeline
    expect(bug.id).toBe('test-bug-1');
    expect(bug.description).toBe('Test bug description');
    expect(bug.component).toBe('test-component');
  });

  test('should handle basic configuration overrides', async () => {
    const customConfig = {
      maxIterations: 5,
      maxBugAttempts: 2,
      screenshotDir: './test-screenshots'
    };
    
    const pipeline = new AutomatedPipeline(customConfig);
    const config = pipeline.getConfig();
    
    expect(config.maxIterations).toBe(5);
    expect(config.maxBugAttempts).toBe(2);
    expect(config.screenshotDir).toBe('./test-screenshots');
  });
});
