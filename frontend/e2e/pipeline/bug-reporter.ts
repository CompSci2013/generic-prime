/**
 * Bug Reporter
 * 
 * Component for tracking and reporting bugs detected during pipeline execution
 */

import { BugReport, PipelineState } from './types';
import fs from 'fs';
import path from 'path';

/**
 * Create a new bug report
 */
export function createBugReport(
  id: string,
  description: string,
  component: string,
  url: string,
  screenshots: string[]
): BugReport {
  return {
    id,
    description,
    component,
    url,
    screenshots,
    status: 'open',
    attempts: 0,
    detectedAt: new Date(),
    lastCheckedAt: new Date(),
    metadata: {}
  };
}

/**
 * Update bug report status
 */
export function updateBugStatus(
  bug: BugReport,
  status: 'open' | 'in-progress' | 'resolved' | 'unresolved'
): BugReport {
  return {
    ...bug,
    status,
    lastCheckedAt: new Date()
  };
}

/**
 * Increment bug attempt count
 */
export function incrementBugAttempts(bug: BugReport): BugReport {
  return {
    ...bug,
    attempts: bug.attempts + 1,
    lastCheckedAt: new Date()
  };
}

/**
 * Save bug report to file
 */
export async function saveBugReport(
  bugReport: BugReport,
  outputPath: string
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Save bug report as JSON
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(bugReport, null, 2)
  );
}

/**
 * Load bug reports from file
 */
export async function loadBugReports(
  inputPath: string
): Promise<BugReport[]> {
  try {
    const content = await fs.promises.readFile(inputPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // If file doesn't exist or can't be read, return empty array
    return [];
  }
}

/**
 * Update pipeline state with new bugs
 */
export function updatePipelineState(
  state: PipelineState,
  newBugs: BugReport[]
): PipelineState {
  const updatedBugs = [...state.bugs, ...newBugs];
  
  return {
    ...state,
    bugs: updatedBugs,
    stats: {
      ...state.stats,
      totalBugs: updatedBugs.length
    }
  };
}

/**
 * Filter bugs by status
 */
export function filterBugsByStatus(
  bugs: BugReport[],
  status: 'open' | 'in-progress' | 'resolved' | 'unresolved'
): BugReport[] {
  return bugs.filter(bug => bug.status === status);
}

/**
 * Check if a bug should be marked as unresolved
 */
export function shouldMarkAsUnresolved(
  bug: BugReport,
  maxAttempts: number
): boolean {
  return bug.attempts >= maxAttempts;
}

/**
 * Generate bug report summary
 */
export function generateBugReportSummary(
  bugs: BugReport[]
): string {
  const total = bugs.length;
  const open = filterBugsByStatus(bugs, 'open').length;
  const inProgress = filterBugsByStatus(bugs, 'in-progress').length;
  const resolved = filterBugsByStatus(bugs, 'resolved').length;
  const unresolved = filterBugsByStatus(bugs, 'unresolved').length;
  
  return `
Bug Report Summary:
===================
Total Bugs: ${total}
Open: ${open}
In Progress: ${inProgress}
Resolved: ${resolved}
Unresolved: ${unresolved}
  `.trim();
}

/**
 * Export bugs to a formatted report file
 */
export async function exportBugReport(
  bugs: BugReport[],
  outputPath: string
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create formatted report
  const reportContent = `
Generic Prime Bug Report
========================

Generated at: ${new Date().toISOString()}
Total Bugs: ${bugs.length}

Bugs:
${bugs.map(bug => `
ID: ${bug.id}
Description: ${bug.description}
Component: ${bug.component}
URL: ${bug.url}
Status: ${bug.status}
Attempts: ${bug.attempts}
Detected: ${bug.detectedAt.toISOString()}
Last Checked: ${bug.lastCheckedAt.toISOString()}
Screenshots: ${bug.screenshots.join(', ')}
`).join('\n')}
  `.trim();
  
  await fs.promises.writeFile(outputPath, reportContent);
}
