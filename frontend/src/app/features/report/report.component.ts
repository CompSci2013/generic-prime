import { Component, OnInit } from '@angular/core';

/**
 * Report Component
 *
 * Displays Playwright test report instructions
 *
 * To view the live report after running tests:
 * 1. Run: npm run test:e2e (in the e2e container)
 * 2. The report is generated at: frontend/playwright-report/index.html
 * 3. Open in browser: file:///app/frontend/playwright-report/index.html
 *    (or navigate using your file explorer to the playwright-report directory)
 */
@Component({
  selector: 'app-report',
  template: `
    <div class="report-container">
      <div class="report-guide">
        <h1>Playwright Test Report</h1>
        <p>Test reports are generated after running E2E tests.</p>

        <h2>How to View the Report:</h2>
        <ol>
          <li>Run tests in the e2e container: <code>podman exec generic-prime-e2e bash -c "cd /app/frontend && npx playwright test"</code></li>
          <li>Once tests complete, the report is generated at: <code>frontend/playwright-report/index.html</code></li>
          <li>Open the report in your browser by navigating to the file directly</li>
        </ol>

        <h2>Latest Test Results:</h2>
        <p>Run the command above to generate the latest report.</p>
        <p><strong>Current Status:</strong> Check playwright-report/index.html after running tests</p>
      </div>
    </div>
  `,
  styles: [`
    .report-container {
      display: flex;
      width: 100%;
      height: 100vh;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }

    .report-guide {
      max-width: 900px;
      margin: auto;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h1 {
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }

    h2 {
      color: #555;
      margin-top: 30px;
    }

    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }

    ol {
      line-height: 1.8;
    }
  `]
})
export class ReportComponent implements OnInit {

  constructor() {}

  ngOnInit() {
    console.log('Playwright test report page loaded. See on-screen instructions for how to view reports.');
  }
}
