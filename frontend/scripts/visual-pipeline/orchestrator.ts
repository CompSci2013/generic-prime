/**
 * Visual Testing Pipeline - Orchestrator
 *
 * Main entry point that coordinates the full pipeline:
 * 1. Collect screenshots
 * 2. Analyze with vision model
 * 3. Generate bug reports
 * 4. Wait for Cline to apply fixes
 * 5. Verify fixes
 * 6. Loop until clean or max attempts reached
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from './config';
import { ScreenshotCollector } from './screenshot-collector';
import { VisionAnalyzer } from './vision-analyzer';
import { BugReportGenerator } from './bug-report-generator';
import { VerificationRunner } from './verification-runner';
import type { Bug, PipelineState, PipelineReport, BugStatus } from './types';

const FRONTEND_ROOT = path.resolve(__dirname, '../..');

export class PipelineOrchestrator {
  private state: PipelineState;
  private screenshotCollector: ScreenshotCollector;
  private visionAnalyzer: VisionAnalyzer;
  private bugReportGenerator: BugReportGenerator;
  private verificationRunner: VerificationRunner;
  private pipelineRunId: string;
  private startedAt: string;

  constructor() {
    this.pipelineRunId = `run-${uuidv4().slice(0, 8)}`;
    this.startedAt = new Date().toISOString();

    this.state = {
      phase: 'collect',
      currentCycle: 0,
      maxCycles: CONFIG.maxPipelineCycles,
      bugs: [],
      fixedBugs: [],
      unresolvedBugs: [],
      screenshots: []
    };

    this.screenshotCollector = new ScreenshotCollector();
    this.visionAnalyzer = new VisionAnalyzer();
    this.bugReportGenerator = new BugReportGenerator();
    this.verificationRunner = new VerificationRunner();
  }

  async run(): Promise<PipelineReport> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Visual Testing Pipeline - ${this.pipelineRunId}`);
    console.log(`Started: ${this.startedAt}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      while (this.state.currentCycle < this.state.maxCycles) {
        this.state.currentCycle++;
        console.log(`\n--- Cycle ${this.state.currentCycle}/${this.state.maxCycles} ---\n`);

        // Phase 1: Collect screenshots
        await this.runCollectPhase();

        // Phase 2: Analyze with vision model
        await this.runAnalyzePhase();

        // Phase 3: Generate reports
        await this.runReportPhase();

        // Check if we have any open bugs to fix
        const openBugs = this.state.bugs.filter(b => b.status === 'open');
        if (openBugs.length === 0) {
          console.log('\n✅ No bugs detected! Pipeline complete.\n');
          break;
        }

        // Phase 4: Wait for Cline to apply fixes
        const fixesApplied = await this.runFixPhase();

        if (!fixesApplied) {
          console.log('\n⚠️ Timeout waiting for fixes. Continuing to next cycle.\n');
          continue;
        }

        // Phase 5: Verify fixes
        await this.runVerifyPhase();

        // Check if we should continue
        const remainingBugs = this.state.bugs.filter(
          b => b.status === 'open' || b.status === 'fixing'
        );

        if (remainingBugs.length === 0) {
          console.log('\n✅ All bugs fixed! Pipeline complete.\n');
          break;
        }

        // Mark bugs with 3+ attempts as unresolved
        for (const bug of remainingBugs) {
          if (bug.fix_attempts >= CONFIG.maxFixAttempts) {
            bug.status = 'unresolved';
            this.state.unresolvedBugs.push(bug);
            console.log(`❌ Bug ${bug.bug_id} marked unresolved after ${bug.fix_attempts} attempts`);
          }
        }

        // Update bugs list to only include actionable bugs
        this.state.bugs = this.state.bugs.filter(
          b => b.status === 'open' || b.status === 'fixing'
        );

        if (this.state.bugs.length === 0) {
          console.log('\n⚠️ All remaining bugs marked as unresolved.\n');
          break;
        }
      }

      // Generate final report
      return this.generateFinalReport();
    } catch (error) {
      console.error('\n❌ Pipeline failed with error:', error);
      throw error;
    }
  }

  private async runCollectPhase(): Promise<void> {
    this.state.phase = 'collect';
    console.log('[Phase: COLLECT] Capturing screenshots...');

    this.state.screenshots = await this.screenshotCollector.collectAll();
    console.log(`[Phase: COLLECT] Captured ${this.state.screenshots.length} screenshots`);
  }

  private async runAnalyzePhase(): Promise<void> {
    this.state.phase = 'analyze';
    console.log('[Phase: ANALYZE] Analyzing screenshots with vision model...');

    const newBugs = await this.visionAnalyzer.analyzeAll(this.state.screenshots);

    // Merge with existing bugs (for re-verification cycles)
    for (const newBug of newBugs) {
      const existingBug = this.state.bugs.find(
        b => b.component === newBug.component &&
             b.category === newBug.category &&
             b.screenshot_id === newBug.screenshot_id
      );

      if (existingBug) {
        // Bug still exists, keep existing tracking
        continue;
      } else {
        // New bug found
        this.state.bugs.push(newBug);
      }
    }

    // Mark bugs as fixed if not found in new analysis
    for (const bug of this.state.bugs) {
      if (bug.status === 'fixing') {
        const stillExists = newBugs.some(
          nb => nb.component === bug.component &&
                nb.category === bug.category &&
                nb.screenshot_id === bug.screenshot_id
        );

        if (!stillExists) {
          bug.status = 'fixed';
          this.state.fixedBugs.push(bug);
          console.log(`✅ Bug ${bug.bug_id} verified as fixed`);
        }
      }
    }

    // Remove fixed bugs from active list
    this.state.bugs = this.state.bugs.filter(b => b.status !== 'fixed');

    console.log(`[Phase: ANALYZE] Found ${this.state.bugs.length} active bugs`);
  }

  private async runReportPhase(): Promise<void> {
    this.state.phase = 'report';
    console.log('[Phase: REPORT] Generating bug reports...');

    await this.bugReportGenerator.generateReport(
      this.state.bugs,
      this.state.currentCycle,
      this.state.screenshots.length
    );

    console.log('[Phase: REPORT] Reports generated');
  }

  private async runFixPhase(): Promise<boolean> {
    this.state.phase = 'fix';
    console.log('[Phase: FIX] Waiting for Cline to apply fixes...');
    console.log(`[Phase: FIX] Check: ${path.join(FRONTEND_ROOT, CONFIG.currentBugsFile)}`);

    // Mark open bugs as fixing
    for (const bug of this.state.bugs) {
      if (bug.status === 'open') {
        bug.status = 'fixing';
        bug.fix_attempts++;
      }
    }

    // Clear any existing flag
    await this.bugReportGenerator.clearFixesFlag();

    // Wait for Cline to create the flag file
    const flagCreated = await this.bugReportGenerator.waitForFixesFlag();

    if (flagCreated) {
      console.log('[Phase: FIX] Fixes applied signal received');

      // Record fix attempt for each bug
      for (const bug of this.state.bugs) {
        if (bug.status === 'fixing') {
          bug.fix_history.push({
            attempt_number: bug.fix_attempts,
            timestamp: new Date().toISOString(),
            coder_response: 'Applied by Cline',
            files_modified: [],
            applied: true
          });
        }
      }
    }

    return flagCreated;
  }

  private async runVerifyPhase(): Promise<void> {
    this.state.phase = 'verify';
    console.log('[Phase: VERIFY] Verifying applied fixes...');

    const bugsToVerify = this.state.bugs.filter(b => b.status === 'fixing');

    if (bugsToVerify.length === 0) {
      console.log('[Phase: VERIFY] No bugs to verify');
      return;
    }

    const results = await this.verificationRunner.verifyFixes(bugsToVerify);

    // Update bug statuses based on verification
    for (const result of results) {
      const bug = this.state.bugs.find(b => b.bug_id === result.bug_id);
      if (!bug) continue;

      const lastAttempt = bug.fix_history[bug.fix_history.length - 1];
      if (lastAttempt) {
        lastAttempt.verification_result = result.status;
        lastAttempt.error_message = result.error_message;
      }

      if (result.status === 'pass') {
        bug.status = 'fixed';
        this.state.fixedBugs.push(bug);
        console.log(`✅ Verified: ${bug.bug_id} is fixed`);
      } else {
        bug.status = 'open'; // Reset to open for next attempt
        console.log(`❌ Verification failed: ${bug.bug_id}`);
      }
    }

    // Remove fixed bugs from active list
    this.state.bugs = this.state.bugs.filter(b => b.status !== 'fixed');

    console.log(`[Phase: VERIFY] ${this.state.fixedBugs.length} bugs fixed, ${this.state.bugs.length} remaining`);
  }

  private generateFinalReport(): PipelineReport {
    this.state.phase = 'complete';
    const completedAt = new Date().toISOString();

    // Determine final status
    let finalStatus: 'clean' | 'partial' | 'blocked';
    if (this.state.bugs.length === 0 && this.state.unresolvedBugs.length === 0) {
      finalStatus = 'clean';
    } else if (this.state.fixedBugs.length > 0) {
      finalStatus = 'partial';
    } else {
      finalStatus = 'blocked';
    }

    const report: PipelineReport = {
      pipeline_run_id: this.pipelineRunId,
      started_at: this.startedAt,
      completed_at: completedAt,
      total_cycles: this.state.currentCycle,
      fixed_bugs: this.state.fixedBugs,
      unresolved_bugs: this.state.unresolvedBugs,
      skipped_bugs: this.state.bugs, // Any remaining open bugs
      final_status: finalStatus
    };

    // Write final report
    this.writeFinalReport(report);

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('PIPELINE COMPLETE');
    console.log(`${'='.repeat(60)}`);
    console.log(`Run ID: ${report.pipeline_run_id}`);
    console.log(`Duration: ${this.calculateDuration(this.startedAt, completedAt)}`);
    console.log(`Total Cycles: ${report.total_cycles}`);
    console.log(`Status: ${report.final_status.toUpperCase()}`);
    console.log(`  Fixed: ${report.fixed_bugs.length}`);
    console.log(`  Unresolved: ${report.unresolved_bugs.length}`);
    console.log(`  Skipped: ${report.skipped_bugs.length}`);
    console.log(`${'='.repeat(60)}\n`);

    return report;
  }

  private async writeFinalReport(report: PipelineReport): Promise<void> {
    const reportsDir = path.join(FRONTEND_ROOT, CONFIG.reportsDir);
    await fs.mkdir(reportsDir, { recursive: true });

    const reportPath = path.join(reportsDir, `pipeline-${this.pipelineRunId}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`[Orchestrator] Final report written to ${reportPath}`);
  }

  private calculateDuration(start: string, end: string): string {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// CLI entry point
if (require.main === module) {
  const orchestrator = new PipelineOrchestrator();

  orchestrator.run()
    .then((report) => {
      process.exit(report.final_status === 'clean' ? 0 : 1);
    })
    .catch((error) => {
      console.error('Pipeline failed:', error);
      process.exit(2);
    });
}
