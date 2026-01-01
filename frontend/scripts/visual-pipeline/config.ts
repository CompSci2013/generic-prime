/**
 * Visual Testing Pipeline - Configuration
 *
 * Central configuration for the visual testing and self-healing pipeline.
 */

import type { ScreenshotStep } from './types';

export const CONFIG = {
  // Pipeline limits
  maxFixAttempts: 3,
  maxPipelineCycles: 5,

  // Timeouts (milliseconds)
  ollamaTimeout: 120000,      // 2 min per LLM call
  clineWaitTimeout: 300000,   // 5 min for Cline to apply fixes
  screenshotTimeout: 10000,   // 10 sec per screenshot
  networkIdleTimeout: 5000,   // 5 sec network idle wait

  // LLM Models
  visionModel: 'qwen3-vl:235b-a22b-instruct-q4_K_M',
  coderModel: 'qwen3-coder:30b-a3b-q8_0',

  // Ollama API
  ollamaHost: 'http://mimir:11434',
  ollamaEndpoint: '/api/generate',

  // Application
  baseUrl: 'http://localhost:4205',
  discoverRoute: '/automobiles/discover',

  // Paths (relative to frontend/)
  screenshotsDir: 'screenshots/captures',
  reportsDir: 'reports',
  bugReportsDir: 'reports/bug-reports',
  summariesDir: 'reports/summaries',
  currentBugsFile: 'reports/bug-reports/current-bugs.json',
  fixesAppliedFlag: 'reports/bug-reports/fixes-applied.flag',

  // Viewport
  viewport: {
    width: 1920,
    height: 1080
  },

  // Retry settings
  retries: {
    ollama: 3,
    screenshot: 2,
    backoffMultiplier: 2,
    initialBackoff: 1000
  }
} as const;

// Data test IDs for locating elements
export const SELECTORS = {
  // Panels
  queryControlPanel: '[data-testid="query-control-panel"]',
  queryPanel: '[data-testid="query-panel"]',
  pickerPanel: '[data-testid="picker-panel"]',
  statisticsPanel: '[data-testid="statistics-panel"]',
  resultsTablePanel: '[data-testid="basic-results-table-panel"]',
  resultsTable: '[data-testid="basic-results-table"]',

  // Query Control
  filterDropdown: '.filter-field-dropdown',
  dropdownPanel: '.p-dropdown-panel',
  dropdownItems: '.p-dropdown-items li',
  filterChips: '.filter-chip',
  activeFilters: '.active-filters .p-chip',

  // Dialogs
  dialog: '.p-dialog',
  dialogCheckboxes: '.p-dialog .p-checkbox',
  dialogApply: 'button:has-text("Apply")',
  dialogCancel: 'button:has-text("Cancel")',

  // Results
  resultsCount: '[data-testid="results-count"]',
  tableRows: '[data-testid="basic-results-table"] tbody tr',
  pagination: '.p-paginator',

  // Charts
  charts: '[data-testid^="chart-"]',

  // Pop-out buttons
  popoutQueryControl: '#popout-query-control',
  popoutStatistics: '#popout-statistics-panel',
  popoutResults: '#popout-basic-results-table',

  // Loading
  spinner: '.p-progressspinner'
} as const;

// Screenshot steps to execute
export const SCREENSHOT_STEPS: ScreenshotStep[] = [
  {
    id: '01-initial-load',
    description: 'Initial page load with all panels visible',
    capturePopouts: false,
    expectedState: {
      panels: ['query-control-panel', 'picker-panel', 'basic-results-table-panel', 'statistics-panel'],
      urlParams: {},
      resultsCount: { min: 4000, max: 5000 }
    }
  },
  {
    id: '02-filter-dropdown-open',
    description: 'Filter field dropdown opened',
    capturePopouts: false,
    expectedState: {
      panels: ['query-control-panel']
    }
  },
  {
    id: '03-manufacturer-dialog',
    description: 'Manufacturer filter dialog opened',
    capturePopouts: false,
    expectedState: {}
  },
  {
    id: '04-filter-applied',
    description: 'Chevrolet manufacturer filter applied',
    capturePopouts: false,
    expectedState: {
      urlParams: { manufacturer: 'Chevrolet' },
      resultsCount: { min: 800, max: 900 },
      filterChips: ['Chevrolet']
    }
  },
  {
    id: '05-year-range-dialog',
    description: 'Year range filter dialog opened',
    capturePopouts: false,
    expectedState: {}
  },
  {
    id: '06-combined-filters',
    description: 'Chevrolet + Year 2020-2024 filters applied',
    capturePopouts: false,
    expectedState: {
      urlParams: { manufacturer: 'Chevrolet', yearMin: '2020', yearMax: '2024' },
      resultsCount: { min: 10, max: 100 }
    }
  },
  {
    id: '07-results-table',
    description: 'Results table showing filtered data',
    capturePopouts: false,
    expectedState: {
      panels: ['basic-results-table-panel']
    }
  },
  {
    id: '08-pagination-page2',
    description: 'Navigated to page 2 of results',
    capturePopouts: false,
    expectedState: {
      urlParams: { page: '2' }
    }
  },
  {
    id: '09-picker-selection',
    description: 'Manufacturer-model selection in picker',
    capturePopouts: false,
    expectedState: {
      panels: ['picker-panel']
    }
  },
  {
    id: '10-statistics-charts',
    description: 'Statistics panel with rendered charts',
    capturePopouts: false,
    expectedState: {
      panels: ['statistics-panel']
    }
  },
  {
    id: '11-popout-opened',
    description: 'Statistics panel popped out to new window',
    capturePopouts: true,
    expectedState: {
      popoutSync: true
    }
  },
  {
    id: '12-popout-synced',
    description: 'Pop-out reflects main window filter state',
    capturePopouts: true,
    expectedState: {
      popoutSync: true
    },
    dependsOn: ['04-filter-applied']
  },
  {
    id: '13-filters-cleared',
    description: 'All filters cleared, back to initial state',
    capturePopouts: false,
    expectedState: {
      urlParams: {},
      resultsCount: { min: 4000, max: 5000 },
      filterChips: []
    }
  }
];

// Expected baseline data (from test-helpers.ts AUTOMOBILE_BASELINE)
export const BASELINE_DATA = {
  totalRecords: 4887,
  manufacturers: 72,
  manufacturerModelCombos: 881,
  bodyClasses: 12,
  sampleCounts: {
    chevrolet: 849,
    ford: 600,
    camaro: 59,
    years2020to2024: 290
  }
} as const;

// Vision model system prompt
export const VISION_SYSTEM_PROMPT = `You are a UI quality analyst for an Angular web application. You analyze screenshots to identify visual bugs, state inconsistencies, and UX issues.

The application is a Generic Discovery Framework for browsing automobile data. It has these main components:
- Query Control Panel: Filter dropdown, filter chips, dialogs for multiselect/range selection
- Picker Panel: Hierarchical manufacturer/model selection
- Results Table: Paginated data table with sorting
- Statistics Panel: Plotly charts showing data distribution

Key data-testid selectors:
- query-control-panel: Filter controls
- basic-results-table: Main data table (NOT results-table, which is pop-out only)
- picker-panel: Manufacturer/model picker
- statistics-panel: Charts container
- chart-{id}: Individual charts

When analyzing screenshots, look for:
1. UI INCONSISTENCIES: Misaligned elements, overlapping components, cut-off text
2. STATE MISMATCHES: Filter chips not matching URL params, counts not matching
3. DATA INTEGRITY: Empty tables when data expected, wrong filter values shown
4. VISUAL BUGS: Missing icons, broken layouts, invisible elements
5. CROSS-WINDOW SYNC: Pop-out windows should reflect main window state

For each issue found, provide:
- bug_id: Unique identifier (format: BUG-{category}-{number})
- severity: critical | high | medium | low
- category: layout | state | data | visual | sync
- component: Which component is affected
- description: Clear description of the issue
- expected: What should be visible/happening
- actual: What is actually visible/happening
- suggested_fix: High-level fix approach

Output valid JSON only.`;

// Coder model system prompt
export const CODER_SYSTEM_PROMPT = `You are a senior Angular developer fixing visual bugs in a PrimeNG-based application.

Project details:
- Angular 20.3.15 with standalone components
- PrimeNG 20.4.0 (note: Dropdown is now p-select, not p-dropdown)
- URL-first state management via UrlStateService
- Signal-based state management in ResourceManagementService
- BroadcastChannel for pop-out window communication

Key patterns:
- Never call router.navigate() directly, use UrlStateService
- OnPush change detection requires detectChanges() for pop-out windows
- All observable subscriptions cleaned up with takeUntil(destroy$)

Provide fixes in this format:

FILE: path/to/file.ts
\`\`\`typescript
// exact code to replace or add
\`\`\`

EXPLANATION:
Brief explanation of the fix.`;
