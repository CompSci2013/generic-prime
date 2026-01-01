#!/usr/bin/env node

/**
 * Pipeline Runner Script
 * 
 * Script to run the automated pipeline from command line
 */

import { chromium } from '@playwright/test';
import { runPipeline } from '../e2e/pipeline/pipeline';

async function main() {
  console.log('Starting Generic Prime Automated Pipeline...');
  
  // Launch browser in headless mode
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Run the pipeline
    await runPipeline(page);
    console.log('Pipeline completed successfully!');
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
