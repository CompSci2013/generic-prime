/**
 * Pipeline Types
 * 
 * Type definitions for the automated testing pipeline
 */

export interface BugReport {
  /** Unique identifier for the bug */
  id: string;
  
  /** Description of the bug */
  description: string;
  
  /** Component where the bug was found */
  component: string;
  
  /** URL where the bug occurred */
  url: string;
  
  /** Screenshots associated with the bug */
  screenshots: string[];
  
  /** Current status of the bug */
  status: 'open' | 'in-progress' | 'resolved' | 'unresolved';
  
  /** Number of attempts made to fix this bug */
  attempts: number;
  
  /** Timestamp when the bug was first detected */
  detectedAt: Date;
  
  /** Timestamp when the bug was last checked */
  lastCheckedAt: Date;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface ScreenshotData {
  /** Path to the screenshot file */
  path: string;
  
  /** URL of the page when screenshot was taken */
  url: string;
  
  /** Timestamp when screenshot was taken */
  timestamp: Date;
  
  /** Component identifier */
  component: string;
  
  /** Test step identifier */
  step: string;
}

export interface ConsistencyCheckResult {
  /** Whether the check passed */
  passed: boolean;
  
  /** Description of the check */
  description: string;
  
  /** Details about what failed (if any) */
  details?: string;
  
  /** Screenshots for evidence */
  screenshots?: string[];
}

export interface PipelineState {
  /** Current iteration number */
  iteration: number;
  
  /** List of detected bugs */
  bugs: BugReport[];
  
  /** List of resolved bugs */
  resolvedBugs: BugReport[];
  
  /** List of unresolved bugs */
  unresolvedBugs: BugReport[];
  
  /** Whether the pipeline should continue */
  shouldContinue: boolean;
  
  /** Statistics */
  stats: {
    totalBugs: number;
    resolvedBugs: number;
    unresolvedBugs: number;
    screenshotsTaken: number;
  };
}

export interface TestStep {
  /** Unique identifier for the test step */
  id: string;
  
  /** Description of what this step does */
  description: string;
  
  /** Component being tested */
  component: string;
  
  /** Function to execute the test step */
  execute: (page: any, logger: any) => Promise<void>;
  
  /** Function to validate results */
  validate?: (page: any, logger: any) => Promise<boolean>;
}
