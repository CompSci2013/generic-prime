/**
 * Visual Testing Pipeline - Bug Report Generator
 *
 * Generates JSON and Markdown reports from analyzed bugs.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, BASELINE_DATA } from './config';
import type { Bug, BugReport, BugReportSummary, BugSeverity, BugCategory } from './types';

const FRONTEND_ROOT = path.resolve(__dirname, '../..');

export class BugReportGenerator {
  async generateReport(
    bugs: Bug[],
    cycleNumber: number,
    totalScreenshots: number
  ): Promise<BugReport> {
    const report: BugReport = {
      report_id: `rpt-${uuidv4().slice(0, 8)}`,
      generated_at: new Date().toISOString(),
      cycle_number: cycleNumber,
      application_url: `${CONFIG.baseUrl}${CONFIG.discoverRoute}`,
      screenshots_dir: CONFIG.screenshotsDir,
      total_screenshots: totalScreenshots,
      analysis_model: CONFIG.visionModel,
      bugs,
      summary: this.generateSummary(bugs)
    };

    // Write JSON report
    await this.writeJsonReport(report, cycleNumber);

    // Write Markdown summary
    await this.writeMarkdownSummary(report, cycleNumber);

    // Write current bugs file for Cline
    await this.writeCurrentBugsFile(report);

    return report;
  }

  private generateSummary(bugs: Bug[]): BugReportSummary {
    const bySeverity: Record<BugSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    const byCategory: Record<BugCategory, number> = {
      layout: 0,
      state: 0,
      data: 0,
      visual: 0,
      sync: 0
    };

    const byComponent: Record<string, number> = {};

    for (const bug of bugs) {
      bySeverity[bug.severity]++;
      byCategory[bug.category]++;
      byComponent[bug.component] = (byComponent[bug.component] || 0) + 1;
    }

    return {
      total_bugs: bugs.length,
      by_severity: bySeverity,
      by_category: byCategory,
      by_component: byComponent
    };
  }

  private async writeJsonReport(report: BugReport, cycleNumber: number): Promise<void> {
    const reportsDir = path.join(FRONTEND_ROOT, CONFIG.bugReportsDir);
    await fs.mkdir(reportsDir, { recursive: true });

    const jsonPath = path.join(reportsDir, `cycle-${cycleNumber}-bugs.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    console.log(`[BugReportGenerator] JSON report written to ${jsonPath}`);
  }

  private async writeCurrentBugsFile(report: BugReport): Promise<void> {
    const currentBugsPath = path.join(FRONTEND_ROOT, CONFIG.currentBugsFile);
    await fs.mkdir(path.dirname(currentBugsPath), { recursive: true });
    await fs.writeFile(currentBugsPath, JSON.stringify(report, null, 2));

    console.log(`[BugReportGenerator] Current bugs file written to ${currentBugsPath}`);
  }

  private async writeMarkdownSummary(report: BugReport, cycleNumber: number): Promise<void> {
    const summariesDir = path.join(FRONTEND_ROOT, CONFIG.summariesDir);
    await fs.mkdir(summariesDir, { recursive: true });

    const markdown = this.generateMarkdown(report);
    const mdPath = path.join(summariesDir, `cycle-${cycleNumber}-summary.md`);
    await fs.writeFile(mdPath, markdown);

    console.log(`[BugReportGenerator] Markdown summary written to ${mdPath}`);
  }

  private generateMarkdown(report: BugReport): string {
    const { summary, bugs } = report;

    let md = `# Visual Testing Report - Cycle ${report.cycle_number}

**Generated**: ${report.generated_at}
**Report ID**: ${report.report_id}
**Application URL**: ${report.application_url}
**Analysis Model**: ${report.analysis_model}

---

## Summary

| Metric | Count |
|--------|-------|
| Total Screenshots | ${report.total_screenshots} |
| Total Bugs Found | ${summary.total_bugs} |
| Critical | ${summary.by_severity.critical} |
| High | ${summary.by_severity.high} |
| Medium | ${summary.by_severity.medium} |
| Low | ${summary.by_severity.low} |

### By Category

| Category | Count |
|----------|-------|
| Layout | ${summary.by_category.layout} |
| State | ${summary.by_category.state} |
| Data | ${summary.by_category.data} |
| Visual | ${summary.by_category.visual} |
| Sync | ${summary.by_category.sync} |

### By Component

| Component | Count |
|-----------|-------|
${Object.entries(summary.by_component)
  .map(([comp, count]) => `| ${comp} | ${count} |`)
  .join('\n')}

---

## Bugs Detail

`;

    if (bugs.length === 0) {
      md += `**No bugs detected!** The application passed all visual checks.\n`;
    } else {
      // Group bugs by severity for easier reading
      const severityOrder: BugSeverity[] = ['critical', 'high', 'medium', 'low'];

      for (const severity of severityOrder) {
        const severityBugs = bugs.filter(b => b.severity === severity);
        if (severityBugs.length === 0) continue;

        const emoji = {
          critical: '\u{1F534}', // Red circle
          high: '\u{1F7E0}',     // Orange circle
          medium: '\u{1F7E1}',   // Yellow circle
          low: '\u{1F7E2}'       // Green circle
        }[severity];

        md += `### ${emoji} ${severity.toUpperCase()} (${severityBugs.length})\n\n`;

        for (const bug of severityBugs) {
          md += this.formatBugMarkdown(bug);
        }
      }
    }

    md += `
---

## Expected Baseline Data

| Metric | Value |
|--------|-------|
| Total Records | ${BASELINE_DATA.totalRecords} |
| Manufacturers | ${BASELINE_DATA.manufacturers} |
| Manufacturer-Model Combos | ${BASELINE_DATA.manufacturerModelCombos} |
| Body Classes | ${BASELINE_DATA.bodyClasses} |

---

*Report generated by Visual Testing Pipeline*
`;

    return md;
  }

  private formatBugMarkdown(bug: Bug): string {
    const statusEmoji = {
      open: '\u{1F7E1}',      // Yellow
      fixing: '\u{1F535}',   // Blue
      fixed: '\u{2705}',     // Green check
      unresolved: '\u{274C}' // Red X
    }[bug.status];

    return `#### ${bug.bug_id} ${statusEmoji}

**Component**: \`${bug.component}\`
**Category**: ${bug.category}
**Status**: ${bug.status}
**Fix Attempts**: ${bug.fix_attempts}/3

**Description**: ${bug.description}

| | |
|---|---|
| **Expected** | ${bug.expected} |
| **Actual** | ${bug.actual} |

**Screenshot**: [${bug.screenshot_id}](${bug.screenshot_path})

**Suggested Fix**: ${bug.suggested_fix}

${bug.fix_history.length > 0 ? `
<details>
<summary>Fix History (${bug.fix_history.length} attempts)</summary>

${bug.fix_history.map(attempt => `
**Attempt ${attempt.attempt_number}** (${attempt.timestamp})
- Applied: ${attempt.applied ? 'Yes' : 'No'}
- Result: ${attempt.verification_result || 'Pending'}
${attempt.error_message ? `- Error: ${attempt.error_message}` : ''}
`).join('\n')}
</details>
` : ''}

---

`;
  }

  async clearFixesFlag(): Promise<void> {
    const flagPath = path.join(FRONTEND_ROOT, CONFIG.fixesAppliedFlag);
    try {
      await fs.unlink(flagPath);
    } catch {
      // Flag doesn't exist, that's fine
    }
  }

  async waitForFixesFlag(timeout: number = CONFIG.clineWaitTimeout): Promise<boolean> {
    const flagPath = path.join(FRONTEND_ROOT, CONFIG.fixesAppliedFlag);
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    console.log(`[BugReportGenerator] Waiting for Cline to apply fixes...`);
    console.log(`[BugReportGenerator] Create ${flagPath} when done`);

    while (Date.now() - startTime < timeout) {
      try {
        await fs.access(flagPath);
        // Flag exists, remove it and return
        await fs.unlink(flagPath);
        console.log(`[BugReportGenerator] Fixes applied signal received`);
        return true;
      } catch {
        // Flag doesn't exist yet, wait
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    console.log(`[BugReportGenerator] Timeout waiting for fixes`);
    return false;
  }
}

// CLI entry point
if (require.main === module) {
  const generator = new BugReportGenerator();

  // Sample bugs for testing
  const sampleBugs: Bug[] = [
    {
      bug_id: 'BUG-SYNC-001',
      severity: 'high',
      category: 'sync',
      component: 'statistics-panel',
      description: 'Pop-out statistics shows stale data after filter applied in main window',
      expected: 'Statistics should show 849 records matching Chevrolet filter',
      actual: 'Statistics shows 4887 records (total, ignoring filter)',
      screenshot_id: '12-popout-synced',
      screenshot_path: 'screenshots/captures/12-popout-synced.png',
      suggested_fix: 'Verify BroadcastChannel STATE_UPDATE is sent when filters change',
      fix_attempts: 0,
      status: 'open',
      fix_history: []
    }
  ];

  generator.generateReport(sampleBugs, 1, 13)
    .then((report) => {
      console.log(`\nReport generated: ${report.report_id}`);
      console.log(`Bugs: ${report.summary.total_bugs}`);
    })
    .catch((error) => {
      console.error('Report generation failed:', error);
      process.exit(1);
    });
}
