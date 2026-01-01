/**
 * Pipeline Configuration
 * 
 * Configuration settings for the automated testing pipeline
 */

export interface PipelineConfig {
  /** Base URL for the application */
  baseUrl: string;
  
  /** Port the application is running on */
  port: number;
  
  /** Maximum number of iterations for the bug fixing cycle */
  maxIterations: number;
  
  /** Maximum number of attempts per bug before marking as unresolved */
  maxBugAttempts: number;
  
  /** Screenshot directory path */
  screenshotDir: string;
  
  /** Bug report output path */
  bugReportPath: string;
  
  /** AI model configuration */
  aiModel: {
    name: string;
    endpoint: string;
    apiKey?: string;
  };
  
  /** Test execution settings */
  testSettings: {
    timeout: number;
    retryAttempts: number;
    headless: boolean;
  };
  
  /** Component test coverage */
  componentCoverage: {
    queryControl: boolean;
    resultsTable: boolean;
    statisticsPanel: boolean;
    pickerPanel: boolean;
  };
  
  /** Consistency check settings */
  consistencyChecks: {
    /** Check URL consistency with component states */
    urlConsistency: boolean;
    
    /** Check data consistency between related components */
    dataConsistency: boolean;
    
    /** Check pop-out window synchronization */
    popupSynchronization: boolean;
    
    /** Check filter chip and URL state sync */
    filterSync: boolean;
  };
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  baseUrl: 'http://localhost',
  port: 4205,
  maxIterations: 10,
  maxBugAttempts: 3,
  screenshotDir: './screenshots/pipeline',
  bugReportPath: './screenshots/pipeline/bug-report.json',
  aiModel: {
    name: 'qwen',
    endpoint: 'https://api.example.com/v1/ai/fix',
    apiKey: process.env['AI_API_KEY']
  },
  testSettings: {
    timeout: 10000,
    retryAttempts: 2,
    headless: true
  },
  componentCoverage: {
    queryControl: true,
    resultsTable: true,
    statisticsPanel: true,
    pickerPanel: true
  },
  consistencyChecks: {
    urlConsistency: true,
    dataConsistency: true,
    popupSynchronization: true,
    filterSync: true
  }
};
