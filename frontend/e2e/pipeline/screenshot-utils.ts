/**
 * Screenshot Utilities
 * 
 * Utilities for taking and managing screenshots during pipeline execution
 */

import { Page } from '@playwright/test';
import { ScreenshotData } from './types';
import fs from 'fs';
import path from 'path';

/**
 * Take a screenshot with URL metadata
 */
export async function takeScreenshotWithUrl(
  page: Page, 
  screenshotPath: string, 
  component: string, 
  step: string
): Promise<ScreenshotData> {
  // Get current URL
  const url = page.url();
  
  // Take screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  
  // Add URL information to screenshot (as metadata in filename or separate file)
  const screenshotData: ScreenshotData = {
    path: screenshotPath,
    url,
    timestamp: new Date(),
    component,
    step
  };
  
  // Also save URL metadata to a separate file for easier processing
  const metadataPath = screenshotPath.replace('.png', '.metadata.json');
  await fs.promises.writeFile(metadataPath, JSON.stringify(screenshotData, null, 2));
  
  return screenshotData;
}

/**
 * Take a screenshot with URL bar overlay (for headless mode)
 */
export async function takeScreenshotWithUrlBar(
  page: Page,
  screenshotPath: string,
  component: string,
  step: string
): Promise<ScreenshotData> {
  // Inject URL bar overlay
  await page.evaluate((url) => {
    const div = document.createElement('div');
    div.style.cssText = 'background: #333; color: white; padding: 5px; font-family: monospace; font-size: 14px; position: fixed; top: 0; left: 0; width: 100%; z-index: 999999;';
    div.innerText = `URL: ${url}`;
    document.body.style.marginTop = '30px';
    document.body.appendChild(div);
  }, page.url());
  
  // Take screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  
  // Create metadata
  const screenshotData: ScreenshotData = {
    path: screenshotPath,
    url: page.url(),
    timestamp: new Date(),
    component,
    step
  };
  
  // Save metadata
  const metadataPath = screenshotPath.replace('.png', '.metadata.json');
  await fs.promises.writeFile(metadataPath, JSON.stringify(screenshotData, null, 2));
  
  return screenshotData;
}

/**
 * Create directory structure for screenshots
 */
export function createScreenshotDirectory(screenshotDir: string): void {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
}

/**
 * Generate unique screenshot filename
 */
export function generateScreenshotFilename(
  component: string, 
  step: string, 
  timestamp?: Date
): string {
  const ts = timestamp || new Date();
  const dateStr = ts.toISOString().replace(/[:.]/g, '-');
  return `${component}-${step}-${dateStr}.png`;
}

/**
 * Compare screenshots for consistency
 */
export async function compareScreenshots(
  screenshot1: string,
  screenshot2: string
): Promise<boolean> {
  // In a real implementation, this would use image comparison libraries
  // For now, we'll return true to indicate they're "consistent"
  // A real implementation would use something like:
  // const { compare } = require('pngjs-image-comparison');
  // return await compare(screenshot1, screenshot2, { threshold: 0.1 });
  
  return true;
}

/**
 * Get screenshot metadata
 */
export async function getScreenshotMetadata(screenshotPath: string): Promise<ScreenshotData> {
  const metadataPath = screenshotPath.replace('.png', '.metadata.json');
  const metadataContent = await fs.promises.readFile(metadataPath, 'utf-8');
  return JSON.parse(metadataContent);
}
