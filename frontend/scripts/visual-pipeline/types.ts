/**
 * Visual Testing Pipeline - Type Definitions
 *
 * Defines interfaces for bugs, reports, and pipeline state.
 */

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugCategory = 'layout' | 'state' | 'data' | 'visual' | 'sync';
export type BugStatus = 'open' | 'fixing' | 'fixed' | 'unresolved';
export type PipelinePhase = 'collect' | 'analyze' | 'report' | 'fix' | 'verify' | 'complete';

export interface FixAttempt {
  attempt_number: number;
  timestamp: string;
  coder_response: string;
  files_modified: string[];
  applied: boolean;
  verification_result?: 'pass' | 'fail';
  error_message?: string;
}

export interface Bug {
  bug_id: string;
  severity: BugSeverity;
  category: BugCategory;
  component: string;
  selector?: string;
  description: string;
  expected: string;
  actual: string;
  screenshot_id: string;
  screenshot_path: string;
  suggested_fix: string;
  fix_attempts: number;
  status: BugStatus;
  fix_history: FixAttempt[];
}

export interface BugReportSummary {
  total_bugs: number;
  by_severity: Record<BugSeverity, number>;
  by_category: Record<BugCategory, number>;
  by_component: Record<string, number>;
}

export interface BugReport {
  report_id: string;
  generated_at: string;
  cycle_number: number;
  application_url: string;
  screenshots_dir: string;
  total_screenshots: number;
  analysis_model: string;
  bugs: Bug[];
  summary: BugReportSummary;
}

export interface PipelineReport {
  pipeline_run_id: string;
  started_at: string;
  completed_at: string;
  total_cycles: number;
  fixed_bugs: Bug[];
  unresolved_bugs: Bug[];
  skipped_bugs: Bug[];
  final_status: 'clean' | 'partial' | 'blocked';
}

export interface PipelineState {
  phase: PipelinePhase;
  currentCycle: number;
  maxCycles: number;
  bugs: Bug[];
  fixedBugs: Bug[];
  unresolvedBugs: Bug[];
  screenshots: ScreenshotResult[];
}

export interface ExpectedState {
  panels?: string[];
  urlParams?: Record<string, string>;
  resultsCount?: { min: number; max: number };
  filterChips?: string[];
  popoutSync?: boolean;
}

export interface ScreenshotStep {
  id: string;
  description: string;
  capturePopouts: boolean;
  expectedState: ExpectedState;
  dependsOn?: string[];
}

export interface ScreenshotResult {
  step_id: string;
  screenshot_path: string;
  url: string;
  timestamp: string;
  expected_state: ExpectedState;
  popout_screenshots?: string[];
}

export interface VisionAnalysisResult {
  screenshot_id: string;
  overall_status: 'pass' | 'fail' | 'warning';
  bugs: Omit<Bug, 'fix_attempts' | 'status' | 'fix_history'>[];
  observations: string[];
}

export interface VerificationCheck {
  type: 'element_visible' | 'count_match' | 'text_match' | 'sync_match';
  selector: string;
  expected: unknown;
}

export interface VerificationPlan {
  bug_id: string;
  screenshot_steps: string[];
  verification_checks: VerificationCheck[];
}

export interface VerificationResult {
  bug_id: string;
  status: 'pass' | 'fail';
  checks_passed: number;
  checks_failed: number;
  error_message?: string;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  images?: string[];
  stream: boolean;
  options?: {
    temperature?: number;
    num_ctx?: number;
  };
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}
