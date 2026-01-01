# Generic Prime Automated Testing Pipeline

This directory contains the automated testing pipeline for the Generic Prime application that implements a continuous bug detection and fixing cycle using visual analysis and AI.

## Pipeline Overview

The pipeline follows this cycle:
1. **Analysis Phase**: Start application in chrome-headless, exercise all controls, take screenshots
2. **Visual Analysis Phase**: Process screenshots for consistency and bugs
3. **AI Fixing Phase**: Use Qwen model to analyze intermediate file and fix bugs
4. **Verification Phase**: Re-test only the fixed portions
5. **Iteration Loop**: Repeat until no more bugs or max attempts reached

## Key Features

- Chrome-headless browser automation
- Full screenshot capture with URL metadata
- Consistency checking between related components
- AI-powered bug detection and fixing
- Iterative testing with bug tracking
- Integration with existing Playwright tests

## Directory Structure

```
e2e/pipeline/
├── README.md                   # This file
├── pipeline.ts                 # Main pipeline logic
├── screenshot-utils.ts         # Screenshot handling utilities
├── visual-analysis.ts          # Visual consistency checking
├── bug-reporter.ts             # Bug reporting and tracking
├── ai-fixer.ts                 # AI-based bug fixing interface
├── test-runner.ts              # Test execution and verification
├── config.ts                   # Pipeline configuration
├── types.ts                    # Type definitions
├── example-pipeline-test.spec.ts # Example usage
└── scripts/
    └── run-pipeline.ts         # Command-line runner script
```

## How It Works

### 1. Analysis Phase
- Starts chrome-headless browser
- Navigates to the main discover page (`/automobiles/discover`)
- Exercises all UI controls systematically
- Takes full-page screenshots at each step
- Adds URL metadata to each screenshot

### 2. Visual Analysis Phase
- Compares screenshots for consistency
- Checks URL synchronization between components
- Validates data consistency between related UI elements
- Identifies popup window synchronization issues
- Reports any inconsistencies as bugs

### 3. AI Fixing Phase
- Sends bug reports to AI model (Qwen)
- AI analyzes the issue and suggests fixes
- Applies suggested code changes
- Verifies the fixes work correctly

### 4. Verification Phase
- Re-tests only the components that were fixed
- Ensures the bug is resolved
- Updates bug tracking system

### 5. Iteration Loop
- Continues until no bugs remain or max iterations reached
- Tracks unresolved bugs that couldn't be fixed
- Generates comprehensive bug reports

## Usage

### Running from Command Line
```bash
# Make sure dev server is running first
npm run dev:server

# Run the pipeline
npm run pipeline
```

### Running as Playwright Test
```typescript
import { test } from '@playwright/test';
import { runPipeline } from './e2e/pipeline/pipeline';

test('Run automated pipeline', async ({ page }) => {
  await runPipeline(page);
});
```

## Configuration

The pipeline can be configured through `config.ts`:

```typescript
export interface PipelineConfig {
  baseUrl: string;           // Base URL for the application
  port: number;              // Port the application is running on
  maxIterations: number;     // Maximum number of iterations
  maxBugAttempts: number;    // Max attempts per bug before marking unresolved
  screenshotDir: string;     // Directory for screenshots
  bugReportPath: string;     // Path for bug reports
  aiModel: {                 // AI model configuration
    name: string;
    endpoint: string;
    apiKey?: string;
  };
  testSettings: {            // Test execution settings
    timeout: number;
    retryAttempts: number;
    headless: boolean;
  };
}
```

## Pipeline Components

### 1. Pipeline State Management
- Tracks bugs, resolved bugs, and unresolved bugs
- Manages iteration count and statistics
- Handles pipeline flow control

### 2. Screenshot Management
- Takes full-page screenshots with URL metadata
- Creates unique filenames for each screenshot
- Stores screenshots in organized directory structure

### 3. Visual Analysis
- URL consistency checking
- Data consistency validation
- Popup window synchronization
- Filter chip and URL state sync

### 4. Bug Reporting
- Creates detailed bug reports
- Tracks bug status (open, in-progress, resolved, unresolved)
- Generates comprehensive bug reports
- Handles bug attempt tracking

### 5. AI Integration
- Interfaces with Qwen model for analysis
- Processes bug reports through AI pipeline
- Applies suggested fixes to codebase
- Verifies fix effectiveness

## Test Coverage

The pipeline tests all major components:
- Query Control Panel
- Results Table
- Statistics Panel
- Picker Panel
- Filter Chip Management
- Pop-out Window Synchronization

## Output

The pipeline generates:
- Screenshots for each test step with URL metadata
- JSON bug reports
- Text-based bug summaries
- Pipeline execution statistics

## Requirements

- Playwright installed (already in devDependencies)
- Chrome-headless browser support
- Node.js 16+
- TypeScript 5+

## Best Practices

1. **Always run the dev server** before executing the pipeline
2. **Monitor the screenshots directory** for visual evidence of issues
3. **Review bug reports** to understand what was detected
4. **Configure appropriate timeouts** for your environment
5. **Set reasonable iteration limits** to prevent infinite loops
